const express = require("express");
const router = express.Router();

const loginMiddleware = require("../middle/loginMiddleware");
const canAccess = require("../middle/canAccess");
const roleMiddleware = require("../middle/roleMiddleware");

const { readJSONFile, writeJSONFile } = require("../utilFun/readwritejson");
const checkValue = require("../utilFun/checkValue");

const courseFile = "courses.json";

router.post(
  "/api/courses",
  loginMiddleware,
  canAccess,
  roleMiddleware.requireRole("TA", "administrator"),
  (req, res) => {
    try {
      const schema = {
        termapp: {
          type: "number",
          required: true,
          maxLength: 4,
          min: 1,
          max: 9999,
        },
        courseapp: {
          type: "string",
          required: true,
          maxLength: 100,
        },
        sectionapp: {
          type: "number",
          maxLength: 2,
          required: true,
          min: 1,
          max: 99,
        },
      };

      const course = checkValue(req.body, schema);

      const courses = readJSONFile(courseFile);

      if (
        courses.find(
          (u) =>
            u.termapp === course.termapp && u.sectionapp === course.sectionapp
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "This course has been registered.",
        });
      }

      const newcourse = { id: Date.now(), ...course };
      courses.push(newcourse);
      writeJSONFile(courseFile, courses);

      res.json({
        success: true,
        message: "success",
        course: newcourse,
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
