const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

// Role mapping: numeric IDs to role names
const ROLE_MAP = {
  1: 'admin',
  2: 'moderator',
  3: 'user',
};

const REVERSE_ROLE_MAP = {
  'admin': 1,
  'moderator': 2,
  'user': 3,
};

class UsersModel {
  // Helper function to convert numeric role ID to role name
  static convertRoleToString(role) {
    if (typeof role === 'number') {
      return ROLE_MAP[role] || 'user';
    }
    return role || 'user';
  }

  // Helper function to hash password
  static async hashPassword(password) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      return hashedPassword;
    } catch (error) {
      console.error('Error hashing password:', error);
      throw error;
    }
  }
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

    // Convert numeric role to string
    const roleString = this.convertRoleToString(role);

    // Hash password
    const hashedPassword = await this.hashPassword(password);

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
      hashedPassword,
      phone || null,
      roleString,
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

    // Convert numeric role to string if provided
    if (updates.role) {
      updates.role = this.convertRoleToString(updates.role);
    }

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

    // Hash password if it's being updated
    if (updates.password) {
      const passwordIndex = updateFields.findIndex(field => field.includes('password'));
      if (passwordIndex !== -1) {
        values[passwordIndex] = await this.hashPassword(updates.password);
      }
    }

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
