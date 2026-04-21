const express = require("express");
const router = express.Router();
const { readJSONFile, writeJSONFile } = require("../utilFun/readwritejson");
const checkValue = require("../utilFun/checkValue");

const loginMiddleware = require("../middle/loginMiddleware");
const canAccess = require("../middle/canAccess");
const roleMiddleware = require("../middle/roleMiddleware");

const signupsFile = "signups.json";
const slotsFile = "slots.json";
const gradesFile = "grades.json";
const enrollmentsFile = "enrollments.json";

router.get(
  "/api/student/slots",
  loginMiddleware,
  canAccess,
  roleMiddleware.requireRole("student"),
  (req, res) => {
    try {
      const studentaccount = String(req.user.memberId || req.user.username);

      const enrollments = readJSONFile(enrollmentsFile) || [];
      const slots = readJSONFile(slotsFile) || [];
      const signups = readJSONFile(signupsFile) || [];
      const grades = readJSONFile(gradesFile) || [];

      const myEnrollments = enrollments.filter(
        (e) => String(e.memberId) === String(studentaccount)
      );

      if (myEnrollments.length === 0) {
        return res.json({
          success: true,
          message: "No signed up slots",
          slots: [],
        });
      }

      let result = [];

      for (const e of myEnrollments) {
        const sl = slots.find((s) => Number(s.id) === Number(e.slotID));
        const sheet = signups.find(
          (s) => Number(s.id) === Number(e.signupSheetID)
        );

        const gradeItem = grades.find(
          (g) =>
            String(g.memberId) === String(studentaccount) &&
            (Number(g.slotID) === Number(e.slotID) ||
              Number(g.signupSheetID) === Number(e.signupSheetID))
        );

        if (sl && sheet) {
          result.push({
            signupSheetID: e.signupSheetID,
            slotID: sl.id,
            begin: sl.begin,
            end: sl.end,
            course: sheet?.enrollcode || "",
            section: sheet?.enrollSection || "",
            grade: gradeItem ? gradeItem.finalGrade ?? gradeItem.grade : "",
            comment: gradeItem ? gradeItem.comment : "",
          });
        }
      }

      res.json({
        success: true,
        slots: result,
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err.message,
      });
    }
  }
);

router.get(
  "/api/student/emptySlots",
  loginMiddleware,
  canAccess,
  roleMiddleware.requireRole("student"),
  (req, res) => {
    try {
      const studentaccount = String(req.user.memberId || req.user.username);
      const slots = readJSONFile(slotsFile);
      const signups = readJSONFile(signupsFile);
      const enrollments = readJSONFile(enrollmentsFile);
      const available = slots
        .map((sl) => {
          const sheet = signups.find(
            (ss) => Number(ss.id) === Number(sl.signupsheetID)
          );

          const totalmember = enrollments.filter(
            (ee) => Number(ee.slotID) === Number(sl.id)
          ).length;
          const ifalreadyInThisSlot = enrollments.some(
            (ee) =>
              Number(ee.slotID) === Number(sl.id) &&
              String(ee.memberId) === studentaccount
          );
          const ifalreadyInThisSheet = enrollments.some(
            (ee) =>
              Number(ee.signupSheetID) === Number(sl.signupsheetID) &&
              String(ee.memberId) === studentaccount
          );
          const startnow = new Date();
          const beginTime1 = new Date(sl.begin);
          const leftHours = (beginTime1 - startnow) / (1000 * 60 * 60);
          const telltimeIsValid = leftHours >= 1;
          return {
            slotID: sl.id,
            signupSheetID: sl.signupsheetID,
            begin: sl.begin,
            end: sl.end,
            maxmembers: sl.maxmembers,
            currentMembers: totalmember,
            enrollcode: sheet?.enrollcode || "",
            enrollSection: sheet?.enrollSection || "",
            slotisAvailable: totalmember < sl.maxmembers,
            ifalreadyInThisSlot,
            telltimeIsValid,
            ifalreadyInThisSheet,
          };
        })
        .filter(
          (sl) =>
            sl.slotisAvailable &&
            !sl.ifalreadyInThisSlot &&
            sl.telltimeIsValid &&
            !sl.ifalreadyInThisSheet
        );

      res.json({
        success: true,
        slots: available,
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err.message,
      });
    }
  }
);

router.delete(
  "/api/student/leaveSlot/:slotID",
  loginMiddleware,
  canAccess,
  roleMiddleware.requireRole("student"),
  (req, res) => {
    try {
      const studentaccount = req.user.memberId || req.user.username;

      const valid1 = checkValue(
        { slotID: req.params.slotID },
        { slotID: { type: "number", required: true, min: 1 } }
      );

      const slotID = valid1.slotID;

      const slots = readJSONFile(slotsFile);
      let enrollments = readJSONFile(enrollmentsFile);

      const slot = slots.find((s) => Number(s.id) === slotID);

      if (!slot) {
        return res.json({
          success: false,
          message: "Slot not found",
        });
      }

      const now = new Date();
      const beginTime = new Date(slot.begin);
      const diffHours = (beginTime - now) / (1000 * 60 * 60);

      if (diffHours < 2) {
        return res.json({
          success: false,
          message: "You cannot leave a slot less than 2 hours before it starts",
        });
      }
      const slothasEnrollment = enrollments.some(
        (e) =>
          Number(e.slotID) === slotID &&
          String(e.memberId) === String(studentaccount)
      );

      if (!slothasEnrollment) {
        return res.json({
          success: false,
          message: "You are not in this slot",
        });
      }

      enrollments = enrollments.filter(
        (ee) =>
          !(
            Number(ee.slotID) === slotID &&
            String(ee.memberId) === String(studentaccount)
          )
      );

      writeJSONFile(enrollmentsFile, enrollments);

      res.json({
        success: true,
        message: "Slot left successfully",
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
