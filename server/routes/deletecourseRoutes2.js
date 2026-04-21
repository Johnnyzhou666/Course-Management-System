const express = require("express");
const router = express.Router();

const checkValue = require("../utilFun/checkValue");
const { readJSONFile, writeJSONFile } = require("../utilFun/readwritejson");

const loginMiddleware = require("../middle/loginMiddleware");
const canAccess = require("../middle/canAccess");
const roleMiddleware = require("../middle/roleMiddleware");

const courseFile = "courses.json";
const signupFile = "signups.json";

router.delete(
  "/api/courses",
  loginMiddleware,
  canAccess,
  roleMiddleware.requireRole("TA", "administrator"),
  async (req, res) => {
    try {
      const schema = {
        deleteCode: {
          type: "number",
          required: true,
          maxLength: 4,
          min: 1,
          max: 9999,
        },
        deleteSection: { type: "number", maxLength: 2, min: 1, max: 99 },
      };

      const check1 = checkValue(req.body, schema);
      const { deleteCode, deleteSection } = check1;

      let courses = readJSONFile(courseFile);
      let signups = readJSONFile(signupFile);

      const existingCourse = courses.find(
        (course) =>
          Number(course.termapp) === Number(deleteCode) &&
          Number(course.sectionapp) === Number(deleteSection)
      );

      if (!existingCourse) {
        return res.status(404).json({
          success: false,
          message: `Course not found with term code: ${deleteCode}`,
        });
      }

      const existingSignup = signups.some(
        (signup) =>
          Number(signup.enrollcode) === Number(deleteCode) &&
          Number(signup.enrollSection) === Number(deleteSection)
      );

      if (existingSignup) {
        return res.status(400).json({
          success: false,
          message: "Cannot delete a course with a sign up sheet",
        });
      }

      courses = courses.filter(
        (course) =>
          !(
            Number(course.termapp) === Number(deleteCode) &&
            Number(course.sectionapp) === Number(deleteSection)
          )
      );

      writeJSONFile(courseFile, courses);

      res.json({
        success: true,
        message: "Course deleted successfully",
        deletedCourse: existingCourse,
      });
    } catch (error) {
      console.error("Error deleting course:", error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
);

module.exports = router;
