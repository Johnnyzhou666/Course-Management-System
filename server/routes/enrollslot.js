const express = require("express");
const router = express.Router();
const { readJSONFile, writeJSONFile } = require("../utilFun/readwritejson");

const slotsFile = "slots.json";
const membersFile = "members.json";
const enrollmentsFile = "enrollments.json";

const checkValue = require("../utilFun/checkValue");

const loginMiddleware = require("../middle/loginMiddleware");
const canAccess = require("../middle/canAccess");
const roleMiddleware = require("../middle/roleMiddleware");

router.post(
  "/api/student/slots/:slotId",
  loginMiddleware,
  canAccess,
  roleMiddleware.requireRole("student"),
  (req, res) => {
    try {
      const studentaccount = String(req.user.memberId || req.user.username);

      const valid1 = checkValue(
        { slotId: req.params.slotId },
        { slotId: { type: "number", required: true, min: 1 } }
      );

      const slotId = valid1.slotId;

      const slots = readJSONFile(slotsFile) || [];
      let enrollments = readJSONFile(enrollmentsFile) || [];

      const slot = slots.find((s) => Number(s.id) === Number(slotId));

      if (!slot) {
        return res.status(404).json({
          success: false,
          message: "Slot not found.",
        });
      }

      const signupSheetID = Number(slot.signupsheetID);

      const now = new Date();
      const beginTime = new Date(slot.begin);
      const leftHours = (beginTime - now) / (1000 * 60 * 60);

      if (leftHours < 1) {
        return res.status(400).json({
          success: false,
          message:
            "This slot starts in less than one hour. Sign-up not allowed.",
        });
      }
      const ifalreadyInThisSheet = enrollments.some(
        (e) =>
          Number(e.signupSheetID) === signupSheetID &&
          String(e.memberId) === studentaccount
      );

      if (ifalreadyInThisSheet) {
        return res.status(400).json({
          success: false,
          message:
            "You have already signed up for a slot in this signup sheet.",
        });
      }
      const ifalreadyInSlot = enrollments.some(
        (e) =>
          Number(e.slotID) === Number(slotId) &&
          String(e.memberId) === studentaccount
      );

      if (ifalreadyInSlot) {
        return res.status(400).json({
          success: false,
          message: "You have already signed up for this slot.",
        });
      }

      const totalCount = enrollments.filter(
        (e) => Number(e.slotID) === Number(slotId)
      ).length;

      if (totalCount >= Number(slot.maxmembers)) {
        return res.status(400).json({
          success: false,
          message: "This slot is full.",
        });
      }

      enrollments.push({
        signupSheetID,
        slotID: slotId,
        memberId: studentaccount,
      });

      writeJSONFile(enrollmentsFile, enrollments);

      res.json({
        success: true,
        message: "Sign-up successful.",
        slot,
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
