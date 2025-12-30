const { query } = require('../config/database');

class UsersModel {
  static async createTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        username VARCHAR(100) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
        status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
        department VARCHAR(255),
        is_verified BOOLEAN DEFAULT FALSE,
        last_login TIMESTAMP,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    try {
      await query(createTableQuery);
      console.log('✓ Users table created successfully');
    } catch (error) {
      console.error('Error creating users table:', error);
      throw error;
    }
  }

  static async create(user) {
    const {
      first_name,
      last_name,
      username,
      email,
      password,
      phone,
      role,
      status,
      department,
      is_verified,
      metadata,
    } = user;

    const insertQuery = `
      INSERT INTO users (
        first_name,
        last_name,
        username,
        email,
        password,
        phone,
        role,
        status,
        department,
        is_verified,
        metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *;
    `;

    const values = [
      first_name,
      last_name,
      username,
      email,
      password,
      phone || null,
      role || 'user',
      status || 'active',
      department || null,
      is_verified || false,
      JSON.stringify(metadata || {}),
    ];

    try {
      const result = await query(insertQuery, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async getById(id) {
    const selectQuery = 'SELECT * FROM users WHERE id = $1';

    try {
      const result = await query(selectQuery, [id]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  }

  static async getByUsername(username) {
    const selectQuery = 'SELECT * FROM users WHERE username = $1';

    try {
      const result = await query(selectQuery, [username]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error getting user by username:', error);
      throw error;
    }
  }

  static async getByEmail(email) {
    const selectQuery = 'SELECT * FROM users WHERE email = $1';

    try {
      const result = await query(selectQuery, [email]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  }

  static async getAll(limit = 10, offset = 0) {
    const selectQuery = 'SELECT * FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2';

    try {
      const result = await query(selectQuery, [limit, offset]);
      return result.rows;
    } catch (error) {
      console.error('Error getting all users:', error);
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
        if (key === 'metadata') {
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
      UPDATE users
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *;
    `;

    try {
      const result = await query(updateQuery, values);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  static async delete(id) {
    const deleteQuery = 'DELETE FROM users WHERE id = $1';

    try {
      const result = await query(deleteQuery, [id]);
      return result.rowCount ? result.rowCount > 0 : false;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  static async count() {
    const countQuery = 'SELECT COUNT(*) FROM users';

    try {
      const result = await query(countQuery);
      return parseInt(result.rows[0].count, 10);
    } catch (error) {
      console.error('Error counting users:', error);
      throw error;
    }
  }

  static async getByRole(role) {
    const selectQuery = 'SELECT * FROM users WHERE role = $1 ORDER BY created_at DESC';

    try {
      const result = await query(selectQuery, [role]);
      return result.rows;
    } catch (error) {
      console.error('Error getting users by role:', error);
      throw error;
    }
  }

  static async getByStatus(status) {
    const selectQuery = 'SELECT * FROM users WHERE status = $1 ORDER BY created_at DESC';

    try {
      const result = await query(selectQuery, [status]);
      return result.rows;
    } catch (error) {
      console.error('Error getting users by status:', error);
      throw error;
    }
  }
}

module.exports = UsersModel;
