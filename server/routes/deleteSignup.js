const express = require("express");
const router = express.Router();

const { readJSONFile, writeJSONFile } = require("../utilFun/readwritejson");
const checkValue = require("../utilFun/checkValue");

const loginMiddleware = require("../middle/loginMiddleware");
const canAccess = require("../middle/canAccess");
const roleMiddleware = require("../middle/roleMiddleware");

const signupsFile = "signups.json";
const slotsFile = "slots.json";
const enrollmentsFile = "enrollments.json";

router.delete(
  "/api/signups",
  loginMiddleware,
  canAccess,
  roleMiddleware.requireRole("TA", "administrator"),
  (req, res) => {
    try {
      const schema = {
        enrollcode: { type: "number", required: true },
        enrollSection: { type: "number", required: true },
        task: { type: "string", required: true },
      };

      const signupeet = checkValue(req.query, schema);

      let signupsread = readJSONFile(signupsFile);
      let slots = readJSONFile(slotsFile);
      let enrollments = readJSONFile(enrollmentsFile);

      const ifsignupExist = signupsread.find(
        (s) =>
          Number(s.enrollcode) === Number(signupeet.enrollcode) &&
          Number(s.enrollSection) === Number(signupeet.enrollSection) &&
          s.task.trim().toLowerCase() === signupeet.task.trim().toLowerCase()
      );

      if (!ifsignupExist) {
        return res.status(404).json({
          success: false,
          message:
            "signup sheet not found or section code wrong or task does not exist",
        });
      }

      const findslotForSheet = slots.filter(
        (sl) => Number(sl.signupsheetID) === Number(ifsignupExist.id)
      );

      const slotIDs = findslotForSheet.map((sl) => Number(sl.id));

      const existEnrollments = enrollments.some((e) =>
        slotIDs.includes(Number(e.slotID))
      );

      if (existEnrollments) {
        return res.status(400).json({
          success: false,
          message: "Cannot delete: some slots already have student sign-ups.",
        });
      }

      const remainSlots = slots.filter(
        (sl) => Number(sl.signupsheetID) !== Number(ifsignupExist.id)
      );
      writeJSONFile(slotsFile, remainSlots);

      const remainSignups = signupsread.filter(
        (s) => Number(s.id) !== Number(ifsignupExist.id)
      );
      writeJSONFile(signupsFile, remainSignups);

      res.json({
        success: true,
        message: "signup sheet is deleted",
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
