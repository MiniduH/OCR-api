const ReprintRequestsModel = require('../models/ReprintRequests');
const TicketsModel = require('../models/Tickets');

class ReprintRequestsController {
  static async createReprintRequest(req, res) {
    try {
      const { ticket_id, trace_no, reason, requested_copies, notes } = req.body;

      // Validate required fields
      if (!ticket_id) {
        return res.status(400).json({
          success: false,
          message: 'Missing required field: ticket_id',
        });
      }

      if (!trace_no) {
        return res.status(400).json({
          success: false,
          message: 'Missing required field: trace_no',
        });
      }

      if (!reason) {
        return res.status(400).json({
          success: false,
          message: 'Missing required field: reason',
        });
      }

      // Verify the ticket exists
      const ticket = await TicketsModel.getById(ticket_id);
      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: 'Ticket not found',
        });
      }

      // Verify trace_no matches the ticket
      if (ticket.trace_no !== trace_no) {
        return res.status(400).json({
          success: false,
          message: 'Trace number does not match the ticket',
        });
      }

      const reprintRequest = await ReprintRequestsModel.create({
        ticket_id,
        trace_no,
        reason,
        requested_copies: requested_copies || 1,
        notes: notes || null,
      });

      res.status(201).json({
        success: true,
        message: 'Reprint request created successfully',
        data: {
          request_id: reprintRequest.id.toString(),
          status: reprintRequest.status,
          ...reprintRequest,
        },
      });
    } catch (error) {
      console.error('Error in createReprintRequest:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create reprint request',
      });
    }
  }

  static async getReprintRequestById(req, res) {
    try {
      const { id } = req.params;
      const reprintRequest = await ReprintRequestsModel.getById(parseInt(id, 10));

      if (!reprintRequest) {
        return res.status(404).json({
          success: false,
          message: 'Reprint request not found',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Reprint request retrieved successfully',
        data: reprintRequest,
      });
    } catch (error) {
      console.error('Error in getReprintRequestById:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get reprint request',
      });
    }
  }

  static async getReprintRequestsByTicketId(req, res) {
    try {
      const { ticketId } = req.params;
      const reprintRequests = await ReprintRequestsModel.getByTicketId(parseInt(ticketId, 10));

      res.status(200).json({
        success: true,
        message: 'Reprint requests retrieved successfully',
        data: reprintRequests,
      });
    } catch (error) {
      console.error('Error in getReprintRequestsByTicketId:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get reprint requests',
      });
    }
  }

  static async getReprintRequestsByTraceNo(req, res) {
    try {
      const { traceNo } = req.params;
      const reprintRequests = await ReprintRequestsModel.getByTraceNo(traceNo);

      res.status(200).json({
        success: true,
        message: 'Reprint requests retrieved successfully',
        data: reprintRequests,
      });
    } catch (error) {
      console.error('Error in getReprintRequestsByTraceNo:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get reprint requests',
      });
    }
  }

  static async getAllReprintRequests(req, res) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0;

      const reprintRequests = await ReprintRequestsModel.getAll(limit, offset);
      const count = await ReprintRequestsModel.count();

      res.status(200).json({
        success: true,
        message: 'Reprint requests retrieved successfully',
        data: reprintRequests,
        pagination: {
          limit,
          offset,
          total: count,
        },
      });
    } catch (error) {
      console.error('Error in getAllReprintRequests:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get reprint requests',
      });
    }
  }

  static async getReprintRequestsByStatus(req, res) {
    try {
      const { status } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0;

      const validStatuses = ['pending', 'approved', 'rejected', 'completed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        });
      }

      const reprintRequests = await ReprintRequestsModel.getByStatus(status, limit, offset);
      const count = await ReprintRequestsModel.countByStatus(status);

      res.status(200).json({
        success: true,
        message: 'Reprint requests retrieved successfully',
        data: reprintRequests,
        pagination: {
          limit,
          offset,
          total: count,
        },
      });
    } catch (error) {
      console.error('Error in getReprintRequestsByStatus:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get reprint requests',
      });
    }
  }

  static async updateReprintRequest(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Prevent updating certain fields
      delete updates.id;
      delete updates.created_at;
      delete updates.ticket_id;
      delete updates.trace_no;

      const updatedRequest = await ReprintRequestsModel.update(parseInt(id, 10), updates);

      if (!updatedRequest) {
        return res.status(404).json({
          success: false,
          message: 'Reprint request not found',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Reprint request updated successfully',
        data: updatedRequest,
      });
    } catch (error) {
      console.error('Error in updateReprintRequest:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update reprint request',
      });
    }
  }

  static async updateReprintRequestStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const validStatuses = ['pending', 'approved', 'rejected', 'completed'];
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        });
      }

      const updatedRequest = await ReprintRequestsModel.updateStatus(parseInt(id, 10), status);

      if (!updatedRequest) {
        return res.status(404).json({
          success: false,
          message: 'Reprint request not found',
        });
      }

      res.status(200).json({
        success: true,
        message: `Reprint request ${status} successfully`,
        data: {
          request_id: updatedRequest.id.toString(),
          status: updatedRequest.status,
        },
      });
    } catch (error) {
      console.error('Error in updateReprintRequestStatus:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update reprint request status',
      });
    }
  }

  static async deleteReprintRequest(req, res) {
    try {
      const { id } = req.params;
      const deleted = await ReprintRequestsModel.delete(parseInt(id, 10));

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Reprint request not found',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Reprint request deleted successfully',
      });
    } catch (error) {
      console.error('Error in deleteReprintRequest:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete reprint request',
      });
    }
  }

  static async getReprintRequestCount(req, res) {
    try {
      const count = await ReprintRequestsModel.count();
      res.status(200).json({
        success: true,
        message: 'Reprint request count retrieved successfully',
        data: { count },
      });
    } catch (error) {
      console.error('Error in getReprintRequestCount:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get reprint request count',
      });
    }
  }
}

module.exports = ReprintRequestsController;
