const express = require('express');
const {
  getAllUsers,
  getUser,
  getUserByOperatorId,
  createUser,
  updateUser,
  deleteUser,
  unlockUser,
  suspendUser,
  activateUser,
} = require('../controllers/cmsUserController');
const { auth, authorize, checkPermission } = require('../middleware/auth');

const router = express.Router();

/**
 * All routes require authentication
 */
router.use(auth);

/**
 * Get Routes
 */
// Get all users (Admin only)
router.get(
  '/',
  authorize('super_admin', 'admin'),
  getAllUsers
);

// Get user by ID
router.get('/:id', getUser);

// Get user by operator ID
router.get('/operator/:operatorId', getUserByOperatorId);

/**
 * Create Route
 */
// Create new user (Super Admin only)
router.post(
  '/',
  authorize('super_admin', 'admin'),
  createUser
);

/**
 * Update Routes
 */
// Update user (Admin only)
router.put(
  '/:id',
  authorize('super_admin', 'admin'),
  updateUser
);

// Unlock user account (Admin only)
router.put(
  '/:id/unlock',
  authorize('super_admin', 'admin'),
  unlockUser
);

// Suspend user account (Admin only)
router.put(
  '/:id/suspend',
  authorize('super_admin', 'admin'),
  suspendUser
);

// Activate user account (Admin only)
router.put(
  '/:id/activate',
  authorize('super_admin', 'admin'),
  activateUser
);

/**
 * Delete Route
 */
// Delete user (Super Admin only)
router.delete(
  '/:id',
  authorize('super_admin'),
  deleteUser
);

module.exports = router;
