const express = require('express');
const WorkflowsController = require('../controllers/workflowsController');

const router = express.Router();

// ==================== WORKFLOW ROUTES ====================

// Create a new workflow
router.post('/', WorkflowsController.createWorkflow);

// Get all workflows
router.get('/', WorkflowsController.getAllWorkflows);

// Get workflow by ID with nodes and users
router.get('/:id', WorkflowsController.getWorkflowById);

// Update workflow
router.put('/:id', WorkflowsController.updateWorkflow);

// Delete workflow
router.delete('/:id', WorkflowsController.deleteWorkflow);

// ==================== WORKFLOW NODES ROUTES ====================

// Get all nodes for a workflow
router.get('/:workflowId/nodes', WorkflowsController.getNodes);

// Add a node to workflow
router.post('/:workflowId/nodes', WorkflowsController.addNode);

// Reorder nodes (must be before /:nodeId to avoid conflict)
router.put('/:workflowId/nodes/reorder', WorkflowsController.reorderNodes);

// Update a node
router.put('/:workflowId/nodes/:nodeId', WorkflowsController.updateNode);

// Delete a node
router.delete('/:workflowId/nodes/:nodeId', WorkflowsController.deleteNode);

module.exports = router;
