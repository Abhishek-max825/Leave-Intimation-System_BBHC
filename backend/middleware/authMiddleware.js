const mongoose = require("mongoose");

const attachUserFromRequest = (req, res, next) => {
  // Mock auth: accept identity via headers (frontend can set these)
  // x-user-id: Mongo ObjectId
  // x-user-role: student | faculty | admin
  const userId = req.header("x-user-id") || req.query.userId || req.body?.userId;
  const role = req.header("x-user-role") || req.query.role || req.body?.role;
  const name = req.header("x-user-name") || req.query.userName || req.body?.userName;

  req.user = {
    userId: userId || null,
    role: role ? String(role).toLowerCase() : null,
    name: name || null,
  };

  next();
};

const authorizeRoles =
  (...roles) =>
  (req, res, next) => {
    const role =
      req.user?.role ||
      (req.header("x-user-role") ? String(req.header("x-user-role")).toLowerCase() : null);

    if (!role || !roles.includes(role)) {
      return res.status(403).json({ message: "Forbidden: insufficient role" });
    }

    if (role === "student") {
      const userId = req.user?.userId || req.header("x-user-id") || req.query.userId || req.body?.userId;
      if (!userId || !mongoose.Types.ObjectId.isValid(String(userId))) {
        return res.status(400).json({ message: "Missing or invalid x-user-id for student requests" });
      }
      req.user.userId = String(userId);
    }

    return next();
  };

module.exports = {
  attachUserFromRequest,
  authorizeRoles,
};

