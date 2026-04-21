module.exports = function canAccess(req, res, next) {
  const usercheck = req.user;

  if (!usercheck) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
  if (usercheck.firstLogin === true) {
    return res.status(403).json({
      success: false,
      message: "You must change your password on first login.",
    });
  }

  next();
};
