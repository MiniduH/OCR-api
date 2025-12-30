const { query } = require('../config/database');

class TicketsModel {
  static async createTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS tickets (
        id SERIAL PRIMARY KEY,
        date VARCHAR(50) NOT NULL,
        time VARCHAR(50) NOT NULL,
        terminal_id VARCHAR(100) NOT NULL,
        location VARCHAR(255) NOT NULL,
        no_tickets INTEGER NOT NULL,
        total_amount VARCHAR(100) NOT NULL,
        trace_no VARCHAR(255),
        reference_no VARCHAR(255),
        ticket_amount_pp VARCHAR(100) NOT NULL,
        ticket_img_path TEXT,
        scanned_data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    try {
      await query(createTableQuery);
      console.log('✓ Tickets table created successfully');
    } catch (error) {
      console.error('Error creating tickets table:', error);
      throw error;
    }
  }

  static async create(ticket) {
    const {
      date,
      time,
      terminal_id,
      location,
      no_tickets,
      total_amount,
      trace_no,
      reference_no,
      ticket_amount_pp,
      ticket_img_path,
      scanned_data,
    } = ticket;

    const insertQuery = `
      INSERT INTO tickets (
        date,
        time,
        terminal_id,
        location,
        no_tickets,
        total_amount,
        trace_no,
        reference_no,
        ticket_amount_pp,
        ticket_img_path,
        scanned_data
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *;
    `;

    const values = [
      date,
      time,
      terminal_id,
      location,
      no_tickets,
      total_amount,
      trace_no || null,
      reference_no || null,
      ticket_amount_pp,
      ticket_img_path,
      JSON.stringify(scanned_data),
    ];

    try {
      const result = await query(insertQuery, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  }

  static async getById(id) {
    const selectQuery = 'SELECT * FROM tickets WHERE id = $1';

    try {
      const result = await query(selectQuery, [id]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error getting ticket by ID:', error);
      throw error;
    }
  }

  static async getByTraceNo(traceNo) {
    const selectQuery = 'SELECT * FROM tickets WHERE trace_no = $1';

    try {
      const result = await query(selectQuery, [traceNo]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error getting ticket by trace number:', error);
      throw error;
    }
  }

  static async getAll(limit = 10, offset = 0) {
    const selectQuery = 'SELECT * FROM tickets ORDER BY created_at DESC LIMIT $1 OFFSET $2';

    try {
      const result = await query(selectQuery, [limit, offset]);
      return result.rows;
    } catch (error) {
      console.error('Error getting all tickets:', error);
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
        if (key === 'scanned_data') {
          values.push(JSON.stringify(value));
        } else {
          values.push(value);
        }
        paramCount++;
      }
    });

    updateFields.push(`updated_at = $${paramCount}`);
    values.push(new Date());
    paramCount++;

    values.push(id);

    const updateQuery = `
      UPDATE tickets
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *;
    `;

    try {
      const result = await query(updateQuery, values);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error updating ticket:', error);
      throw error;
    }
  }

  static async delete(id) {
    const deleteQuery = 'DELETE FROM tickets WHERE id = $1';

    try {
      const result = await query(deleteQuery, [id]);
      return result.rowCount ? result.rowCount > 0 : false;
    } catch (error) {
      console.error('Error deleting ticket:', error);
      throw error;
    }
  }

  static async count() {
    const countQuery = 'SELECT COUNT(*) FROM tickets';

    try {
      const result = await query(countQuery);
      return parseInt(result.rows[0].count, 10);
    } catch (error) {
      console.error('Error counting tickets:', error);
      throw error;
    }
  }

  static async searchByDateRange(startDate, endDate) {
    const searchQuery = `
      SELECT * FROM tickets
      WHERE date >= $1 AND date <= $2
      ORDER BY created_at DESC
    `;

    try {
      const result = await query(searchQuery, [startDate, endDate]);
      return result.rows;
    } catch (error) {
      console.error('Error searching tickets by date range:', error);
      throw error;
    }
  }
}

module.exports = TicketsModel;
