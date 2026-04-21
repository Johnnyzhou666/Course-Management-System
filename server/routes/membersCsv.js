const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const fs = require("fs/promises");
const { readJSONFile, writeJSONFile } = require("../utilFun/readwritejson");
const checkValue = require("../utilFun/checkValue");
const loginMiddleware = require("../middle/loginMiddleware");
const canAccess = require("../middle/canAccess");
const roleMiddleware = require("../middle/roleMiddleware");

const bcrypt = require("bcrypt");

const membersFile = "members.json";
const courseFile = "courses.json";

router.post(
  "/api/members/csv",
  loginMiddleware,
  canAccess,
  roleMiddleware.requireRole("TA", "administrator"),
  upload.single("file"),
  async (req, res) => {
    try {
      const schemaHeader = {
        memberTermCode: { type: "number", required: true, min: 1, max: 9999 },
        memberSection: { type: "number", required: true, min: 1, max: 99 },
      };

      const headerInfo = checkValue(req.body, schemaHeader);
      const { memberTermCode, memberSection } = headerInfo;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "CSV file is required",
        });
      }

      if (!req.file.originalname.toLowerCase().endsWith(".csv")) {
        return res.status(400).json({
          success: false,
          message: "Invalid file type. Please upload a CSV file.",
        });
      }

      const alloweduploadTypes = ["text/csv", "application/vnd.ms-excel"];
      if (!alloweduploadTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: "Invalid file type. Only CSV files are allowed.",
        });
      }

      const courses = readJSONFile(courseFile);

      const existsCourse = courses.find(
        (c) =>
          Number(c.termapp) === Number(memberTermCode) &&
          Number(c.sectionapp) === Number(memberSection)
      );

      if (!existsCourse) {
        return res.status(400).json({
          success: false,
          message: "This course has not been registered.",
        });
      }

      const csvTextcontent = await fs.readFile(req.file.path, "utf-8");
      const linespage = csvTextcontent.trim().split("\n");

      const allMembers = readJSONFile(membersFile);

      let addedCount = 0;
      const ignored = [];

      const schemaCsv = {
        lastName: { type: "string", required: true, maxLength: 200 },
        firstName: { type: "string", required: true, maxLength: 200 },
        username: { type: "string", required: true, maxLength: 50 },
        password: { type: "string", required: true, maxLength: 50 },
      };

      for (const oneline of linespage) {
        const parts = oneline.split(",");

        if (parts.length < 4) {
          ignored.push("unknown (invalid format)");
          continue;
        }

        const testtempCSV = {
          lastName: parts[0].trim(),
          firstName: parts[1].trim(),
          username: parts[2].trim(),
          password: parts[3].trim(),
        };

        let validVALUE;
        try {
          validVALUE = checkValue(testtempCSV, schemaCsv);
        } catch (err) {
          ignored.push(`${testtempCSV.username || "unknown"} (invalid format)`);
          continue;
        }

        const { lastName, firstName, username, password } = validVALUE;

        const existsvalid = allMembers.find(
          (m) =>
            Number(m.memberTermCode) === Number(memberTermCode) &&
            Number(m.memberSection) === Number(memberSection) &&
            m.username === username
        );

        if (existsvalid) {
          ignored.push(username);
          continue;
        }

        const hashash = await bcrypt.hash(password, 10);

        const newMember = {
          id: Date.now() + Math.floor(Math.random() * 1000),
          memberTermCode: Number(memberTermCode),
          memberSection: Number(memberSection),
          firstName,
          lastName,
          memberId: username,
          role: "student",
          username,
          password: hashash,
          firstLogin: true,
        };

        allMembers.push(newMember);
        addedCount++;
      }

      if (addedCount > 0) {
        writeJSONFile(membersFile, allMembers);
      }

      return res.json({
        success: true,
        addedCount,
        ignored,
      });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
);

module.exports = router;
