const express = require("express");
const router = express.Router();

const { readJSONFile } = require("../utilFun/readwritejson");
const checkValue = require("../utilFun/checkValue");

const loginMiddleware = require("../middle/loginMiddleware");
const canAccess = require("../middle/canAccess");
const roleMiddleware = require("../middle/roleMiddleware");

const slotsFile = "slots.json";

router.get(
  "/api/slots/:id/prev",
  loginMiddleware,
  canAccess,
  roleMiddleware.requireRole("TA", "administrator"),
  (req, res) => {
    try {
      const schema = {
        id: { type: "number", required: true, min: 1 },
      };

      const validID = checkValue(req.params, schema);
      const slotid = validID.id;

      const allSlotsfile = readJSONFile(slotsFile);

      const slotexist = allSlotsfile.find(
        (s) => Number(s.id) === Number(slotid)
      );

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

      let prevSlot = null;

      for (let i = 0; i < sameSheetSlots.length; i++) {
        if (Number(sameSheetSlots[i].id) === Number(slotid)) {
          prevSlot = sameSheetSlots[i - 1] || null;
          break;
        }
      }

      if (!prevSlot) {
        return res.json({
          success: false,
          message: "This is the first slot",
          slot: null,
        });
      }

      return res.json({
        success: true,
        message: "Previous slot found",
        slot: prevSlot,
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
