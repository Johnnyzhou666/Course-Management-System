const express = require("express");
const router = express.Router();
const { readJSONFile, writeJSONFile } = require("../utilFun/readwritejson");

const membersFile = "members.json";
const enrollmentsFile = "enrollments.json";

const checkValue = require("../utilFun/checkValue");
const canAccess = require("../middle/canAccess");
const loginMiddleware = require("../middle/loginMiddleware");
const roleMiddleware = require("../middle/roleMiddleware");

router.delete(
  "/api/members/:dememcode/:dememsection",
  loginMiddleware,
  canAccess,
  roleMiddleware.requireRole("TA", "administrator"),
  (req, res) => {
    try {
      const schema1 = {
        dememcode: { type: "number", required: true, min: 1, max: 9999 },
        dememsection: { type: "number", required: true, min: 1, max: 99 },
      };

      const schema2 = {
        deleteinfo: { type: "array", required: true },
      };

      const check1 = checkValue(req.params, schema1);
      const check2 = checkValue(req.body, schema2);

      const { dememcode, dememsection } = check1;
      const { deleteinfo } = check2;

      const allmembersfile = readJSONFile(membersFile);
      const enrollments = readJSONFile(enrollmentsFile);

      const existMember1 = allmembersfile.find(
        (mem) =>
          Number(mem.memberTermCode) === Number(dememcode) &&
          Number(mem.memberSection) === Number(dememsection)
      );

      if (!existMember1) {
        return res.status(404).json({
          success: false,
          message: `No Member found for termCode=${dememcode}, section=${dememsection}`,
        });
      }

      const invalidIds = deleteinfo.filter(
        (id) =>
          !allmembersfile.some(
            (mem) =>
              Number(mem.memberTermCode) === Number(dememcode) &&
              Number(mem.memberSection) === Number(dememsection) &&
              String(mem.memberId) === String(id)
          )
      );

      if (invalidIds.length > 0) {
        return res.status(404).json({
          success: false,
          message: `Deletion failed. All members must exist in this course before deletion. Not found: ${invalidIds.join(
            ", "
          )}`,
        });
      }

      for (const memId of deleteinfo) {
        const ifhasEnrollment = enrollments.some(
          (e) => String(e.memberId) === String(memId)
        );

        if (ifhasEnrollment) {
          return res.status(400).json({
            success: false,
            message: `Cannot delete member ${memId}; enrollment record exists.`,
          });
        }
      }

      const section = Number(dememsection);

      const toDelete = allmembersfile.filter(
        (m) =>
          m.memberTermCode == dememcode &&
          m.memberSection == section &&
          deleteinfo.includes(String(m.memberId))
      );

      const remaining = allmembersfile.filter(
        (m) =>
          !(
            m.memberTermCode == dememcode &&
            m.memberSection == section &&
            deleteinfo.includes(String(m.memberId))
          )
      );

      writeJSONFile(membersFile, remaining);

      return res.json({
        success: true,
        message: "Members deleted successfully",
        deletedCount: toDelete.length,
        deletedIds: toDelete.map((m) => m.memberId),
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
  }
);

module.exports = router;
