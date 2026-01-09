const TicketsModel = require('../models/Tickets');

/**
 * WebSocket handlers for Tickets
 * Manages real-time ticket operations via Socket.IO
 */

class TicketsSocketHandler {
  /**
   * Initialize WebSocket handlers
   * @param {Socket} socket - Socket.IO socket instance
   */
  static initialize(socket) {
    console.log(`📱 Client connected: ${socket.id}`);

    // Handle getting all tickets with pagination
    socket.on('get-tickets', async (data, callback) => {
      try {
        console.log(`🔍 get-tickets request from ${socket.id}`, data);
        
        const limit = data?.limit || 10;
        const offset = data?.offset || 0;

        const tickets = await TicketsModel.getAll(limit, offset);
        const count = await TicketsModel.count();

        // Sort tickets by latest first (descending order by id/created_at)
        const sortedTickets = tickets.sort((a, b) => {
          const dateA = new Date(a.created_at || a.date || 0).getTime();
          const dateB = new Date(b.created_at || b.date || 0).getTime();
          return dateB - dateA; // Latest first
        });

        const response = {
          success: true,
          data: sortedTickets,
          pagination: {
            limit,
            offset,
            total: count,
          },
        };

        console.log(`✓ Sending ${sortedTickets.length} tickets (latest first) to ${socket.id}`);
        callback(response);
      } catch (error) {
        console.error('❌ Error in get-tickets:', error);
        callback({
          success: false,
          error: 'Failed to get tickets',
          message: error.message,
        });
      }
    });

    // Handle getting ticket by ID
    socket.on('get-ticket-by-id', async (data, callback) => {
      try {
        console.log(`🔍 get-ticket-by-id request from ${socket.id}`, data);
        
        const ticket = await TicketsModel.getById(parseInt(data.id, 10));

        if (!ticket) {
          return callback({
            success: false,
            error: 'Ticket not found',
          });
        }

        callback({
          success: true,
          data: ticket,
        });
      } catch (error) {
        console.error('❌ Error in get-ticket-by-id:', error);
        callback({
          success: false,
          error: 'Failed to get ticket',
          message: error.message,
        });
      }
    });

    // Handle getting ticket by trace number
    socket.on('get-ticket-by-trace', async (data, callback) => {
      try {
        console.log(`🔍 get-ticket-by-trace request from ${socket.id}`, data);
        
        const ticket = await TicketsModel.getByTraceNo(data.traceNo);

        if (!ticket) {
          return callback({
            success: false,
            error: 'Ticket not found',
          });
        }

        callback({
          success: true,
          data: ticket,
        });
      } catch (error) {
        console.error('❌ Error in get-ticket-by-trace:', error);
        callback({
          success: false,
          error: 'Failed to get ticket',
          message: error.message,
        });
      }
    });

    // Handle getting ticket count
    socket.on('get-ticket-count', async (data, callback) => {
      try {
        console.log(`📊 get-ticket-count request from ${socket.id}`);
        
        const count = await TicketsModel.count();

        callback({
          success: true,
          data: { count },
        });
      } catch (error) {
        console.error('❌ Error in get-ticket-count:', error);
        callback({
          success: false,
          error: 'Failed to get ticket count',
          message: error.message,
        });
      }
    });

    // Handle searching tickets by date range
    socket.on('search-tickets-by-date', async (data, callback) => {
      try {
        console.log(`🔍 search-tickets-by-date request from ${socket.id}`, data);
        
        const { startDate, endDate } = data;

        if (!startDate || !endDate) {
          return callback({
            success: false,
            error: 'Missing required parameters: startDate, endDate',
          });
        }

        const tickets = await TicketsModel.searchByDateRange(startDate, endDate);

        // Sort tickets by latest first
        const sortedTickets = tickets.sort((a, b) => {
          const dateA = new Date(a.created_at || a.date || 0).getTime();
          const dateB = new Date(b.created_at || b.date || 0).getTime();
          return dateB - dateA; // Latest first
        });

        callback({
          success: true,
          data: sortedTickets,
        });
      } catch (error) {
        console.error('❌ Error in search-tickets-by-date:', error);
        callback({
          success: false,
          error: 'Failed to search tickets',
          message: error.message,
        });
      }
    });

    // Handle watching tickets (subscribe to updates)
    socket.on('watch-tickets', async (data, callback) => {
      try {
        console.log(`👁️  Client ${socket.id} is watching tickets`);
        
        socket.join('tickets-room');
        
        // Get current tickets
        const limit = data?.limit || 10;
        const offset = data?.offset || 0;
        const tickets = await TicketsModel.getAll(limit, offset);
        const count = await TicketsModel.count();

        // Sort tickets by latest first
        const sortedTickets = tickets.sort((a, b) => {
          const dateA = new Date(a.created_at || a.date || 0).getTime();
          const dateB = new Date(b.created_at || b.date || 0).getTime();
          return dateB - dateA; // Latest first
        });

        callback({
          success: true,
          message: 'Subscribed to ticket updates',
          data: sortedTickets,
          pagination: {
            limit,
            offset,
            total: count,
          },
        });
      } catch (error) {
        console.error('❌ Error in watch-tickets:', error);
        callback({
          success: false,
          error: 'Failed to watch tickets',
          message: error.message,
        });
      }
    });

    // Handle stopping watch on tickets
    socket.on('unwatch-tickets', (data, callback) => {
      try {
        console.log(`👁️  Client ${socket.id} stopped watching tickets`);
        
        socket.leave('tickets-room');
        
        callback({
          success: true,
          message: 'Unsubscribed from ticket updates',
        });
      } catch (error) {
        console.error('❌ Error in unwatch-tickets:', error);
        callback({
          success: false,
          error: 'Failed to unwatch tickets',
          message: error.message,
        });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`📴 Client disconnected: ${socket.id}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`❌ Socket error from ${socket.id}:`, error);
    });
  }

  /**
   * Broadcast ticket update to all connected clients watching tickets
   * @param {object} io - Socket.IO instance
   * @param {object} ticket - Updated ticket data
   */
  static broadcastTicketUpdate(io, ticket) {
    console.log(`📢 Broadcasting ticket update:`, ticket.id);
    io.to('tickets-room').emit('ticket-updated', {
      success: true,
      data: ticket,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Broadcast ticket creation to all connected clients watching tickets
   * @param {object} io - Socket.IO instance
   * @param {object} ticket - New ticket data
   */
  static broadcastTicketCreated(io, ticket) {
    console.log(`📢 Broadcasting new ticket:`, ticket.id);
    io.to('tickets-room').emit('ticket-created', {
      success: true,
      data: ticket,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Broadcast ticket deletion to all connected clients watching tickets
   * @param {object} io - Socket.IO instance
   * @param {number} ticketId - Deleted ticket ID
   */
  static broadcastTicketDeleted(io, ticketId) {
    console.log(`📢 Broadcasting ticket deletion:`, ticketId);
    io.to('tickets-room').emit('ticket-deleted', {
      success: true,
      data: { id: ticketId },
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = TicketsSocketHandler;
