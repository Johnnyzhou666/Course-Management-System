const jwt = require("jsonwebtoken");
const YOUR_KEY = require("../yourKey");

module.exports = function (req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: "Missing token" });

  const token = auth.split(" ")[1];

  try {
    const decoded = jwt.verify(token, YOUR_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
