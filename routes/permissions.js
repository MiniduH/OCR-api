const express = require('express');
const {
  getPermissionById,
  getPermissionByName,
  getAllPermissions,
  getPermissionCount,
  searchPermissions,
} = require('../controllers/permissionsController');

const router = express.Router();

/**
 * GET Routes - All permissions are read-only
 */

// Get all permissions with pagination
router.get('/', getAllPermissions);

// Get permission count
router.get('/count', getPermissionCount);

// Search permissions
router.get('/search', searchPermissions);

// Get permission by ID
router.get('/id/:id', getPermissionById);

// Get permission by name
router.get('/name/:name', getPermissionByName);

module.exports = router;
