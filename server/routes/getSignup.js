const express = require("express");
const router = express.Router();
const { readJSONFile } = require("../utilFun/readwritejson");
const checkValue = require("../utilFun/checkValue");

const signupsFile = "signups.json";

router.get("/api/signups/:searchTermCode/:searchSection", (req, res) => {
  try {
    const allsignups = readJSONFile(signupsFile);

    const schema = {
      searchTermCode: { type: "number", required: true, min: 1, max: 9999 },
      searchSection: { type: "number", required: true, min: 1, max: 99 },
    };

    const { searchTermCode, searchSection } = checkValue(req.params, schema);

    const filtered = allsignups.filter(
      (signexist) =>
        Number(signexist.enrollcode) === Number(searchTermCode) &&
        Number(signexist.enrollSection) === Number(searchSection)
    );

    if (filtered.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No signup sheets found for termCode=${searchTermCode}, section=${searchSection}`,
      });
    }

    res.json({
      message: "success",
      signups: filtered,
      success: true,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;
