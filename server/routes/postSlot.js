const express = require("express");
const router = express.Router();
const { readJSONFile, writeJSONFile } = require("../utilFun/readwritejson");
const checkValue = require("../utilFun/checkValue");

const loginMiddleware = require("../middle/loginMiddleware");
const canAccess = require("../middle/canAccess");
const roleMiddleware = require("../middle/roleMiddleware");

const slotsFile = "slots.json";
const signupsFile = "signups.json";

router.post(
  "/api/slots",
  loginMiddleware,
  canAccess,
  roleMiddleware.requireRole("TA", "administrator"),
  (req, res) => {
    try {
      const schema = {
        signupsheetID: { type: "string", required: true, min: 1 },
        slotduration: { type: "number", required: true, min: 1 },
        maxmembers: { type: "number", required: true, min: 1 },
        numslots: { type: "number", required: true, min: 1 },
        begintime: { type: "string", required: true },
      };

      const body = {
        signupsheetID: req.body.signupsheetID,
        slotduration: req.body.slotduration,
        maxmembers: req.body.maxmembers,
        numslots: req.body.numslots,
        begintime: req.body.begintime || req.body.start,
      };

      const slotsssm = checkValue(body, schema);

      const begin = new Date(slotsssm.begintime);
      if (isNaN(begin.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid timestamps",
        });
      }

      const signupfile = readJSONFile(signupsFile);
      const slots = readJSONFile(slotsFile);

      const ifExist = signupfile.find(
        (u) => Number(u.id) === Number(slotsssm.signupsheetID)
      );
      if (!ifExist) {
        return res.status(404).json({
          success: false,
          message: "This signup sheets has not been registered.",
        });
      }

      const ifexistingSlots = slots.filter(
        (s) => Number(s.signupsheetID) === Number(slotsssm.signupsheetID)
      );

      function ifisOverlap(begin1, end1, begin2, end2) {
        return !(end1 <= begin2 || begin1 >= end2);
      }

      const everySlots = [];
      for (let tj = 0; tj < slotsssm.numslots; tj++) {
        const startTime = new Date(
          begin.getTime() + tj * slotsssm.slotduration * 60000
        );
        const endTime = new Date(
          startTime.getTime() + slotsssm.slotduration * 60000
        );

        for (const sl of ifexistingSlots) {
          const slBegin = new Date(sl.begin);
          const slEnd = new Date(sl.end);
          if (ifisOverlap(startTime, endTime, slBegin, slEnd)) {
            return res.status(400).json({
              success: false,
              message: "Slot time overlaps with an existing slot.",
            });
          }
        }

        for (const ns of everySlots) {
          const nb = new Date(ns.begin);
          const ne = new Date(ns.end);
          if (ifisOverlap(startTime, endTime, nb, ne)) {
            return res.status(400).json({
              success: false,
              message: "Slot time overlaps with another new slot.",
            });
          }
        }

        everySlots.push({
          id: Date.now() + Math.floor(Math.random() * 1000) + 1,
          signupsheetID: slotsssm.signupsheetID,
          begin: startTime.toISOString(),
          end: endTime.toISOString(),
          maxmembers: slotsssm.maxmembers,
        });
      }

      slots.push(...everySlots);
      writeJSONFile(slotsFile, slots);

      res.json({
        success: true,
        message: "success",
        slot: everySlots,
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
