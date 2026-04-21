const express = require("express");
const router = express.Router();
const { readJSONFile, writeJSONFile } = require("../utilFun/readwritejson");
const checkValue = require("../utilFun/checkValue");

const loginMiddleware = require("../middle/loginMiddleware");
const canAccess = require("../middle/canAccess");
const roleMiddleware = require("../middle/roleMiddleware");

const slotsFile = "slots.json";
const enrollmentsFile = "enrollments.json";

router.delete(
  "/api/slots/:slotid",
  loginMiddleware,
  canAccess,
  roleMiddleware.requireRole("TA", "administrator"),
  (req, res) => {
    try {
      const schema = { slotid: { type: "number", required: true } };
      const validID = checkValue(req.params, schema);

      const slotid = Number(validID.slotid);
      if (isNaN(slotid)) {
        return res.status(400).json({
          success: false,
          message: "Invalid slot id",
        });
      }

      const allSlots = readJSONFile(slotsFile);

      const slotexist = allSlots.find((s) => Number(s.id) === slotid);

      if (!slotexist) {
        return res.status(404).json({
          success: false,
          message: "Slot not found",
        });
      }

      const enrollments = readJSONFile(enrollmentsFile);

      const hasEnrollment = enrollments.some(
        (e) => Number(e.slotID) === slotid
      );

      if (hasEnrollment) {
        return res.status(400).json({
          success: false,
          message: "Cannot delete slot because students have signed up for it",
        });
      }

      const remainSlots = allSlots.filter((s) => Number(s.id) !== slotid);
      writeJSONFile(slotsFile, remainSlots);

      res.json({
        success: true,
        message: "Slot deleted",
        deletedSlot: slotexist,
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
