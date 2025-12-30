const express = require('express');
const ReprintRequestsController = require('../controllers/reprintRequestsController');

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

module.exports = router;
