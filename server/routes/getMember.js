const express = require("express");
const router = express.Router();

const { readJSONFile } = require("../utilFun/readwritejson");
const checkValue = require("../utilFun/checkValue");

const loginMiddleware = require("../middle/loginMiddleware");
const canAccess = require("../middle/canAccess");
const roleMiddleware = require("../middle/roleMiddleware");

const membersFile = "members.json";

router.get(
  "/api/members/:memberTermCode/:memberSection",
  loginMiddleware,
  canAccess,
  roleMiddleware.requireRole("TA", "administrator"),
  (req, res) => {
    try {
      const schema = {
        memberTermCode: { type: "number", required: true, min: 1, max: 9999 },
        memberSection: { type: "number", required: true, min: 1, max: 99 },
      };

      const allmembersfile = readJSONFile(membersFile);

      let { memberTermCode, memberSection } = checkValue(req.params, schema);

      let role = undefined;
      if (req.query.role !== undefined) {
        const roleSchema = {
          role: { type: "string", required: false, maxLength: 20 },
        };
        const checked = checkValue(req.query, roleSchema);
        role = checked.role;
      }

      let filtered = allmembersfile.filter(
        (memexist) =>
          Number(memexist.memberTermCode) === Number(memberTermCode) &&
          Number(memexist.memberSection) === Number(memberSection)
      );

      if (role && role.trim() !== "") {
        filtered = filtered.filter((m) => m.role === role.trim());
      }

      res.json({
        message: "success",
        total: filtered.length,
        members: filtered,
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
