const express = require('express');
const TicketsController = require('../controllers/ticketsController');
const WorkflowsController = require('../controllers/workflowsController');
const upload = require('../middleware/upload');

const router = express.Router();

// Create a new ticket with image upload
router.post('/with-image', upload.single('image'), TicketsController.createTicketWithImage);

// Create a new ticket
router.post('/', TicketsController.createTicket);

// Get all tickets with pagination
router.get('/', TicketsController.getAllTickets);

// Get ticket count
router.get('/count', TicketsController.getTicketCount);

// Search tickets by date range
router.get('/search/date-range', TicketsController.searchByDateRange);

// Get ticket by trace number
router.get('/trace/:traceNo', TicketsController.getTicketByTraceNo);

// Get ticket by ID
router.get('/:id', TicketsController.getTicketById);

// Update ticket
router.put('/:id', TicketsController.updateTicket);

// Delete ticket
router.delete('/:id', TicketsController.deleteTicket);

// ==================== TICKET WORKFLOW ROUTES ====================

// Initialize workflow for a ticket
router.post('/:ticketId/workflow', WorkflowsController.initializeWorkflow);

// Get approval status and history for a ticket
router.get('/:ticketId/approvals', WorkflowsController.getTicketApprovals);

// Approve or reject a ticket
router.post('/:ticketId/approve', WorkflowsController.approveTicket);

module.exports = router;
