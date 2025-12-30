const { query } = require('../config/database');

class ReprintRequestsModel {
  static async createTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS reprint_requests (
        id SERIAL PRIMARY KEY,
        ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
        trace_no VARCHAR(255) NOT NULL,
        reason VARCHAR(500) NOT NULL,
        requested_copies INTEGER DEFAULT 1,
        notes TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    try {
      await query(createTableQuery);
      console.log('✓ Reprint requests table created successfully');
    } catch (error) {
      console.error('Error creating reprint_requests table:', error);
      throw error;
    }
  }

  static async create(reprintRequest) {
    const {
      ticket_id,
      trace_no,
      reason,
      requested_copies = 1,
      notes = null,
    } = reprintRequest;

    const insertQuery = `
      INSERT INTO reprint_requests (
        ticket_id,
        trace_no,
        reason,
        requested_copies,
        notes,
        status
      )
      VALUES ($1, $2, $3, $4, $5, 'pending')
      RETURNING *;
    `;

    const values = [
      ticket_id,
      trace_no,
      reason,
      requested_copies,
      notes,
    ];

    try {
      const result = await query(insertQuery, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating reprint request:', error);
      throw error;
    }
  }

  static async getById(id) {
    const selectQuery = `
      SELECT rr.*, t.location, t.terminal_id, t.date, t.time
      FROM reprint_requests rr
      LEFT JOIN tickets t ON rr.ticket_id = t.id
      WHERE rr.id = $1
    `;

    try {
      const result = await query(selectQuery, [id]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error getting reprint request by ID:', error);
      throw error;
    }
  }

  static async getByTicketId(ticketId) {
    const selectQuery = `
      SELECT * FROM reprint_requests 
      WHERE ticket_id = $1 
      ORDER BY created_at DESC
    `;

    try {
      const result = await query(selectQuery, [ticketId]);
      return result.rows;
    } catch (error) {
      console.error('Error getting reprint requests by ticket ID:', error);
      throw error;
    }
  }

  static async getByTraceNo(traceNo) {
    const selectQuery = `
      SELECT rr.*, t.location, t.terminal_id, t.date, t.time
      FROM reprint_requests rr
      LEFT JOIN tickets t ON rr.ticket_id = t.id
      WHERE rr.trace_no = $1
      ORDER BY rr.created_at DESC
    `;

    try {
      const result = await query(selectQuery, [traceNo]);
      return result.rows;
    } catch (error) {
      console.error('Error getting reprint requests by trace number:', error);
      throw error;
    }
  }

  static async getAll(limit = 10, offset = 0) {
    const selectQuery = `
      SELECT rr.*, t.location, t.terminal_id, t.date, t.time
      FROM reprint_requests rr
      LEFT JOIN tickets t ON rr.ticket_id = t.id
      ORDER BY rr.created_at DESC 
      LIMIT $1 OFFSET $2
    `;

    try {
      const result = await query(selectQuery, [limit, offset]);
      return result.rows;
    } catch (error) {
      console.error('Error getting all reprint requests:', error);
      throw error;
    }
  }

  static async getByStatus(status, limit = 10, offset = 0) {
    const selectQuery = `
      SELECT rr.*, t.location, t.terminal_id, t.date, t.time
      FROM reprint_requests rr
      LEFT JOIN tickets t ON rr.ticket_id = t.id
      WHERE rr.status = $1
      ORDER BY rr.created_at DESC 
      LIMIT $2 OFFSET $3
    `;

    try {
      const result = await query(selectQuery, [status, limit, offset]);
      return result.rows;
    } catch (error) {
      console.error('Error getting reprint requests by status:', error);
      throw error;
    }
  }

  static async update(id, updates) {
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at') {
        updateFields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    updateFields.push(`updated_at = $${paramCount}`);
    values.push(new Date());
    paramCount++;

    values.push(id);

    const updateQuery = `
      UPDATE reprint_requests
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *;
    `;

    try {
      const result = await query(updateQuery, values);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error updating reprint request:', error);
      throw error;
    }
  }

  static async updateStatus(id, status) {
    const updateQuery = `
      UPDATE reprint_requests
      SET status = $1, updated_at = $2
      WHERE id = $3
      RETURNING *;
    `;

    try {
      const result = await query(updateQuery, [status, new Date(), id]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error updating reprint request status:', error);
      throw error;
    }
  }

  static async delete(id) {
    const deleteQuery = 'DELETE FROM reprint_requests WHERE id = $1 RETURNING *';

    try {
      const result = await query(deleteQuery, [id]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error deleting reprint request:', error);
      throw error;
    }
  }

  static async count() {
    const countQuery = 'SELECT COUNT(*) as count FROM reprint_requests';

    try {
      const result = await query(countQuery);
      return parseInt(result.rows[0].count, 10);
    } catch (error) {
      console.error('Error counting reprint requests:', error);
      throw error;
    }
  }

  static async countByStatus(status) {
    const countQuery = 'SELECT COUNT(*) as count FROM reprint_requests WHERE status = $1';

    try {
      const result = await query(countQuery, [status]);
      return parseInt(result.rows[0].count, 10);
    } catch (error) {
      console.error('Error counting reprint requests by status:', error);
      throw error;
    }
  }
}

module.exports = ReprintRequestsModel;
