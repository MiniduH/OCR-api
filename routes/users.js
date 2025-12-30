const express = require('express');
const {
  getAllUsers,
  getUserById,
  getUserByUsername,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  getUserCount,
  getUsersByRole,
  getUsersByStatus,
} = require('../controllers/usersController');

const router = express.Router();

/**
 * GET Routes
 */
// Get all users with pagination
router.get('/', getAllUsers);

// Get user count
router.get('/count', getUserCount);

// Get users by role
router.get('/role/:role', getUsersByRole);

// Get users by status
router.get('/status/:status', getUsersByStatus);

// Get single user by ID
router.get('/id/:id', getUserById);

// Get user by username
router.get('/username/:username', getUserByUsername);

// Get user by email
router.get('/email/:email', getUserByEmail);

/**
 * POST Routes
 */
// Create new user
router.post('/', createUser);

/**
 * PUT Routes
 */
// Update user details
router.put('/:id', updateUser);

/**
 * DELETE Routes
 */
// Delete user
router.delete('/:id', deleteUser);

module.exports = router;
// Delete user
router.delete('/:id', deleteUser);

module.exports = router;
