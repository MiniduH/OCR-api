const express = require('express');
const {
  health,
  getStatus,
} = require('../controllers/webPublicController');

const router = express.Router();

/**
 * Public Routes - No Authentication Required
 */

// Health check
router.get('/health', health);

// Status check
router.get('/status', getStatus);

module.exports = router;
