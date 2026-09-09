import { User } from "../models/user.model.js";

const authenticateUser = async (req, res, next) => {
  const userId = req.headers["user-id"];

  const user = await User.findById(userId);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  req.user = user;

  next();
};

const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!req.user.roles.includes(role)) {
      return res.status(403).json({
        success: false,
        message: `Requires ${role} role`,
      });
    }

    next();
  };
};

export { authenticateUser, requireRole };
