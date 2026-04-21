const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

const { readJSONFile, writeJSONFile } = require("../utilFun/readwritejson");
const checkValue = require("../utilFun/checkValue");

const loginMiddleware = require("../middle/loginMiddleware");
const canAccess = require("../middle/canAccess");

function isAdmin(req, res, next) {
  if (!req.user || req.user.role !== "administrator") {
    return res.status(403).json({
      success: false,
      message: "This action requires administrator privileges.",
    });
  }
  next();
}

router.post(
  "/api/admin/addTA",
  loginMiddleware,
  canAccess,
  isAdmin,
  async (req, res) => {
    try {
      const schema = {
        email: { type: "string", required: true },
        password: { type: "string", required: true },
      };

      const valid = checkValue(req.body, schema);

      const users = readJSONFile("userdata.json");

      if (
  users.some(
    (u) =>
      String(u.email).toLowerCase() ===
      String(valid.email).toLowerCase()
  )
) {

        return res.json({ success: false, message: "User already exists." });
      }

      const hash = await bcrypt.hash(valid.password, 10);

      users.push({
        email: valid.email,
        password: hash,
        role: "TA",
        firstLogin: true,
      });

      writeJSONFile("userdata.json", users);

      res.json({ success: true, message: "TA added successfully." });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
);

router.delete(
  "/api/admin/removeTA",
  loginMiddleware,
  canAccess,
  isAdmin,
  (req, res) => {
    try {
      const schema = {
        email: { type: "string", required: true },
      };

      const valid = checkValue(req.body, schema);

      let users = readJSONFile("userdata.json");
      const before = users.length;

     users = users.filter(
  (u) =>
    !(
      String(u.email).toLowerCase() === String(valid.email).toLowerCase() &&
      String(u.role).toUpperCase() === "TA"
    )
);


      if (before === users.length) {
        return res.json({ success: false, message: "TA not found." });
      }

      writeJSONFile("userdata.json", users);

      res.json({ success: true, message: "TA removed." });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
);

router.post(
  "/api/admin/resetPassword",
  loginMiddleware,
  canAccess,
  isAdmin,
  async (req, res) => {
    try {
      const schema = {
        email: { type: "string", required: true },
        nextPassword: { type: "string", required: true },
      };

      const ifvalid = checkValue(req.body, schema);

      const users = readJSONFile("userdata.json");
      const user = users.find(
  (u) => String(u.email).toLowerCase() === String(ifvalid.email).toLowerCase()
);


      if (!user) {
        return res.json({ success: false, message: "User not found." });
      }

      const hashash = await bcrypt.hash(ifvalid.nextPassword, 10);
      user.password = hashash;
      user.firstLogin = true;

      writeJSONFile("userdata.json", users);

      res.json({
        success: true,
        message: "Password reset. User must change password on next login.",
      });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
);

router.get(
  "/api/admin/postTA",
  loginMiddleware,
  canAccess,
  isAdmin,
  (req, res) => {
    try {
      let usersFile = readJSONFile("userdata.json");
      const TAEXIST = usersFile
        .filter((u) => String(u.role).toUpperCase() === "TA")
        .map((u) => ({
          email: u.email,
          role: u.role,
          firstLogin: u.firstLogin
        }));

      res.json({
        success: true,
        list: TAEXIST
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
);


module.exports = router;
