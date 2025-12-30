const jwt = require('jsonwebtoken');

/**
 * Verify JWT Token
 */
const auth = (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Authorization denied',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired',
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }
    res.status(401).json({
      success: false,
      message: 'Authentication failed',
    });
  }
};

/**
 * Check if user has specific role
 */
const authorize = (...roles) => {
  return async (req, res, next) => {
    try {
      const UserCms = require('../models/UserCms');
      const Users = require('../models/Users');
      
      // Try to find user in Users collection first, then UserCms
      let user = await Users.findById(req.user.id);
      
      if (!user) {
        user = await UserCms.findById(req.user.id);
      }

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      if (!roles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: `User role '${user.role}' is not authorized to access this resource`,
        });
      }

      req.userRole = user.role;
      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
};

/**
 * Check if user has specific permission
 */
const checkPermission = (permission) => {
  return async (req, res, next) => {
    try {
      const UserCms = require('../models/UserCms');
      const user = await UserCms.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      if (!user.permissions.includes(permission)) {
        return res.status(403).json({
          success: false,
          message: `User does not have '${permission}' permission`,
        });
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
};

module.exports = {
  auth,
  authorize,
  checkPermission,
};
