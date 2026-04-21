const express = require("express");
const router = express.Router();
const { readJSONFile } = require("../utilFun/readwritejson");

const signupsFile = "signups.json";
const slotsFile = "slots.json";
const enrollmentsFile = "enrollments.json";

router.get("/api/signups", (req, res) => {
  try {
    const signups = readJSONFile(signupsFile);
    const slots = readJSONFile(slotsFile);
    const combined = signups.map((ss) => {
      const thisthatSlots = slots.filter(
        (slsl) => Number(slsl.signupsheetID) === Number(ss.id)
      );
      return { ...ss, slots: thisthatSlots };
    });

    res.json(combined);
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Cannot load sign-ups",
    });
  }
});

router.get("/api/signups/visitor", (req, res) => {
  try {
    const signups = readJSONFile(signupsFile);
    const slots = readJSONFile(slotsFile);
    const enrollments = readJSONFile(enrollmentsFile);
    const visitoroutcome = signups.map((sheet) => {
      const sheetSlots = slots
        .filter((slsl) => Number(slsl.signupsheetID) === Number(sheet.id))
        .map((slsl) => {
          const beginDate = new Date(slsl.begin);

          const date = beginDate.toISOString().slice(0, 10);
          const time =
            beginDate.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }) +
            " - " +
            new Date(slsl.end).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });

          const slotEnrollments = enrollments.filter(
            (ee) => Number(ee.slotID) === Number(slsl.id)
          );

          return {
            date,
            time,
            max: slsl.maxmembers,
            signups: slotEnrollments.length,
          };
        });

      return {
        id: sheet.id,
        enrollcode: sheet.enrollcode,
        enrollSection: sheet.enrollSection,
        task: sheet.task,
        slots: sheetSlots,
      };
    });

    res.json(visitoroutcome);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;
