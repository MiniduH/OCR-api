const express = require('express');
const {
  getRoleById,
  getRoleByName,
  getAllRoles,
  getActiveRoles,
  getRoleCount,
  createRole,
  updateRole,
  deleteRole,
  addPermission,
  removePermission,
  checkPermission,
} = require('../controllers/rolesController');

const router = express.Router();

/**
 * GET Routes
 */

// Get all roles with pagination
router.get('/', getAllRoles);

// Get active roles
router.get('/active', getActiveRoles);

// Get role count
router.get('/count', getRoleCount);

// Get role by ID
router.get('/id/:id', getRoleById);

// Get role by name
router.get('/name/:name', getRoleByName);

/**
 * POST Routes
 */

// Create a new role
router.post('/', createRole);

// Add permission to role
router.post('/:id/permissions', addPermission);

// Check permission
router.post('/:id/check-permission', checkPermission);

/**
 * PUT Routes
 */

// Update a role
router.put('/:id', updateRole);

/**
 * DELETE Routes
 */

// Delete a role
router.delete('/:id', deleteRole);

// Remove permission from role
router.delete('/:id/permissions/:permissionId', removePermission);

module.exports = router;
