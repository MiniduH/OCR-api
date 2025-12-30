const { query } = require('../config/database');

class AuthTokenModel {
  static async createTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS auth_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        access_token TEXT NOT NULL,
        refresh_token TEXT,
        token_type VARCHAR(50) DEFAULT 'Bearer',
        expires_at TIMESTAMP NOT NULL,
        refresh_expires_at TIMESTAMP,
        is_revoked BOOLEAN DEFAULT FALSE,
        device_info JSONB,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    try {
      await query(createTableQuery);
      console.log('✓ Auth Tokens table created successfully');
    } catch (error) {
      console.error('Error creating auth_tokens table:', error);
      throw error;
    }
  }

  static async create(tokenData) {
    const {
      user_id,
      access_token,
      refresh_token,
      expires_at,
      refresh_expires_at,
      device_info,
      ip_address,
      user_agent,
    } = tokenData;

    const insertQuery = `
      INSERT INTO auth_tokens (
        user_id,
        access_token,
        refresh_token,
        expires_at,
        refresh_expires_at,
        device_info,
        ip_address,
        user_agent
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;

    const values = [
      user_id,
      access_token,
      refresh_token || null,
      expires_at,
      refresh_expires_at || null,
      JSON.stringify(device_info || {}),
      ip_address || null,
      user_agent || null,
    ];

    try {
      const result = await query(insertQuery, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating auth token:', error);
      throw error;
    }
  }

  static async getByAccessToken(accessToken) {
    const selectQuery = `
      SELECT * FROM auth_tokens 
      WHERE access_token = $1 AND is_revoked = FALSE AND expires_at > CURRENT_TIMESTAMP
    `;

    try {
      const result = await query(selectQuery, [accessToken]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error getting token by access token:', error);
      throw error;
    }
  }

  static async getByRefreshToken(refreshToken) {
    const selectQuery = `
      SELECT * FROM auth_tokens 
      WHERE refresh_token = $1 AND is_revoked = FALSE AND refresh_expires_at > CURRENT_TIMESTAMP
    `;

    try {
      const result = await query(selectQuery, [refreshToken]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error getting token by refresh token:', error);
      throw error;
    }
  }

  static async getByUserId(userId) {
    const selectQuery = `
      SELECT * FROM auth_tokens 
      WHERE user_id = $1 AND is_revoked = FALSE 
      ORDER BY created_at DESC
    `;

    try {
      const result = await query(selectQuery, [userId]);
      return result.rows;
    } catch (error) {
      console.error('Error getting tokens by user ID:', error);
      throw error;
    }
  }

  static async getById(id) {
    const selectQuery = 'SELECT * FROM auth_tokens WHERE id = $1';

    try {
      const result = await query(selectQuery, [id]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error getting token by ID:', error);
      throw error;
    }
  }

  static async revokeToken(tokenId) {
    const updateQuery = `
      UPDATE auth_tokens 
      SET is_revoked = TRUE, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *;
    `;

    try {
      const result = await query(updateQuery, [tokenId]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error revoking token:', error);
      throw error;
    }
  }

  static async revokeAllUserTokens(userId) {
    const updateQuery = `
      UPDATE auth_tokens 
      SET is_revoked = TRUE, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1
      RETURNING *;
    `;

    try {
      const result = await query(updateQuery, [userId]);
      return result.rows;
    } catch (error) {
      console.error('Error revoking all user tokens:', error);
      throw error;
    }
  }

  static async delete(id) {
    const deleteQuery = 'DELETE FROM auth_tokens WHERE id = $1';

    try {
      const result = await query(deleteQuery, [id]);
      return result.rowCount ? result.rowCount > 0 : false;
    } catch (error) {
      console.error('Error deleting auth token:', error);
      throw error;
    }
  }

  static async cleanupExpiredTokens() {
    const deleteQuery = `
      DELETE FROM auth_tokens 
      WHERE is_revoked = TRUE 
      OR expires_at < CURRENT_TIMESTAMP 
      OR (refresh_expires_at < CURRENT_TIMESTAMP AND refresh_expires_at IS NOT NULL)
    `;

    try {
      const result = await query(deleteQuery);
      console.log(`✓ Cleaned up ${result.rowCount} expired tokens`);
      return result.rowCount;
    } catch (error) {
      console.error('Error cleaning up expired tokens:', error);
      throw error;
    }
  }
}

module.exports = AuthTokenModel;
