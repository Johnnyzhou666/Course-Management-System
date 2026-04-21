const express = require("express");
const router = express.Router();

const { readJSONFile } = require("../utilFun/readwritejson");
const checkValue = require("../utilFun/checkValue");

const loginMiddleware = require("../middle/loginMiddleware");
const canAccess = require("../middle/canAccess");
const roleMiddleware = require("../middle/roleMiddleware");

const slotsFile = "slots.json";

router.get(
  "/api/slots/:id/next",
  loginMiddleware,
  canAccess,
  roleMiddleware.requireRole("TA", "administrator"),
  (req, res) => {
    try {
      const schema = { id: { type: "string", required: true } };
      const validID1 = checkValue(req.params, schema);

      const slotid = Number(validID1.id);

      if (isNaN(slotid)) {
        return res.status(400).json({
          success: false,
          message: "Invalid slot id",
        });
      }

      const allSlotsfile = readJSONFile(slotsFile);

      const slotexist = allSlotsfile.find((s) => Number(s.id) === slotid);
      if (!slotexist) {
        return res.status(404).json({
          success: false,
          message: "Slot not found",
        });
      }

      const sameSheetSlots = allSlotsfile
        .filter(
          (s) => Number(s.signupsheetID) === Number(slotexist.signupsheetID)
        )
        .sort((a, b) => new Date(a.begin) - new Date(b.begin));

      let nextSlot = null;

      for (let i = 0; i < sameSheetSlots.length; i++) {
        if (Number(sameSheetSlots[i].id) === slotid) {
          nextSlot = sameSheetSlots[i + 1] || null;
          break;
        }
      }

      if (!nextSlot) {
        return res.json({
          success: false,
          message: "This is the last slot",
          slot: null,
        });
      }

      return res.json({
        success: true,
        message: "Next slot found",
        slot: nextSlot,
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
  }
);

module.exports = router;
