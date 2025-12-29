const express = require('express');

const {
  getAllNavBar,
  getNavBar,
  getNavBarByOperatorId,
  createNavBar,
  updateNavBar,
  updateNavBarByOperatorId,
  deleteNavBar,
  deleteNavBarByOperatorId,
} = require('../controllers/cmsNavBarController');

const router = express.Router();

// Public routes (no authentication required)
router.get('/', getAllNavBar);
router.get('/:id', getNavBar);
router.get('/operator/:operatorId', getNavBarByOperatorId);

// Protected routes (require admin authentication)
router.post('/', createNavBar);
router.put('/:id', updateNavBar);
router.put('/operator/:operatorId', updateNavBarByOperatorId);
router.delete('/:id', deleteNavBar);
router.delete('/operator/:operatorId', deleteNavBarByOperatorId);

module.exports = router;
