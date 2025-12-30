const express = require('express');
const WorkflowsController = require('../controllers/workflowsController');

const router = express.Router();

// ==================== NODE USERS ROUTES ====================

// Get users for a node
router.get('/:nodeId/users', WorkflowsController.getNodeUsers);

// Add users to a node
router.post('/:nodeId/users', WorkflowsController.addUsersToNode);

// Set users for a node (replace all)
router.put('/:nodeId/users', WorkflowsController.setNodeUsers);

// Remove a user from a node
router.delete('/:nodeId/users/:userId', WorkflowsController.removeUserFromNode);

module.exports = router;
