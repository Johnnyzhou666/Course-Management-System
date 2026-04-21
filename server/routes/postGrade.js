const express = require("express");
const router = express.Router();
const { readJSONFile, writeJSONFile } = require("../utilFun/readwritejson");

const checkValue = require("../utilFun/checkValue");
const loginMiddleware = require("../middle/loginMiddleware");
const canAccess = require("../middle/canAccess");
const roleMiddleware = require("../middle/roleMiddleware");

const gradesFile = "grades.json";
const enrollmentsFile = "enrollments.json";

router.post(
  "/api/Grades",
  loginMiddleware,
  canAccess,
  roleMiddleware.requireRole("TA", "administrator"),
  (req, res) => {
    try {
      let originalGrade = 0;

      const schema = {
        GradesMemberID: { type: "string", required: true, maxLength: 8 },
        GradeSignup: { type: "number", required: true },
        SlotID: { type: "number", required: true },
        GradesMm: {
          type: "number",
          required: true,
          min: 0,
          max: 999,
        },
        Bonus: { type: "number", required: false, min: 0, max: 999 },
        Penalty: { type: "number", required: false, min: -999, max: 999 },
        Commentarea: { type: "string", required: true, maxLength: 500 },
      };

      const check1 = checkValue(req.body, schema);

      if (!check1.Commentarea.trim()) {
        return res.status(400).json({
          success: false,
          message: "Any grade modification requires a non-empty comment.",
        });
      }
      const originalpoint = Number(check1.GradesMm);
      const bonusmarks = Number(check1.Bonus || 0);
      const penaltymark = Number(check1.Penalty || 0);
      let finalGrade = originalpoint + bonusmarks - penaltymark;
      finalGrade = Math.max(0, Math.min(999, finalGrade));
      const gradesbook = readJSONFile(gradesFile);
      const enrollments = readJSONFile(enrollmentsFile);

      const gradememberexist1 = enrollments.some(
        (e) =>
          String(e.memberId) === String(check1.GradesMemberID) &&
          Number(e.slotID) === Number(check1.SlotID)
      );

      if (!gradememberexist1) {
        return res.status(404).json({
          success: false,
          message: "This student does not enroll in this slot.",
        });
      }

      const TeachA = req.user.username || req.user.email;

      let gradefindexist2 = gradesbook.find(
        (ss) =>
          String(ss.memberId) === String(check1.GradesMemberID) &&
          Number(ss.slotID) === Number(check1.SlotID) &&
          Number(ss.signupSheetID) === Number(check1.GradeSignup)
      );

      if (!gradefindexist2) {
        gradefindexist2 = {
          grade: originalpoint,
          bonus: bonusmarks,
          penalty: penaltymark,
          finalGrade: finalGrade,
          memberId: check1.GradesMemberID,
          signupSheetID: check1.GradeSignup,
          slotID: check1.SlotID,
          comment: check1.Commentarea,
          lastModifiedBy: TeachA,
          lastModifiedTime: new Date().toISOString(),
        };

        gradesbook.push(gradefindexist2);
        writeJSONFile(gradesFile, gradesbook);
      } else {
        originalGrade = gradefindexist2.finalGrade ?? gradefindexist2.grade;
        gradefindexist2.grade = originalpoint;
        gradefindexist2.bonus = bonusmarks;
        gradefindexist2.penalty = penaltymark;
        gradefindexist2.finalGrade = finalGrade;
        gradefindexist2.comment = gradefindexist2.comment
          ? gradefindexist2.comment + " | " + check1.Commentarea
          : check1.Commentarea;

        gradefindexist2.lastModifiedBy = TeachA;
        gradefindexist2.lastModifiedTime = new Date().toISOString();

        writeJSONFile(gradesFile, gradesbook);
      }

      res.json({
        success: true,
        message: "success",
        originalGrade: originalGrade,
      });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
);

module.exports = router;
