const express = require('express');
const {
  register,
  login,
  logout,
  getMe,
  changePassword,
  refreshToken,
} = require('../controllers/cmsAuthController');
const { auth } = require('../middleware/auth');

const router = express.Router();

/**
 * Public Routes
 */
router.post('/register', register);
router.post('/login', login);

/**
 * Private Routes (requires authentication)
 */
router.get('/me', auth, getMe);
router.post('/logout', auth, logout);
router.put('/change-password', auth, changePassword);
router.post('/refresh-token', auth, refreshToken);

module.exports = router;
