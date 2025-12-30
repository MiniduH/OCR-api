const { query } = require('../config/database');

class PermissionsModel {
  static async createTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS permissions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    try {
      await query(createTableQuery);
      console.log('✓ Permissions table created successfully');
    } catch (error) {
      console.error('Error creating permissions table:', error);
      throw error;
    }
  }

  static async create(permission) {
    const {
      name,
      description,
    } = permission;

    const insertQuery = `
      INSERT INTO permissions (
        name,
        description
      )
      VALUES ($1, $2)
      RETURNING *;
    `;

    const values = [
      name,
      description || null,
    ];

    try {
      const result = await query(insertQuery, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating permission:', error);
      throw error;
    }
  }

  static async getById(id) {
    const selectQuery = 'SELECT * FROM permissions WHERE id = $1';

    try {
      const result = await query(selectQuery, [id]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error getting permission by ID:', error);
      throw error;
    }
  }

  static async getByName(name) {
    const selectQuery = 'SELECT * FROM permissions WHERE name = $1';

    try {
      const result = await query(selectQuery, [name]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error getting permission by name:', error);
      throw error;
    }
  }

  static async getAll(limit = 100, offset = 0) {
    const selectQuery = 'SELECT * FROM permissions ORDER BY name ASC LIMIT $1 OFFSET $2';

    try {
      const result = await query(selectQuery, [limit, offset]);
      return result.rows;
    } catch (error) {
      console.error('Error getting all permissions:', error);
      throw error;
    }
  }

  static async count() {
    const countQuery = 'SELECT COUNT(*) FROM permissions';

    try {
      const result = await query(countQuery);
      return parseInt(result.rows[0].count, 10);
    } catch (error) {
      console.error('Error counting permissions:', error);
      throw error;
    }
  }

  static async search(searchTerm, limit = 10, offset = 0) {
    const searchQuery = `
      SELECT * FROM permissions 
      WHERE name ILIKE $1 OR description ILIKE $1
      ORDER BY name ASC
      LIMIT $2 OFFSET $3
    `;

    try {
      const result = await query(searchQuery, [`%${searchTerm}%`, limit, offset]);
      return result.rows;
    } catch (error) {
      console.error('Error searching permissions:', error);
      throw error;
    }
  }
}

module.exports = PermissionsModel;
