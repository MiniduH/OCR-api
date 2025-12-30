const WorkflowsModel = require('../models/Workflows');
const WorkflowNodesModel = require('../models/WorkflowNodes');
const WorkflowNodeUsersModel = require('../models/WorkflowNodeUsers');
const TicketApprovalsModel = require('../models/TicketApprovals');
const TicketsModel = require('../models/Tickets');
const ReprintRequestsModel = require('../models/ReprintRequests');
const ReprintRequestApprovalsModel = require('../models/ReprintRequestApprovals');
const { query } = require('../config/database');

class WorkflowsController {
  // ==================== WORKFLOW CRUD ====================

  /**
   * Create a new workflow
   * POST /api/workflows
   */
  static async createWorkflow(req, res) {
    try {
      const { name, description, is_active } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Workflow name is required' });
      }

      const workflow = await WorkflowsModel.create({
        name,
        description,
        is_active,
        created_by: req.user?.id || null
      });

      res.status(201).json({ success: true, data: workflow });
    } catch (error) {
      console.error('Error in createWorkflow:', error);
      res.status(500).json({ error: 'Failed to create workflow' });
    }
  }

  /**
   * Get all workflows
   * GET /api/workflows
   */
  static async getAllWorkflows(req, res) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50;
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0;
      const activeOnly = req.query.active === 'true';

      let workflows;
      if (activeOnly) {
        workflows = await WorkflowsModel.getActive();
      } else {
        workflows = await WorkflowsModel.getAll(limit, offset);
      }

      const count = await WorkflowsModel.count();

      res.status(200).json({
        success: true,
        data: workflows,
        pagination: { limit, offset, total: count }
      });
    } catch (error) {
      console.error('Error in getAllWorkflows:', error);
      res.status(500).json({ error: 'Failed to get workflows' });
    }
  }

  /**
   * Get workflow by ID with all nodes and users
   * GET /api/workflows/:id
   */
  static async getWorkflowById(req, res) {
    try {
      const { id } = req.params;
      const workflow = await WorkflowsModel.getWorkflowWithNodes(parseInt(id, 10));

      if (!workflow) {
        return res.status(404).json({ error: 'Workflow not found' });
      }

      res.status(200).json({ success: true, data: workflow });
    } catch (error) {
      console.error('Error in getWorkflowById:', error);
      res.status(500).json({ error: 'Failed to get workflow' });
    }
  }

  /**
   * Update workflow
   * PUT /api/workflows/:id
   */
  static async updateWorkflow(req, res) {
    try {
      const { id } = req.params;
      const { name, description, is_active } = req.body;

      const workflow = await WorkflowsModel.update(parseInt(id, 10), {
        name,
        description,
        is_active
      });

      if (!workflow) {
        return res.status(404).json({ error: 'Workflow not found' });
      }

      res.status(200).json({ success: true, data: workflow });
    } catch (error) {
      console.error('Error in updateWorkflow:', error);
      res.status(500).json({ error: 'Failed to update workflow' });
    }
  }

  /**
   * Delete workflow
   * DELETE /api/workflows/:id
   */
  static async deleteWorkflow(req, res) {
    try {
      const { id } = req.params;
      const deleted = await WorkflowsModel.delete(parseInt(id, 10));

      if (!deleted) {
        return res.status(404).json({ error: 'Workflow not found' });
      }

      res.status(200).json({ success: true, message: 'Workflow deleted successfully' });
    } catch (error) {
      console.error('Error in deleteWorkflow:', error);
      res.status(500).json({ error: 'Failed to delete workflow' });
    }
  }

  // ==================== WORKFLOW NODES ====================

  /**
   * Add a node to workflow
   * POST /api/workflows/:workflowId/nodes
   */
  static async addNode(req, res) {
    try {
      const { workflowId } = req.params;
      const { name, node_order, approval_type, description, user_ids } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Node name is required' });
      }

      // If no node_order specified, get the next order
      let order = node_order;
      if (!order) {
        const maxOrder = await WorkflowNodesModel.getMaxNodeOrder(parseInt(workflowId, 10));
        order = maxOrder + 1;
      }

      const node = await WorkflowNodesModel.create({
        workflow_id: parseInt(workflowId, 10),
        name,
        node_order: order,
        approval_type: approval_type || 'ALL',
        description
      });

      // Add users to node if provided
      if (user_ids && user_ids.length > 0) {
        await WorkflowNodeUsersModel.addUsersToNode(node.id, user_ids);
      }

      // Fetch node with users
      const nodeWithUsers = await WorkflowNodesModel.getByWorkflowId(parseInt(workflowId, 10));
      const createdNode = nodeWithUsers.find(n => n.id === node.id);

      res.status(201).json({ success: true, data: createdNode });
    } catch (error) {
      console.error('Error in addNode:', error);
      res.status(500).json({ error: 'Failed to add node' });
    }
  }

  /**
   * Get all nodes for a workflow
   * GET /api/workflows/:workflowId/nodes
   */
  static async getNodes(req, res) {
    try {
      const { workflowId } = req.params;
      const nodes = await WorkflowNodesModel.getByWorkflowId(parseInt(workflowId, 10));

      res.status(200).json({ success: true, data: nodes });
    } catch (error) {
      console.error('Error in getNodes:', error);
      res.status(500).json({ error: 'Failed to get nodes' });
    }
  }

  /**
   * Update a node
   * PUT /api/workflows/:workflowId/nodes/:nodeId
   */
  static async updateNode(req, res) {
    try {
      const { nodeId } = req.params;
      const { name, node_order, approval_type, description } = req.body;

      const node = await WorkflowNodesModel.update(parseInt(nodeId, 10), {
        name,
        node_order,
        approval_type,
        description
      });

      if (!node) {
        return res.status(404).json({ error: 'Node not found' });
      }

      res.status(200).json({ success: true, data: node });
    } catch (error) {
      console.error('Error in updateNode:', error);
      res.status(500).json({ error: 'Failed to update node' });
    }
  }

  /**
   * Delete a node
   * DELETE /api/workflows/:workflowId/nodes/:nodeId
   */
  static async deleteNode(req, res) {
    try {
      const { nodeId } = req.params;
      const deleted = await WorkflowNodesModel.delete(parseInt(nodeId, 10));

      if (!deleted) {
        return res.status(404).json({ error: 'Node not found' });
      }

      res.status(200).json({ success: true, message: 'Node deleted successfully' });
    } catch (error) {
      console.error('Error in deleteNode:', error);
      res.status(500).json({ error: 'Failed to delete node' });
    }
  }

  /**
   * Reorder nodes
   * PUT /api/workflows/:workflowId/nodes/reorder
   */
  static async reorderNodes(req, res) {
    try {
      const { workflowId } = req.params;
      const { node_orders } = req.body; // Array of { id, node_order }

      if (!node_orders || !Array.isArray(node_orders)) {
        return res.status(400).json({ error: 'node_orders array is required' });
      }

      await WorkflowNodesModel.reorderNodes(parseInt(workflowId, 10), node_orders);
      const nodes = await WorkflowNodesModel.getByWorkflowId(parseInt(workflowId, 10));

      res.status(200).json({ success: true, data: nodes });
    } catch (error) {
      console.error('Error in reorderNodes:', error);
      res.status(500).json({ error: 'Failed to reorder nodes' });
    }
  }

  // ==================== NODE USERS ====================

  /**
   * Add users to a node
   * POST /api/nodes/:nodeId/users
   */
  static async addUsersToNode(req, res) {
    try {
      const { nodeId } = req.params;
      const { user_ids } = req.body;

      if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
        return res.status(400).json({ error: 'user_ids array is required' });
      }

      await WorkflowNodeUsersModel.addUsersToNode(parseInt(nodeId, 10), user_ids);
      const users = await WorkflowNodeUsersModel.getByNodeId(parseInt(nodeId, 10));

      res.status(201).json({ success: true, data: users });
    } catch (error) {
      console.error('Error in addUsersToNode:', error);
      res.status(500).json({ error: 'Failed to add users to node' });
    }
  }

  /**
   * Get users for a node
   * GET /api/nodes/:nodeId/users
   */
  static async getNodeUsers(req, res) {
    try {
      const { nodeId } = req.params;
      const users = await WorkflowNodeUsersModel.getByNodeId(parseInt(nodeId, 10));

      res.status(200).json({ success: true, data: users });
    } catch (error) {
      console.error('Error in getNodeUsers:', error);
      res.status(500).json({ error: 'Failed to get node users' });
    }
  }

  /**
   * Set users for a node (replace all)
   * PUT /api/nodes/:nodeId/users
   */
  static async setNodeUsers(req, res) {
    try {
      const { nodeId } = req.params;
      const { user_ids } = req.body;

      await WorkflowNodeUsersModel.setNodeUsers(parseInt(nodeId, 10), user_ids || []);
      const users = await WorkflowNodeUsersModel.getByNodeId(parseInt(nodeId, 10));

      res.status(200).json({ success: true, data: users });
    } catch (error) {
      console.error('Error in setNodeUsers:', error);
      res.status(500).json({ error: 'Failed to set node users' });
    }
  }

  /**
   * Remove a user from a node
   * DELETE /api/nodes/:nodeId/users/:userId
   */
  static async removeUserFromNode(req, res) {
    try {
      const { nodeId, userId } = req.params;
      
      await WorkflowNodeUsersModel.removeUserFromNode(
        parseInt(nodeId, 10),
        parseInt(userId, 10)
      );

      res.status(200).json({ success: true, message: 'User removed from node' });
    } catch (error) {
      console.error('Error in removeUserFromNode:', error);
      res.status(500).json({ error: 'Failed to remove user from node' });
    }
  }

  // ==================== TICKET APPROVAL WORKFLOW ====================

  /**
   * Initialize workflow for a ticket
   * POST /api/tickets/:ticketId/workflow
   */
  static async initializeWorkflow(req, res) {
    try {
      const { ticketId } = req.params;
      const { workflow_id } = req.body;

      if (!workflow_id) {
        return res.status(400).json({ error: 'workflow_id is required' });
      }

      // Get the workflow
      const workflow = await WorkflowsModel.getById(parseInt(workflow_id, 10));
      if (!workflow) {
        return res.status(404).json({ error: 'Workflow not found' });
      }

      if (!workflow.is_active) {
        return res.status(400).json({ error: 'Workflow is not active' });
      }

      // Get the first node
      const firstNode = await WorkflowNodesModel.getFirstNode(parseInt(workflow_id, 10));
      if (!firstNode) {
        return res.status(400).json({ error: 'Workflow has no nodes' });
      }

      // Update ticket with workflow info
      await query(`
        UPDATE tickets 
        SET workflow_id = $1, current_node_order = $2, approval_status = 'PENDING'
        WHERE id = $3
      `, [workflow_id, firstNode.node_order, ticketId]);

      // Get users for the first node
      const nodeUserIds = await WorkflowNodeUsersModel.getUserIdsByNodeId(firstNode.id);
      
      if (nodeUserIds.length === 0) {
        return res.status(400).json({ error: 'First node has no assigned users' });
      }

      // Create approval records for the first node
      await TicketApprovalsModel.createApprovalsForNode(
        parseInt(ticketId, 10),
        firstNode.id,
        nodeUserIds
      );

      const ticket = await TicketsModel.getById(parseInt(ticketId, 10));
      const approvals = await TicketApprovalsModel.getByTicketId(parseInt(ticketId, 10));

      res.status(200).json({
        success: true,
        message: 'Workflow initialized successfully',
        data: {
          ticket,
          current_node: firstNode,
          pending_approvals: approvals
        }
      });
    } catch (error) {
      console.error('Error in initializeWorkflow:', error);
      res.status(500).json({ error: 'Failed to initialize workflow' });
    }
  }

  /**
   * Get pending approvals for a user
   * GET /api/approvals/pending
   */
  static async getPendingApprovals(req, res) {
    try {
      const userId = req.query.userId || req.user?.id;

      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      const pendingApprovals = await TicketApprovalsModel.getPendingForUser(parseInt(userId, 10));

      res.status(200).json({ success: true, data: pendingApprovals });
    } catch (error) {
      console.error('Error in getPendingApprovals:', error);
      res.status(500).json({ error: 'Failed to get pending approvals' });
    }
  }

  /**
   * Approve or reject a ticket
   * POST /api/tickets/:ticketId/approve
   */
  static async approveTicket(req, res) {
    try {
      const { ticketId } = req.params;
      const { user_id, action, comments } = req.body;

      const userId = user_id || req.user?.id;
      
      if (!userId) {
        return res.status(400).json({ error: 'user_id is required' });
      }

      if (!action || !['APPROVE', 'REJECT'].includes(action.toUpperCase())) {
        return res.status(400).json({ error: 'action must be APPROVE or REJECT' });
      }

      // Get the ticket
      const ticket = await TicketsModel.getById(parseInt(ticketId, 10));
      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      if (!ticket.workflow_id) {
        return res.status(400).json({ error: 'Ticket has no workflow assigned' });
      }

      if (ticket.approval_status !== 'PENDING') {
        return res.status(400).json({ error: `Ticket is already ${ticket.approval_status}` });
      }

      // Get current node
      const currentNode = await WorkflowNodesModel.getByWorkflowIdAndOrder(
        ticket.workflow_id,
        ticket.current_node_order
      );

      if (!currentNode) {
        return res.status(400).json({ error: 'Current workflow node not found' });
      }

      // Check if user is assigned to this node
      const isUserInNode = await WorkflowNodeUsersModel.isUserInNode(currentNode.id, parseInt(userId, 10));
      if (!isUserInNode) {
        return res.status(403).json({ error: 'You are not authorized to approve this ticket at current stage' });
      }

      // Update the approval record
      const status = action.toUpperCase() === 'APPROVE' ? 'APPROVED' : 'REJECTED';
      await TicketApprovalsModel.updateApproval(
        parseInt(ticketId, 10),
        currentNode.id,
        parseInt(userId, 10),
        status,
        comments
      );

      // Check node approval status
      const nodeStatus = await TicketApprovalsModel.checkNodeApprovalStatus(
        parseInt(ticketId, 10),
        currentNode.id
      );

      let responseData = {
        approval_recorded: true,
        node_status: nodeStatus
      };

      if (nodeStatus.isComplete) {
        if (nodeStatus.nodeStatus === 'REJECTED') {
          // Ticket is rejected
          await query(`
            UPDATE tickets 
            SET approval_status = 'REJECTED', updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
          `, [ticketId]);

          responseData.ticket_status = 'REJECTED';
          responseData.message = 'Ticket has been rejected';
        } else if (nodeStatus.nodeStatus === 'APPROVED') {
          // Check for next node
          const nextNode = await WorkflowNodesModel.getNextNode(
            ticket.workflow_id,
            ticket.current_node_order
          );

          if (nextNode) {
            // Move to next node
            await query(`
              UPDATE tickets 
              SET current_node_order = $1, updated_at = CURRENT_TIMESTAMP
              WHERE id = $2
            `, [nextNode.node_order, ticketId]);

            // Create approval records for next node
            const nextNodeUserIds = await WorkflowNodeUsersModel.getUserIdsByNodeId(nextNode.id);
            await TicketApprovalsModel.createApprovalsForNode(
              parseInt(ticketId, 10),
              nextNode.id,
              nextNodeUserIds
            );

            responseData.moved_to_next_node = true;
            responseData.next_node = nextNode;
            responseData.message = `Moved to next approval stage: ${nextNode.name}`;
          } else {
            // Final approval - no more nodes
            await query(`
              UPDATE tickets 
              SET approval_status = 'APPROVED', updated_at = CURRENT_TIMESTAMP
              WHERE id = $1
            `, [ticketId]);

            responseData.ticket_status = 'APPROVED';
            responseData.message = 'Ticket has been fully approved';
          }
        }
      } else {
        responseData.message = `Approval recorded. Waiting for ${nodeStatus.pending} more approval(s)`;
      }

      const updatedTicket = await TicketsModel.getById(parseInt(ticketId, 10));
      responseData.ticket = updatedTicket;

      res.status(200).json({ success: true, data: responseData });
    } catch (error) {
      console.error('Error in approveTicket:', error);
      res.status(500).json({ error: 'Failed to process approval' });
    }
  }

  /**
   * Get approval status and history for a ticket
   * GET /api/tickets/:ticketId/approvals
   */
  static async getTicketApprovals(req, res) {
    try {
      const { ticketId } = req.params;

      const ticket = await TicketsModel.getById(parseInt(ticketId, 10));
      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      const approvals = await TicketApprovalsModel.getByTicketId(parseInt(ticketId, 10));
      const history = await TicketApprovalsModel.getApprovalHistory(parseInt(ticketId, 10));

      // Get current node info if workflow is active
      let currentNode = null;
      if (ticket.workflow_id && ticket.approval_status === 'PENDING') {
        currentNode = await WorkflowNodesModel.getByWorkflowIdAndOrder(
          ticket.workflow_id,
          ticket.current_node_order
        );
        
        if (currentNode) {
          const nodeStatus = await TicketApprovalsModel.checkNodeApprovalStatus(
            parseInt(ticketId, 10),
            currentNode.id
          );
          currentNode.status = nodeStatus;
        }
      }

      res.status(200).json({
        success: true,
        data: {
          ticket: {
            id: ticket.id,
            workflow_id: ticket.workflow_id,
            current_node_order: ticket.current_node_order,
            approval_status: ticket.approval_status
          },
          current_node: currentNode,
          all_approvals: approvals,
          approval_history: history
        }
      });
    } catch (error) {
      console.error('Error in getTicketApprovals:', error);
      res.status(500).json({ error: 'Failed to get ticket approvals' });
    }
  }

  /**
   * Get tickets pending approval (for dashboard/list view)
   * GET /api/tickets/pending-approval
   */
  static async getTicketsPendingApproval(req, res) {
    try {
      const userId = req.query.userId || req.user?.id;
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0;

      let ticketsQuery;
      let countQuery;
      let params;

      if (userId) {
        // Get tickets where user has pending approval at current node
        ticketsQuery = `
          SELECT DISTINCT t.*, 
            w.name as workflow_name,
            wn.name as current_node_name,
            wn.approval_type as current_node_approval_type
          FROM tickets t
          JOIN workflows w ON t.workflow_id = w.id
          JOIN workflow_nodes wn ON wn.workflow_id = w.id AND wn.node_order = t.current_node_order
          JOIN ticket_approvals ta ON ta.ticket_id = t.id AND ta.node_id = wn.id
          WHERE t.approval_status = 'PENDING'
            AND ta.user_id = $1
            AND ta.status = 'PENDING'
          ORDER BY t.created_at DESC
          LIMIT $2 OFFSET $3;
        `;
        countQuery = `
          SELECT COUNT(DISTINCT t.id)
          FROM tickets t
          JOIN workflow_nodes wn ON wn.workflow_id = t.workflow_id AND wn.node_order = t.current_node_order
          JOIN ticket_approvals ta ON ta.ticket_id = t.id AND ta.node_id = wn.id
          WHERE t.approval_status = 'PENDING'
            AND ta.user_id = $1
            AND ta.status = 'PENDING';
        `;
        params = [userId, limit, offset];
      } else {
        // Get all pending tickets
        ticketsQuery = `
          SELECT t.*, 
            w.name as workflow_name,
            wn.name as current_node_name,
            wn.approval_type as current_node_approval_type
          FROM tickets t
          LEFT JOIN workflows w ON t.workflow_id = w.id
          LEFT JOIN workflow_nodes wn ON wn.workflow_id = w.id AND wn.node_order = t.current_node_order
          WHERE t.approval_status = 'PENDING'
          ORDER BY t.created_at DESC
          LIMIT $1 OFFSET $2;
        `;
        countQuery = `
          SELECT COUNT(*) FROM tickets WHERE approval_status = 'PENDING';
        `;
        params = [limit, offset];
      }

      const result = await query(ticketsQuery, params);
      const countResult = await query(countQuery, userId ? [userId] : []);

      res.status(200).json({
        success: true,
        data: result.rows,
        pagination: {
          limit,
          offset,
          total: parseInt(countResult.rows[0].count, 10)
        }
      });
    } catch (error) {
      console.error('Error in getTicketsPendingApproval:', error);
      res.status(500).json({ error: 'Failed to get pending tickets' });
    }
  }

  // ==================== REPRINT REQUEST WORKFLOW ====================

  /**
   * Initialize workflow for a reprint request
   * POST /api/reprint-requests/:requestId/workflow
   */
  static async initializeReprintRequestWorkflow(req, res) {
    try {
      const { requestId } = req.params;
      const { workflow_id } = req.body;

      if (!workflow_id) {
        return res.status(400).json({ error: 'workflow_id is required' });
      }

      // Get the workflow
      const workflow = await WorkflowsModel.getById(parseInt(workflow_id, 10));
      if (!workflow) {
        return res.status(404).json({ error: 'Workflow not found' });
      }

      if (!workflow.is_active) {
        return res.status(400).json({ error: 'Workflow is not active' });
      }

      // Get the first node
      const firstNode = await WorkflowNodesModel.getFirstNode(parseInt(workflow_id, 10));
      if (!firstNode) {
        return res.status(400).json({ error: 'Workflow has no nodes' });
      }

      // Update reprint request with workflow info
      await query(`
        UPDATE reprint_requests 
        SET workflow_id = $1, current_node_order = $2, approval_status = 'PENDING'
        WHERE id = $3
      `, [workflow_id, firstNode.node_order, requestId]);

      // Get users for the first node
      const nodeUserIds = await WorkflowNodeUsersModel.getUserIdsByNodeId(firstNode.id);
      
      if (nodeUserIds.length === 0) {
        return res.status(400).json({ error: 'First node has no assigned users' });
      }

      // Create approval records for the first node
      await ReprintRequestApprovalsModel.createApprovalsForNode(
        parseInt(requestId, 10),
        firstNode.id,
        nodeUserIds
      );

      const reprintRequest = await ReprintRequestsModel.getById(parseInt(requestId, 10));
      const approvals = await ReprintRequestApprovalsModel.getByReprintRequestId(parseInt(requestId, 10));

      res.status(200).json({
        success: true,
        message: 'Workflow initialized successfully',
        data: {
          reprint_request: reprintRequest,
          current_node: firstNode,
          pending_approvals: approvals
        }
      });
    } catch (error) {
      console.error('Error in initializeReprintRequestWorkflow:', error);
      res.status(500).json({ error: 'Failed to initialize workflow' });
    }
  }

  /**
   * Get pending reprint request approvals for a user
   * GET /api/approvals/reprint-requests/pending
   */
  static async getPendingReprintRequestApprovals(req, res) {
    try {
      const userId = req.query.userId || req.user?.id;

      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      const pendingApprovals = await ReprintRequestApprovalsModel.getPendingForUser(parseInt(userId, 10));

      res.status(200).json({ success: true, data: pendingApprovals });
    } catch (error) {
      console.error('Error in getPendingReprintRequestApprovals:', error);
      res.status(500).json({ error: 'Failed to get pending approvals' });
    }
  }

  /**
   * Approve or reject a reprint request
   * POST /api/reprint-requests/:requestId/approve
   */
  static async approveReprintRequest(req, res) {
    try {
      const { requestId } = req.params;
      const { user_id, action, comments } = req.body;

      const userId = user_id || req.user?.id;
      
      if (!userId) {
        return res.status(400).json({ error: 'user_id is required' });
      }

      if (!action || !['APPROVE', 'REJECT'].includes(action.toUpperCase())) {
        return res.status(400).json({ error: 'action must be APPROVE or REJECT' });
      }

      // Get the reprint request
      const reprintRequest = await ReprintRequestsModel.getById(parseInt(requestId, 10));
      if (!reprintRequest) {
        return res.status(404).json({ error: 'Reprint request not found' });
      }

      if (!reprintRequest.workflow_id) {
        return res.status(400).json({ error: 'Reprint request has no workflow assigned' });
      }

      if (reprintRequest.approval_status !== 'PENDING') {
        return res.status(400).json({ error: `Reprint request is already ${reprintRequest.approval_status}` });
      }

      // Get current node
      const currentNode = await WorkflowNodesModel.getByWorkflowIdAndOrder(
        reprintRequest.workflow_id,
        reprintRequest.current_node_order
      );

      if (!currentNode) {
        return res.status(400).json({ error: 'Current workflow node not found' });
      }

      // Check if user is assigned to this node
      const isUserInNode = await WorkflowNodeUsersModel.isUserInNode(currentNode.id, parseInt(userId, 10));
      if (!isUserInNode) {
        return res.status(403).json({ error: 'You are not authorized to approve this request at current stage' });
      }

      // Update the approval record
      const status = action.toUpperCase() === 'APPROVE' ? 'APPROVED' : 'REJECTED';
      await ReprintRequestApprovalsModel.updateApproval(
        parseInt(requestId, 10),
        currentNode.id,
        parseInt(userId, 10),
        status,
        comments
      );

      // Check node approval status
      const nodeStatus = await ReprintRequestApprovalsModel.checkNodeApprovalStatus(
        parseInt(requestId, 10),
        currentNode.id
      );

      let responseData = {
        approval_recorded: true,
        node_status: nodeStatus
      };

      if (nodeStatus.isComplete) {
        if (nodeStatus.nodeStatus === 'REJECTED') {
          // Request is rejected
          await query(`
            UPDATE reprint_requests 
            SET approval_status = 'REJECTED', updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
          `, [requestId]);

          responseData.request_status = 'REJECTED';
          responseData.message = 'Reprint request has been rejected';
        } else if (nodeStatus.nodeStatus === 'APPROVED') {
          // Check for next node
          const nextNode = await WorkflowNodesModel.getNextNode(
            reprintRequest.workflow_id,
            reprintRequest.current_node_order
          );

          if (nextNode) {
            // Move to next node
            await query(`
              UPDATE reprint_requests 
              SET current_node_order = $1, updated_at = CURRENT_TIMESTAMP
              WHERE id = $2
            `, [nextNode.node_order, requestId]);

            // Create approval records for next node
            const nextNodeUserIds = await WorkflowNodeUsersModel.getUserIdsByNodeId(nextNode.id);
            await ReprintRequestApprovalsModel.createApprovalsForNode(
              parseInt(requestId, 10),
              nextNode.id,
              nextNodeUserIds
            );

            responseData.moved_to_next_node = true;
            responseData.next_node = nextNode;
            responseData.message = `Moved to next approval stage: ${nextNode.name}`;
          } else {
            // Final approval - no more nodes
            await query(`
              UPDATE reprint_requests 
              SET approval_status = 'APPROVED', updated_at = CURRENT_TIMESTAMP
              WHERE id = $1
            `, [requestId]);

            responseData.request_status = 'APPROVED';
            responseData.message = 'Reprint request has been fully approved';
          }
        }
      } else {
        responseData.message = `Approval recorded. Waiting for ${nodeStatus.pending} more approval(s)`;
      }

      const updatedRequest = await ReprintRequestsModel.getById(parseInt(requestId, 10));
      responseData.reprint_request = updatedRequest;

      res.status(200).json({ success: true, data: responseData });
    } catch (error) {
      console.error('Error in approveReprintRequest:', error);
      res.status(500).json({ error: 'Failed to process approval' });
    }
  }

  /**
   * Get approval status and history for a reprint request
   * GET /api/reprint-requests/:requestId/approvals
   */
  static async getReprintRequestApprovals(req, res) {
    try {
      const { requestId } = req.params;

      const reprintRequest = await ReprintRequestsModel.getById(parseInt(requestId, 10));
      if (!reprintRequest) {
        return res.status(404).json({ error: 'Reprint request not found' });
      }

      const approvals = await ReprintRequestApprovalsModel.getByReprintRequestId(parseInt(requestId, 10));
      const history = await ReprintRequestApprovalsModel.getApprovalHistory(parseInt(requestId, 10));

      // Get current node info if workflow is active
      let currentNode = null;
      if (reprintRequest.workflow_id && reprintRequest.approval_status === 'PENDING') {
        currentNode = await WorkflowNodesModel.getByWorkflowIdAndOrder(
          reprintRequest.workflow_id,
          reprintRequest.current_node_order
        );
        
        if (currentNode) {
          const nodeStatus = await ReprintRequestApprovalsModel.checkNodeApprovalStatus(
            parseInt(requestId, 10),
            currentNode.id
          );
          currentNode.status = nodeStatus;
        }
      }

      res.status(200).json({
        success: true,
        data: {
          reprint_request: {
            id: reprintRequest.id,
            workflow_id: reprintRequest.workflow_id,
            current_node_order: reprintRequest.current_node_order,
            approval_status: reprintRequest.approval_status
          },
          current_node: currentNode,
          all_approvals: approvals,
          approval_history: history
        }
      });
    } catch (error) {
      console.error('Error in getReprintRequestApprovals:', error);
      res.status(500).json({ error: 'Failed to get reprint request approvals' });
    }
  }

  /**
   * Get reprint requests pending approval
   * GET /api/approvals/reprint-requests/list
   */
  static async getReprintRequestsPendingApproval(req, res) {
    try {
      const userId = req.query.userId || req.user?.id;
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0;

      let requestsQuery;
      let countQuery;
      let params;

      if (userId) {
        requestsQuery = `
          SELECT DISTINCT rr.*, 
            w.name as workflow_name,
            wn.name as current_node_name,
            wn.approval_type as current_node_approval_type
          FROM reprint_requests rr
          JOIN workflows w ON rr.workflow_id = w.id
          JOIN workflow_nodes wn ON wn.workflow_id = w.id AND wn.node_order = rr.current_node_order
          JOIN reprint_request_approvals rra ON rra.reprint_request_id = rr.id AND rra.node_id = wn.id
          WHERE rr.approval_status = 'PENDING'
            AND rra.user_id = $1
            AND rra.status = 'PENDING'
          ORDER BY rr.created_at DESC
          LIMIT $2 OFFSET $3;
        `;
        countQuery = `
          SELECT COUNT(DISTINCT rr.id)
          FROM reprint_requests rr
          JOIN workflow_nodes wn ON wn.workflow_id = rr.workflow_id AND wn.node_order = rr.current_node_order
          JOIN reprint_request_approvals rra ON rra.reprint_request_id = rr.id AND rra.node_id = wn.id
          WHERE rr.approval_status = 'PENDING'
            AND rra.user_id = $1
            AND rra.status = 'PENDING';
        `;
        params = [userId, limit, offset];
      } else {
        requestsQuery = `
          SELECT rr.*, 
            w.name as workflow_name,
            wn.name as current_node_name,
            wn.approval_type as current_node_approval_type
          FROM reprint_requests rr
          LEFT JOIN workflows w ON rr.workflow_id = w.id
          LEFT JOIN workflow_nodes wn ON wn.workflow_id = w.id AND wn.node_order = rr.current_node_order
          WHERE rr.approval_status = 'PENDING'
          ORDER BY rr.created_at DESC
          LIMIT $1 OFFSET $2;
        `;
        countQuery = `
          SELECT COUNT(*) FROM reprint_requests WHERE approval_status = 'PENDING';
        `;
        params = [limit, offset];
      }

      const result = await query(requestsQuery, params);
      const countResult = await query(countQuery, userId ? [userId] : []);

      res.status(200).json({
        success: true,
        data: result.rows,
        pagination: {
          limit,
          offset,
          total: parseInt(countResult.rows[0].count, 10)
        }
      });
    } catch (error) {
      console.error('Error in getReprintRequestsPendingApproval:', error);
      res.status(500).json({ error: 'Failed to get pending reprint requests' });
    }
  }
}

module.exports = WorkflowsController;
