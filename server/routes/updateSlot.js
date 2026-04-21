const express = require("express");
const router = express.Router();
const { readJSONFile, writeJSONFile } = require("../utilFun/readwritejson");
const slotsFile = "slots.json";
const checkValue = require("../utilFun/checkValue");
const canAccess = require("../middle/canAccess");
const loginMiddleware = require("../middle/loginMiddleware");
const roleMiddleware = require("../middle/roleMiddleware");

router.put(
  "/api/slots/:updateslot",
  loginMiddleware,
  canAccess,
  roleMiddleware.requireRole("TA", "administrator"),
  (req, res) => {
    try {
      const schema1 = {
        updateslot: { type: "string", required: true },
      };
      const vaildID = checkValue(req.params, schema1);
      const enrollments = readJSONFile("enrollments.json");
      function isValidDate(Adate) {
        const datetimeForm = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/;
        if (!datetimeForm.test(Adate)) return false;
        const ifdate = new Date(Adate);
        return !isNaN(ifdate.getTime());
      }

      const allSlotsfile = readJSONFile(slotsFile);
      const slotexist = allSlotsfile.find(
        (s) => Number(s.id) === Number(vaildID.updateslot)
      );

      if (!slotexist)
        return res
          .status(404)
          .json({ success: false, message: "Slot not found" });
      const schemaBody1 = {
        updatebegin: { type: "string", required: false, maxLength: 40 },
        updateend: { type: "string", required: false, maxLength: 40 },
        updatemaxmember: { type: "number", required: false, min: 1, max: 99 },
      };

      const validBody1 = checkValue(req.body, schemaBody1);
      const { updatebegin, updateend, updatemaxmember } = validBody1;

      if (
        (updatebegin && !isValidDate(updatebegin)) ||
        (updateend && !isValidDate(updateend)) ||
        (updatebegin &&
          updateend &&
          new Date(updateend) <= new Date(updatebegin))
      ) {
        return res.status(400).json({
          success: false,
          message: "Start time must be earlier than end time",
        });
      }

      if (updatemaxmember !== undefined) {
        const currentCount = enrollments.filter(
          (e) => Number(e.slotID) === Number(slotexist.id)
        ).length;

        if (currentCount > Number(updatemaxmember)) {
          return res.status(400).json({
            success: false,
            message:
              "New max members amount cannot be less than current sign-ups.",
          });
        }

        slotexist.maxmembers = Number(updatemaxmember);
      }
      let newBegin = slotexist.begin;
      let newEnd = slotexist.end;

      if (updatebegin) newBegin = new Date(updatebegin).toISOString();
      if (updateend) newEnd = new Date(updateend).toISOString();

      const otherSlots = allSlotsfile.filter(
        (s) =>
          Number(s.signupsheetID) === Number(slotexist.signupsheetID) &&
          Number(s.id) !== Number(slotexist.id)
      );

      function ifisOverlap(begin1, end1, begin2, end2) {
        return !(end1 <= begin2 || begin1 >= end2);
      }

      for (const sl of otherSlots) {
        const b1 = new Date(newBegin);
        const e1 = new Date(newEnd);
        const b2 = new Date(sl.begin);
        const e2 = new Date(sl.end);

        if (ifisOverlap(b1, e1, b2, e2)) {
          return res.status(400).json({
            success: false,
            message: "New modified slot time overlaps another slot.",
          });
        }
      }

      slotexist.begin = newBegin;
      slotexist.end = newEnd;

      writeJSONFile(slotsFile, allSlotsfile);

      const members = enrollments
        .filter((ee) => Number(ee.slotID) === Number(slotexist.id))
        .map((ee) => ee.memberId);

      if (updatebegin || updateend || updatemaxmember !== undefined) {
        res.json({
          success: true,
          message:
            members.length > 0
              ? "Slot updated"
              : "Slot updated, but no members in this slot",
          members,
        });
      } else {
        res.json({
          success: false,
          message: "Nothing changed",
        });
      }
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
);

module.exports = router;
