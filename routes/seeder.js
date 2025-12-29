const express = require('express');
const { seedOperator, getSeederStatus, checkOperatorData } = require('../controllers/seederController');
const { auth } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/seeder/seed-operator
 * Seed default data for an operator with template_id = 1
 * Body: { operatorId: number }
 */
router.post('/seed-operator', auth, seedOperator);

/**
 * GET /api/seeder/status/:operatorId
 * Check seeding status for an operator
 */
router.get('/status/:operatorId', auth, getSeederStatus);

/**
 * GET /api/seeder/check-data/:operatorId
 * Check if data is available for an operator
 */
router.get('/check-data/:operatorId', auth, checkOperatorData);

module.exports = router;
