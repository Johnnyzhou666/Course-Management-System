const express = require("express");
const router = express.Router();
const { readJSONFile } = require("../utilFun/readwritejson");

const slotsFile = "slots.json";
const gradesFile = "grades.json";
const membersFile = "members.json";
const enrollmentsFile = "enrollments.json";
const loginMiddleware = require("../middle/loginMiddleware");
const canAccess = require("../middle/canAccess");
const roleMiddleware = require("../middle/roleMiddleware");
router.get(
  "/api/currentSlot",
  loginMiddleware,
  canAccess,
  roleMiddleware.requireRole("TA", "administrator"),
  (req, res) => {
    try {
      res.setHeader("Cache-Control", "no-store");
      res.setHeader("Pragma", "no-cache");

      const allSlots = readJSONFile(slotsFile);
      const gradesbook = readJSONFile(gradesFile);
      const members = readJSONFile(membersFile);
      const enrollments = readJSONFile(enrollmentsFile);

      const now = Date.now();

      const presentslot = allSlots
        .sort((a, b) => new Date(a.begin) - new Date(b.begin))
        .find((s) => {
          const b = new Date(s.begin).getTime();
          const e = new Date(s.end).getTime();
          return now >= b && now < e;
        });

      if (!presentslot) {
        return res.json({
          success: false,
          message: "No current slot",
          slot: null,
          member: [],
        });
      }

      const slotEnrollments = enrollments.filter(
        (e) => Number(e.slotID) === Number(presentslot.id)
      );

      if (slotEnrollments.length === 0) {
        return res.json({
          success: true,
          message: "Current slot found but no member",
          slot: presentslot,
          member: [],
        });
      }

      const memberlistinfo = [];

      for (let enroll of slotEnrollments) {
        const memberId = enroll.memberId;
        const gradeItem = gradesbook.find(
          (g) =>
            String(g.memberId) === String(memberId) &&
            Number(g.slotID) === Number(presentslot.id)
        );

        const memberInfo = members.find(
          (m) => String(m.memberId) === String(memberId)
        );

        memberlistinfo.push({
          memberId,
          slotID: presentslot.id,
          firstName: memberInfo?.firstName || "",
          lastName: memberInfo?.lastName || "",
          signupSheetID: presentslot.signupsheetID,
          grade: gradeItem?.grade || "",
          finalGrade: gradeItem?.finalGrade ?? gradeItem?.grade ?? "",
          comment: gradeItem?.comment || "",
          taName: gradeItem?.lastModifiedBy || "",
          gradedTime: gradeItem?.lastModifiedTime || "",
        });
      }

      return res.json({
        success: true,
        message: "Current slot found",
        slot: presentslot,
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
