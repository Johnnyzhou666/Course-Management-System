const xss = require("xss");

function fullySanitize(testItem) {
  if (Array.isArray(testItem)) {
    return testItem.map((item) => fullySanitize(item));
  } else if (testItem !== null && typeof testItem === "object") {
    const clean = {};
    for (const key in testItem) {
      clean[key] = fullySanitize(testItem[key]);
    }
    return clean;
  } else if (typeof testItem === "string") {
    return xss(testItem);
  }
  return testItem;
}

module.exports = (req, res, next) => {
  try {
    if (req.body) req.body = fullySanitize(req.body);
    if (req.query) req.query = fullySanitize(req.query);
    if (req.params) req.params = fullySanitize(req.params);
    next();
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Unauthorized and malformed request intercepted",
    });
  }
};
