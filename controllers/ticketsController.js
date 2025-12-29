const TicketsModel = require('../models/Tickets');
const uploadTicketImage = require('../utils/uploadTicketImage');

class TicketsController {
  static async createTicket(req, res) {
    try {
      const ticket = req.body;

      // Validate required fields (trace_no and reference_no are optional)
      const requiredFields = [
        'date',
        'time',
        'terminal_id',
        'location',
        'no_tickets',
        'total_amount',
        'ticket_amount_pp',
        'scanned_data',
      ];

      for (const field of requiredFields) {
        if (!(field in ticket) || ticket[field] === undefined || ticket[field] === null) {
          res.status(400).json({ error: `Missing required field: ${field}` });
          return;
        }
      }

      const newTicket = await TicketsModel.create(ticket);
      res.status(201).json({ success: true, data: newTicket });
    } catch (error) {
      console.error('Error in createTicket:', error);
      res.status(500).json({ error: 'Failed to create ticket' });
    }
  }

  static async getTicketById(req, res) {
    try {
      const { id } = req.params;
      const ticket = await TicketsModel.getById(parseInt(id, 10));

      if (!ticket) {
        res.status(404).json({ error: 'Ticket not found' });
        return;
      }

      res.status(200).json({ success: true, data: ticket });
    } catch (error) {
      console.error('Error in getTicketById:', error);
      res.status(500).json({ error: 'Failed to get ticket' });
    }
  }

  static async getTicketByTraceNo(req, res) {
    try {
      const { traceNo } = req.params;
      const ticket = await TicketsModel.getByTraceNo(traceNo);

      if (!ticket) {
        res.status(404).json({ error: 'Ticket not found' });
        return;
      }

      res.status(200).json({ success: true, data: ticket });
    } catch (error) {
      console.error('Error in getTicketByTraceNo:', error);
      res.status(500).json({ error: 'Failed to get ticket' });
    }
  }

  static async getAllTickets(req, res) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0;

      const tickets = await TicketsModel.getAll(limit, offset);
      const count = await TicketsModel.count();

      res.status(200).json({
        success: true,
        data: tickets,
        pagination: {
          limit,
          offset,
          total: count,
        },
      });
    } catch (error) {
      console.error('Error in getAllTickets:', error);
      res.status(500).json({ error: 'Failed to get tickets' });
    }
  }

  static async updateTicket(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const updatedTicket = await TicketsModel.update(parseInt(id, 10), updates);

      if (!updatedTicket) {
        res.status(404).json({ error: 'Ticket not found' });
        return;
      }

      res.status(200).json({ success: true, data: updatedTicket });
    } catch (error) {
      console.error('Error in updateTicket:', error);
      res.status(500).json({ error: 'Failed to update ticket' });
    }
  }

  static async deleteTicket(req, res) {
    try {
      const { id } = req.params;
      const deleted = await TicketsModel.delete(parseInt(id, 10));

      if (!deleted) {
        res.status(404).json({ error: 'Ticket not found' });
        return;
      }

      res.status(200).json({ success: true, message: 'Ticket deleted successfully' });
    } catch (error) {
      console.error('Error in deleteTicket:', error);
      res.status(500).json({ error: 'Failed to delete ticket' });
    }
  }

  static async getTicketCount(req, res) {
    try {
      const count = await TicketsModel.count();
      res.status(200).json({ success: true, data: { count } });
    } catch (error) {
      console.error('Error in getTicketCount:', error);
      res.status(500).json({ error: 'Failed to get ticket count' });
    }
  }

  static async searchByDateRange(req, res) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({ error: 'Missing required query parameters: startDate, endDate' });
        return;
      }

      const tickets = await TicketsModel.searchByDateRange(startDate, endDate);

      res.status(200).json({ success: true, data: tickets });
    } catch (error) {
      console.error('Error in searchByDateRange:', error);
      res.status(500).json({ error: 'Failed to search tickets' });
    }
  }

  /**
   * Create ticket with image upload to S3
   * Expects multipart/form-data with:
   * - image: File (binary image data)
   * - data: JSON string (ticket metadata)
   */
  static async createTicketWithImage(req, res) {
    try {
      console.log('📥 createTicketWithImage request received');
      
      // Validate that image file is provided
      if (!req.file) {
        console.warn('⚠️ No image file provided');
        res.status(400).json({ error: 'Image file is required' });
        return;
      }

      // Parse the data field (should be JSON string)
      let ticketData;
      try {
        ticketData = JSON.parse(req.body.data);
        console.log('✓ Ticket data parsed:', { trace_no: ticketData.trace_no, terminal_id: ticketData.terminal_id });
      } catch (parseError) {
        console.error('❌ Failed to parse ticket data:', parseError);
        res.status(400).json({ error: 'Invalid JSON in data field' });
        return;
      }

      // Validate required fields
      const requiredFields = [
        'date',
        'time',
        'terminal_id',
        'location',
        'no_tickets',
        'total_amount',
        'ticket_amount_pp',
        'scanned_data',
      ];

      for (const field of requiredFields) {
        if (!(field in ticketData) || ticketData[field] === undefined || ticketData[field] === null) {
          console.warn(`⚠️ Missing required field: ${field}`);
          res.status(400).json({ error: `Missing required field: ${field}` });
          return;
        }
      }

      // Use trace_no for image filename, generate if not provided
      const trace_no = ticketData.trace_no || `TRACE_${Date.now()}`;
      
      try {
        // Upload image to S3
        console.log('🔄 Uploading image to S3...');
        const imagePath = await uploadTicketImage(
          req.file.buffer,
          req.file.originalname,
          trace_no
        );
        console.log('✓ Image uploaded successfully:', imagePath);

        // Add image path to ticket data
        ticketData.ticket_img_path = imagePath;

        // Create ticket with image path
        const newTicket = await TicketsModel.create(ticketData);
        console.log('✓ Ticket created with ID:', newTicket.id);

        res.status(201).json({ 
          success: true, 
          data: newTicket,
          message: `✓ Ticket saved successfully (Trace: ${trace_no})`
        });
      } catch (uploadError) {
        console.error('❌ Image upload failed:', uploadError);
        // Return detailed error message
        res.status(500).json({ 
          error: uploadError.message || 'Failed to upload image to S3',
          details: uploadError.toString()
        });
      }
    } catch (error) {
      console.error('❌ Error in createTicketWithImage:', error);
      res.status(500).json({ error: 'Failed to create ticket with image' });
    }
  }
}

module.exports = TicketsController;
