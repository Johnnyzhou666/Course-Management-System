const express = require("express");
const router = express.Router();

const { readJSONFile } = require("../utilFun/readwritejson");
const checkValue = require("../utilFun/checkValue");

const loginMiddleware = require("../middle/loginMiddleware");
const canAccess = require("../middle/canAccess");
const roleMiddleware = require("../middle/roleMiddleware");

const gradesFile = "grades.json";

router.get(
  "/api/Grades/audit/:memberId/:signupId",
  loginMiddleware,
  canAccess,
  roleMiddleware.requireRole("TA", "administrator"),
  (req, res) => {
    try {
      const schema = {
        memberId: { type: "string", required: true, maxLength: 50 },
        signupId: { type: "number", required: true, min: 1 },
      };

      const { memberId, signupId } = checkValue(req.params, schema);

      const gradesbook = readJSONFile(gradesFile);

      const item = gradesbook.find(
        (g) =>
          String(g.memberId) === String(memberId) &&
          Number(g.id) === Number(signupId)
      );

      if (!item) {
        return res.status(404).json({
          success: false,
          message: "No grade record found",
        });
      }

      res.json({
        success: true,
        audit: item.audit || null,
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
