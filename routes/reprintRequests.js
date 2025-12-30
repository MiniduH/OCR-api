const express = require('express');
const ReprintRequestsController = require('../controllers/reprintRequestsController');
const WorkflowsController = require('../controllers/workflowsController');

const router = express.Router();

// Create a new reprint request
router.post('/', ReprintRequestsController.createReprintRequest);

// Get all reprint requests with pagination
router.get('/', ReprintRequestsController.getAllReprintRequests);

// Get reprint request count
router.get('/count', ReprintRequestsController.getReprintRequestCount);

// Get reprint requests by status
router.get('/status/:status', ReprintRequestsController.getReprintRequestsByStatus);

// Get reprint requests by trace number
router.get('/trace/:traceNo', ReprintRequestsController.getReprintRequestsByTraceNo);

// Get reprint requests by ticket ID
router.get('/ticket/:ticketId', ReprintRequestsController.getReprintRequestsByTicketId);

// Get reprint request by ID
router.get('/:id', ReprintRequestsController.getReprintRequestById);

// Update reprint request
router.put('/:id', ReprintRequestsController.updateReprintRequest);

// Update reprint request status
router.patch('/:id/status', ReprintRequestsController.updateReprintRequestStatus);

// Delete reprint request
router.delete('/:id', ReprintRequestsController.deleteReprintRequest);

// ==================== WORKFLOW ROUTES ====================

// Initialize workflow for a reprint request
router.post('/:requestId/workflow', WorkflowsController.initializeReprintRequestWorkflow);

// Get approval status and history for a reprint request
router.get('/:requestId/approvals', WorkflowsController.getReprintRequestApprovals);

// Approve or reject a reprint request
router.post('/:requestId/approve', WorkflowsController.approveReprintRequest);

module.exports = router;
