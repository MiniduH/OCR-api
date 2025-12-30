const express = require('express');
const WorkflowsController = require('../controllers/workflowsController');

const router = express.Router();

// ==================== TICKET APPROVAL ROUTES ====================

// Get pending approvals for a user (tickets)
router.get('/pending', WorkflowsController.getPendingApprovals);

// Get tickets pending approval (dashboard view)
router.get('/tickets/pending', WorkflowsController.getTicketsPendingApproval);

// ==================== REPRINT REQUEST APPROVAL ROUTES ====================

// Get pending reprint request approvals for a user
router.get('/reprint-requests/pending', WorkflowsController.getPendingReprintRequestApprovals);

// Get reprint requests pending approval (dashboard view)
router.get('/reprint-requests/list', WorkflowsController.getReprintRequestsPendingApproval);

module.exports = router;
