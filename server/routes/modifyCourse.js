const express = require("express");
const router = express.Router();

const { readJSONFile, writeJSONFile } = require("../utilFun/readwritejson");
const checkValue = require("../utilFun/checkValue");

const loginMiddleware = require("../middle/loginMiddleware");
const canAccess = require("../middle/canAccess");
const roleMiddleware = require("../middle/roleMiddleware");

const courseFile = "courses.json";
const signupFile = "signups.json";

router.put(
  "/api/courses",
  loginMiddleware,
  canAccess,
  roleMiddleware.requireRole("TA", "administrator"),
  (req, res) => {
    try {
      const schema = {
        oldTermapp: { type: "number", required: true, min: 1, max: 9999 },
        oldSectionapp: { type: "number", required: true, min: 1, max: 99 },
        termapp: { type: "number", required: true, min: 1, max: 9999 },
        courseapp: { type: "string", required: true, maxLength: 100 },
        sectionapp: { type: "number", required: true, min: 1, max: 99 },
      };

      const body = checkValue(req.body, schema);

      const { oldTermapp, oldSectionapp, termapp, courseapp, sectionapp } =
        body;

      const courses = readJSONFile(courseFile);
      const signups = readJSONFile(signupFile);

      const course = courses.find(
        (c) =>
          Number(c.termapp) === Number(oldTermapp) &&
          Number(c.sectionapp) === Number(oldSectionapp)
      );

      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      const ifhasSignup = signups.some(
        (s) =>
          Number(s.enrollcode) === Number(oldTermapp) &&
          Number(s.enrollSection) === Number(oldSectionapp)
      );

      if (ifhasSignup) {
        if (termapp !== oldTermapp || sectionapp !== oldSectionapp) {
          return res.status(400).json({
            success: false,
            message:
              "Course has signup sheets; only the course name is editable.",
          });
        }

        course.courseapp = courseapp;

        writeJSONFile(courseFile, courses);

        return res.json({
          success: true,
          message: "Course name revised",
          course,
        });
      }

      const cannotchange = courses.find(
        (c) =>
          !(
            Number(c.termapp) === Number(oldTermapp) &&
            Number(c.sectionapp) === Number(oldSectionapp)
          ) &&
          Number(c.termapp) === Number(termapp) &&
          Number(c.sectionapp) === Number(sectionapp)
      );

      if (cannotchange) {
        return res.status(400).json({
          success: false,
          message:
            "Update conflict: can not update a existed combination of Term code and section",
        });
      }

      course.termapp = termapp;
      course.sectionapp = sectionapp;
      course.courseapp = courseapp;

      writeJSONFile(courseFile, courses);

      res.json({
        success: true,
        message: "Course updated",
        course,
      });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
);

module.exports = router;
