const express = require('express');
const {
  register,
  login,
  logout,
  refreshToken,
  verifyToken,
  changePassword,
  logoutAllDevices,
  getUserTokens,
  revokeSpecificToken,
} = require('../controllers/authController');
const { auth } = require('../middleware/auth');

const router = express.Router();

/**
 * Public Routes (No authentication required)
 */

// User registration
router.post('/register', register);

// User login
router.post('/login', login);

// Refresh token
router.post('/refresh-token', refreshToken);

/**
 * Private Routes (Authentication required)
 */

// Verify token
router.post('/verify-token', verifyToken);

// Change password
router.post('/change-password/:userId', changePassword);

// Logout (revoke single token)
router.post('/logout', logout);

// Logout from all devices
router.post('/logout-all/:userId', logoutAllDevices);

// Get user tokens
router.get('/tokens/:userId', getUserTokens);

// Revoke specific token
router.post('/revoke-token/:tokenId', revokeSpecificToken);

module.exports = router;
