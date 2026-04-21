function requireRole(...roles) {
  return function (req, res, next) {
    const userRole = String(req.user?.role || "").toLowerCase();
    const approveallowed = roles.map((r) => String(r).toLowerCase());

    if (!approveallowed.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Permission denied",
      });
    }

    next();
  };
}

module.exports = { requireRole };
