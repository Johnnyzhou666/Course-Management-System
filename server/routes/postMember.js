const express = require("express");
const router = express.Router();
const { readJSONFile, writeJSONFile } = require("../utilFun/readwritejson");
const courseFile = "courses.json";
const membersFile = "members.json";
const checkValue = require("../utilFun/checkValue");
const loginMiddleware = require("../middle/loginMiddleware");
const roleMiddleware = require("../middle/roleMiddleware");

const canAccess = require("../middle/canAccess");
const bcrypt = require("bcrypt");

router.post(
  "/api/members",
  loginMiddleware,
  canAccess,
  roleMiddleware.requireRole("TA", "administrator"),
  async (req, res) => {
    try {
      const schema1 = {
        memberTermCode: {
          type: "number",
          required: true,
          maxLength: 4,
          max: 9999,
          min: 1,
        },
        memberSection: {
          type: "number",
          required: true,
          maxLength: 2,
          min: 1,
          max: 99,
        },
        membersinfo: { type: "array", required: true },
      };

      let schema2 = {
        firstName: { type: "string", required: true, maxLength: 200 },
        lastName: { type: "string", required: true, maxLength: 200 },
        username: { type: "string", required: true, maxLength: 50 },
        password: { type: "string", required: true, maxLength: 50 },
      };

      const members1 = checkValue(req.body, schema1);
      const courses = readJSONFile(courseFile);
      const { membersinfo } = members1;

      const ifExist = courses.find(
        (u) =>
          Number(u.termapp) === Number(members1.memberTermCode) &&
          Number(u.sectionapp) === Number(members1.memberSection)
      );
      if (!ifExist) {
        return res.status(400).json({
          success: false,
          message: "This course has not been registered.",
        });
      }

      let addedCount = 0;
      const ignored = [];
      let newMember = null;
      const everymembers = readJSONFile(membersFile);

      for (const mm of membersinfo) {
        const vaildmember = checkValue(mm, schema2);

        const usernameExists = everymembers.find(
          (u) =>
            Number(u.memberTermCode) === Number(members1.memberTermCode) &&
            Number(u.memberSection) === Number(members1.memberSection) &&
            String(u.username) === String(vaildmember.username)
        );

        if (usernameExists) {
          ignored.push(String(vaildmember.username));
          continue;
        } else {
          const hashash = await bcrypt.hash(vaildmember.password, 10);

          newMember = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            memberTermCode: members1.memberTermCode,
            memberSection: members1.memberSection,
            role: "student",

            memberId: vaildmember.username,
            firstName: vaildmember.firstName,
            lastName: vaildmember.lastName,
            username: vaildmember.username,
            password: hashash,
            firstLogin: true,
          };

          everymembers.push(newMember);
          writeJSONFile(membersFile, everymembers);
          addedCount++;
        }
      }

      res.json({
        message: "success",
        addedCount,
        ignored,
        newMember: newMember || null,
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
