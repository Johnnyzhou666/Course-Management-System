const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { readJSONFile } = require("../utilFun/readwritejson");
const checkValue = require("../utilFun/checkValue");
const usersFile = "userdata.json";
const membersFile = "members.json";
const yourkey = require("../yourKey");

router.post("/api/login", async (req, res) => {
  try {
    const schema = {
      loginEmail: { type: "string", required: true },
      loginPassword: { type: "string", required: true },
    };

    const check1 = checkValue(req.body, schema);

    const loginusers = readJSONFile(usersFile);
    const members = readJSONFile(membersFile);

    let visitor = null;

    let usertouse = loginusers.find((uu) => uu.email === check1.loginEmail);

    if (usertouse) {
      const ok = await bcrypt.compare(check1.loginPassword, usertouse.password);
      if (ok) visitor = usertouse;
    }

    if (!visitor) {
      let member = members.find((mm) => mm.username === check1.loginEmail);
      if (member) {
        const ok = await bcrypt.compare(check1.loginPassword, member.password);
        if (ok) visitor = member;
      }
    }

    if (!visitor) {
      return res.json({
        success: false,
        message: "Incorrect email or password",
      });
    }

    let tokenPayload;

    if (visitor.memberId) {
      tokenPayload = {
        memberId: visitor.memberId,
        username: visitor.username,
        role: "student",
        firstLogin: visitor.firstLogin === true,
      };
    } else {
      tokenPayload = {
        username: visitor.email,
        role: String(visitor.role).toLowerCase(),
        firstLogin: visitor.firstLogin === true,
      };
    }

    const token = jwt.sign(tokenPayload, yourkey, { expiresIn: "3h" });

    return res.json({
      success: true,
      username: tokenPayload.username,
      role: tokenPayload.role,
      firstLogin: tokenPayload.firstLogin,
      token,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;
