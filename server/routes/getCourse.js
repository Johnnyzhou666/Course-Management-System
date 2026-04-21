const express = require("express");
const router = express.Router();

const { readJSONFile } = require("../utilFun/readwritejson");
const checkValue = require("../utilFun/checkValue");

const loginMiddleware = require("../middle/loginMiddleware");
const canAccess = require("../middle/canAccess");

const courseFile = "courses.json";

router.get(
  "/api/courses/:getAssignedcourse/:getAssignedcourseSection",
  loginMiddleware,
  canAccess,
  (req, res) => {
    try {
      const allcoursefile = readJSONFile(courseFile);

      const schema1 = {
        getAssignedcourse: {
          type: "number",
          required: true,
          maxLength: 4,
          min: 1,
          max: 9999,
        },
        getAssignedcourseSection: {
          type: "number",
          required: true,
          min: 1,
          max: 99,
        },
      };

      const check1 = checkValue(req.params, schema1);
      let { getAssignedcourse, getAssignedcourseSection } = check1;

      const existCourse = allcoursefile.find(
        (memexist) =>
          Number(memexist.termapp) === Number(getAssignedcourse) &&
          String(memexist.sectionapp) === String(getAssignedcourseSection)
      );

      if (!existCourse) {
        return res.status(404).json({
          success: false,
          message: `No courses found for termCode=${getAssignedcourse} courseSection=${getAssignedcourseSection}`,
        });
      }

      const filteredCourse = allcoursefile.filter(
        (c) =>
          Number(c.termapp) === Number(getAssignedcourse) &&
          Number(c.sectionapp) === Number(getAssignedcourseSection)
      );

      res.json({
        message: "success",
        getCourse: filteredCourse,
        success: true,
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
