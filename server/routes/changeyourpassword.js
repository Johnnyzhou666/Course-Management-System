const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");

const { readJSONFile, writeJSONFile } = require("../utilFun/readwritejson");
const checkValue = require("../utilFun/checkValue");
const loginMiddleware = require("../middle/loginMiddleware");
const membersFile = "members.json";
const usersFile = "userdata.json";

router.post("/api/changeyourpassword", loginMiddleware, async (req, res) => {
  try {
    const schema = {
      nowPassword: { type: "string", required: true, maxLength: 50 },
      nextPassword: { type: "string", required: true, maxLength: 50 },
    };

    const validpassword = checkValue(req.body, schema);
    const { nowPassword, nextPassword } = validpassword;
    const loginrole = req.user.role;
    const loginaccount = req.user.username;
    const studentid = req.user.memberId;
    const accounter = readJSONFile(usersFile);
    const studenter = readJSONFile(membersFile);
    let usertry;
    let targetFile;
    let targetList;

    if (loginrole === "student") {
      targetFile = membersFile;
      targetList = studenter;

      usertry = studenter.find((u) => String(u.memberId) === String(studentid));
    } else {
      targetFile = usersFile;
      targetList = accounter;

      usertry = accounter.find((u) => u.email === loginaccount);
    }

    if (!usertry) {
      return res.status(404).json({
        success: false,
        message: "Cannot find the user account",
      });
    }

    const pair = await bcrypt.compare(nowPassword, usertry.password);
    if (!pair) {
      return res.status(400).json({
        success: false,
        message: "Your present password is wrong.",
      });
    }

    const hashPass = await bcrypt.hash(nextPassword, 10);
    usertry.password = hashPass;

    if (usertry.firstLogin === true) {
      usertry.firstLogin = false;
    }

    writeJSONFile(targetFile, targetList);

    return res.json({
      success: true,
      message: "Your password updated operation is successful.",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
});

module.exports = router;
