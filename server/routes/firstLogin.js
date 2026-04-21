const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

const { readJSONFile, writeJSONFile } = require("../utilFun/readwritejson");
const checkValue = require("../utilFun/checkValue");

const loginMiddleware = require("../middle/loginMiddleware");

const usersFile = "userdata.json";
const membersFile = "members.json";
router.post("/api/firstloginpassword", loginMiddleware, async (req, res) => {
  try {
    const schema = {
      nextPassword: { type: "string", required: true },
    };

    const check1 = checkValue(req.body, schema);

    const username1 = req.user.username;

    let users = readJSONFile(usersFile);
    let ifuserExist = users.find(
      (uu) => uu.email === username1 || uu.username === username1
    );

    let members = readJSONFile(membersFile);
    let ifmemberExist = members.find(
      (mm) => mm.username === username1 || mm.email === username1
    );

    if (!ifuserExist && !ifmemberExist) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const hashash = await bcrypt.hash(check1.nextPassword, 10);

    if (ifuserExist) {
      ifuserExist.password = hashash;
      ifuserExist.firstLogin = false;
      writeJSONFile(usersFile, users);
    }

    if (ifmemberExist) {
      ifmemberExist.password = hashash;
      ifmemberExist.firstLogin = false;
      writeJSONFile(membersFile, members);
    }

    res.json({
      success: true,
      message: "Password updated.",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;
