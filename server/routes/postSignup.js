const express = require("express");
const router = express.Router();
const { readJSONFile, writeJSONFile } = require("../utilFun/readwritejson");
const loginMiddleware = require("../middle/loginMiddleware");
const canAccess = require("../middle/canAccess");
const roleMiddleware = require("../middle/roleMiddleware");

const courseFile = "courses.json";
const signupsFile = "signups.json";
const checkValue = require("../utilFun/checkValue");
router.post(
  "/api/signups",
  loginMiddleware,
  canAccess,
  roleMiddleware.requireRole("TA", "administrator"),
  (req, res) => {
    try {
      const schema = {
        enrollcode: {
          type: "number",
          required: true,
          maxLength: 4,
          min: 1,
          max: 9999,
        },

        enrollSection: {
          type: "number",
          required: true,
          maxLength: 2,
          min: 1,
          max: 99,
        },
        task: {
          type: "string",
          required: true,
          maxLength: 100,
        },
      };
      const enrollcode = req.body.enrollcode;
      const enrollSection = req.body.enrollSection;
      const task = req.body.task;
      let begintime = req.body.begin;
      let endtime = req.body.end;
      const eet = { enrollcode, enrollSection, task };

      const signupeet = checkValue(eet, schema);
      const begin = new Date(begintime);
      const end = new Date(endtime);
      if (isNaN(begin.getTime()) || isNaN(end.getTime()) || end <= begin) {
        return res.status(400).json({ message: "Invalid timestamps" });
      }
      const courses = readJSONFile(courseFile);

      const ifExist = courses.find(
        (u) =>
          Number(u.termapp) === Number(signupeet.enrollcode) &&
          Number(u.sectionapp) === Number(signupeet.enrollSection)
      );
      if (!ifExist) {
        return res.status(400).json({
          success: false,
          message: "This course has not been registered.",
        });
      }
      const signfiles = readJSONFile(signupsFile);
      if (
        signfiles.find(
          (u) =>
            Number(u.enrollcode) === Number(signupeet.enrollcode) &&
            Number(u.enrollSection) === Number(signupeet.enrollSection) &&
            u.task === signupeet.task
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "This assignment has already been registered.",
        });
      }

      const begintoString = begin.toISOString();
      const endtoString = end.toISOString();
      const newSignup = {
        id: Date.now() + Math.floor(Math.random() * 1000) + 1,
        ...signupeet,
        begin: begintoString,
        end: endtoString,
      };
      signfiles.push(newSignup);
      writeJSONFile(signupsFile, signfiles);

      res.json({ success: true, message: "success", signup: newSignup });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
);
module.exports = router;
