const express = require("express");
const router = express.Router();
const { readJSONFile } = require("../utilFun/readwritejson");
const slotsFile = "slots.json";
const checkValue = require("../utilFun/checkValue");
router.get("/api/slots/:getSlotID", (req, res) => {
  try {
    const allslotsfile = readJSONFile(slotsFile);
    let { getSlotID } = req.params;
    const schema = {
      getSlotID: { type: "number", required: true },
    };
    const slotsschema = checkValue({ getSlotID: getSlotID }, schema);
    const existSlot = allslotsfile.find(
      (slotexist) =>
        Number(slotexist.signupsheetID) === Number(slotsschema.getSlotID)
    );

    if (!existSlot) {
      return res.status(404).json({
        success: false,
        message: `No slots found for id=${slotsschema.getSlotID}`,
      });
    }

    let filteredSlot = allslotsfile.filter(
      (slotexist) =>
        Number(slotexist.signupsheetID) === Number(slotsschema.getSlotID)
    );

    res.json({
      message: "success",
      slots: filteredSlot,
      success: true,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});
module.exports = router;
