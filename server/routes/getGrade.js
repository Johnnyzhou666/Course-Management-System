const express = require("express");
const router = express.Router();
const { readJSONFile } = require("../utilFun/readwritejson");

const slotsFile = "slots.json";
const gradesFile = "grades.json";
const membersFile = "members.json";
const enrollmentsFile = "enrollments.json";
const checkValue = require("../utilFun/checkValue");

const loginMiddleware = require("../middle/loginMiddleware");
const canAccess = require("../middle/canAccess");
const roleMiddleware = require("../middle/roleMiddleware");

router.get(
  "/api/memberslot/:getSlotmem",
  loginMiddleware,
  canAccess,
  roleMiddleware.requireRole("TA", "administrator"),
  (req, res) => {
    try {
      const schema = { getSlotmem: { type: "string", required: true } };
      const check1 = checkValue(req.params, schema);
      const slotid = Number(check1.getSlotmem);
      if (isNaN(slotid)) {
        return res.status(400).json({
          success: false,
          message: "Invalid slot id",
        });
      }
      const getMems = readJSONFile(slotsFile);
      const slotgrades = readJSONFile(gradesFile);
      const allMembers = readJSONFile(membersFile);
      const enrollments = readJSONFile(enrollmentsFile);
      const slotmemexist = getMems.find((ss) => Number(ss.id) === slotid);

      if (!slotmemexist) {
        return res.status(404).json({
          success: false,
          message: "Slots not found",
        });
      }
      const slotEnrollments = enrollments.filter(
        (ee) => ee.slotID !== undefined && Number(ee.slotID) === slotid
      );

      if (slotEnrollments.length === 0) {
        return res.json({
          success: true,
          message: "No member in this slot",
          member: [],
        });
      }

      const memberlistinfo = slotEnrollments.map((en) => {
        const memberId = en.memberId;
        const gradesbookitem = slotgrades.find(
          (gra) =>
            String(gra.memberId) === String(memberId) &&
            Number(gra.signupSheetID) === Number(slotmemexist.signupsheetID) &&
            Number(gra.slotID) === slotid
        );

        const memberInfo = allMembers.find(
          (m) => String(m.memberId) === String(memberId)
        );

        return {
          memberId,
          slotID: slotid,
          firstName: memberInfo ? memberInfo.firstName : "",
          lastName: memberInfo ? memberInfo.lastName : "",
          signupSheetID: slotmemexist.signupsheetID,
          grade: gradesbookitem ? gradesbookitem.grade : "",
          finalGrade: gradesbookitem
            ? gradesbookitem.finalGrade ?? gradesbookitem.grade
            : "",
          comment: gradesbookitem ? gradesbookitem.comment : "",
          taName: gradesbookitem ? gradesbookitem.lastModifiedBy ?? "" : "",
          gradedTime: gradesbookitem
            ? gradesbookitem.lastModifiedTime ?? ""
            : "",
        };
      });

      res.json({
        success: true,
        message: "success",
        member: memberlistinfo,
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err.message,
      });
    }
  }
);

module.exports = router;
