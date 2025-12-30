const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const UsersModel = require('../models/Users');
const AuthTokenModel = require('../models/AuthToken');

class AuthController {
  /**
   * Generate JWT access and refresh tokens
   * @private
   */
  static generateTokens(userId, email, username) {
    const accessTokenSecret = process.env.JWT_SECRET || 'your-secret-key';
    const refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
    const accessTokenExpiry = process.env.JWT_EXPIRY || '1h';
    const refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRY || '7d';

    const payload = {
      userId,
      email,
      username,
    };

    const accessToken = jwt.sign(payload, accessTokenSecret, {
      expiresIn: accessTokenExpiry,
    });

    const refreshToken = jwt.sign(payload, refreshTokenSecret, {
      expiresIn: refreshTokenExpiry,
    });

    // Calculate expiry timestamps
    const accessTokenDecoded = jwt.decode(accessToken);
    const refreshTokenDecoded = jwt.decode(refreshToken);

    return {
      accessToken,
      refreshToken,
      expiresAt: new Date(accessTokenDecoded.exp * 1000),
      refreshExpiresAt: new Date(refreshTokenDecoded.exp * 1000),
    };
  }

  /**
   * Register a new user
   */
  static async register(req, res) {
    try {
      const { first_name, last_name, username, email, password } = req.body;

      // Validate required fields
      const requiredFields = ['first_name', 'last_name', 'username', 'email', 'password'];
      for (const field of requiredFields) {
        if (!req.body[field]) {
          res.status(400).json({ error: `Missing required field: ${field}` });
          return;
        }
      }

      // Check if user already exists
      const existingUser = await UsersModel.getByEmail(email);
      if (existingUser) {
        res.status(409).json({ error: 'Email already registered' });
        return;
      }

      const existingUsername = await UsersModel.getByUsername(username);
      if (existingUsername) {
        res.status(409).json({ error: 'Username already taken' });
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const newUser = await UsersModel.create({
        first_name,
        last_name,
        username,
        email,
        password: hashedPassword,
        is_verified: false,
      });

      console.log('✓ User registered successfully:', { id: newUser.id, username });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
        },
      });
    } catch (error) {
      console.error('Error in register:', error);
      res.status(500).json({ error: 'Failed to register user' });
    }
  }

  /**
   * Login user and generate tokens
   */
  static async login(req, res) {
    try {
      const { email, username, password } = req.body;

      // Validate required fields
      if (!password) {
        res.status(400).json({ error: 'Password is required' });
        return;
      }

      if (!email && !username) {
        res.status(400).json({ error: 'Email or username is required' });
        return;
      }

      // Find user by email or username
      let user = null;
      if (email) {
        user = await UsersModel.getByEmail(email);
      } else {
        user = await UsersModel.getByUsername(username);
      }

      if (!user) {
        console.warn('⚠️ Login attempt with non-existent user:', { email, username });
        res.status(401).json({ error: 'Invalid email/username or password' });
        return;
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        console.warn('⚠️ Login attempt with invalid password:', { userId: user.id });
        res.status(401).json({ error: 'Invalid email/username or password' });
        return;
      }

      // Generate tokens
      const { accessToken, refreshToken, expiresAt, refreshExpiresAt } = 
        AuthController.generateTokens(user.id, user.email, user.username);

      // Store tokens in database
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('user-agent') || '';

      await AuthTokenModel.create({
        user_id: user.id,
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: expiresAt,
        refresh_expires_at: refreshExpiresAt,
        ip_address: ipAddress,
        user_agent: userAgent,
      });

      // Update last login
      await UsersModel.update(user.id, { last_login: new Date() });

      console.log('✓ User logged in successfully:', { userId: user.id, username: user.username });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role,
          },
          tokens: {
            accessToken,
            refreshToken,
            expiresAt,
            tokenType: 'Bearer',
          },
        },
      });
    } catch (error) {
      console.error('Error in login:', error);
      res.status(500).json({ error: 'Failed to login' });
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({ error: 'Refresh token is required' });
        return;
      }

      // Verify refresh token
      const refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
      let decoded;
      try {
        decoded = jwt.verify(refreshToken, refreshTokenSecret);
      } catch (jwtError) {
        console.warn('⚠️ Invalid refresh token:', jwtError.message);
        res.status(401).json({ error: 'Invalid or expired refresh token' });
        return;
      }

      // Check if token exists in database and is not revoked
      const storedToken = await AuthTokenModel.getByRefreshToken(refreshToken);
      if (!storedToken) {
        console.warn('⚠️ Refresh token not found in database:', { userId: decoded.userId });
        res.status(401).json({ error: 'Refresh token not found or revoked' });
        return;
      }

      // Get user
      const user = await UsersModel.getById(decoded.userId);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Generate new tokens
      const { accessToken, expiresAt } = AuthController.generateTokens(
        user.id,
        user.email,
        user.username
      );

      console.log('✓ Token refreshed successfully:', { userId: user.id });

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken,
          expiresAt,
          tokenType: 'Bearer',
        },
      });
    } catch (error) {
      console.error('Error in refreshToken:', error);
      res.status(500).json({ error: 'Failed to refresh token' });
    }
  }

  /**
   * Logout user and revoke tokens
   */
  static async logout(req, res) {
    try {
      const { accessToken } = req.body;

      if (!accessToken) {
        res.status(400).json({ error: 'Access token is required' });
        return;
      }

      // Find and revoke the token
      const tokenRecord = await AuthTokenModel.getByAccessToken(accessToken);
      if (tokenRecord) {
        await AuthTokenModel.revokeToken(tokenRecord.id);
        console.log('✓ User logged out successfully:', { userId: tokenRecord.user_id });
      }

      res.status(200).json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      console.error('Error in logout:', error);
      res.status(500).json({ error: 'Failed to logout' });
    }
  }

  /**
   * Logout all devices (revoke all user tokens)
   */
  static async logoutAllDevices(req, res) {
    try {
      const { userId } = req.body;

      if (!userId) {
        res.status(400).json({ error: 'User ID is required' });
        return;
      }

      // Check if user exists
      const user = await UsersModel.getById(userId);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Revoke all user tokens
      await AuthTokenModel.revokeAllUserTokens(userId);
      console.log('✓ All user tokens revoked:', { userId });

      res.status(200).json({
        success: true,
        message: 'Logged out from all devices successfully',
      });
    } catch (error) {
      console.error('Error in logoutAllDevices:', error);
      res.status(500).json({ error: 'Failed to logout from all devices' });
    }
  }

  /**
   * Verify access token
   */
  static async verifyToken(req, res) {
    try {
      const { accessToken } = req.body;

      if (!accessToken) {
        res.status(400).json({ error: 'Access token is required' });
        return;
      }

      // Check if token exists in database and is not revoked
      const tokenRecord = await AuthTokenModel.getByAccessToken(accessToken);
      if (!tokenRecord) {
        res.status(401).json({ success: false, error: 'Token is invalid or revoked' });
        return;
      }

      // Get user info
      const user = await UsersModel.getById(tokenRecord.user_id);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Token is valid',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
          },
          tokenExpiry: tokenRecord.expires_at,
        },
      });
    } catch (error) {
      console.error('Error in verifyToken:', error);
      res.status(500).json({ error: 'Failed to verify token' });
    }
  }

  /**
   * Get user tokens
   */
  static async getUserTokens(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        res.status(400).json({ error: 'User ID is required' });
        return;
      }

      // Check if user exists
      const user = await UsersModel.getById(parseInt(userId, 10));
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Get user tokens
      const tokens = await AuthTokenModel.getByUserId(parseInt(userId, 10));

      res.status(200).json({
        success: true,
        data: tokens.map((token) => ({
          id: token.id,
          token_type: token.token_type,
          is_revoked: token.is_revoked,
          expires_at: token.expires_at,
          ip_address: token.ip_address,
          user_agent: token.user_agent,
          created_at: token.created_at,
        })),
      });
    } catch (error) {
      console.error('Error in getUserTokens:', error);
      res.status(500).json({ error: 'Failed to get user tokens' });
    }
  }

  /**
   * Revoke specific token
   */
  static async revokeSpecificToken(req, res) {
    try {
      const { tokenId } = req.params;

      if (!tokenId) {
        res.status(400).json({ error: 'Token ID is required' });
        return;
      }

      const token = await AuthTokenModel.getById(parseInt(tokenId, 10));
      if (!token) {
        res.status(404).json({ error: 'Token not found' });
        return;
      }

      const revokedToken = await AuthTokenModel.revokeToken(parseInt(tokenId, 10));
      console.log('✓ Token revoked:', { tokenId, userId: token.user_id });

      res.status(200).json({
        success: true,
        message: 'Token revoked successfully',
        data: revokedToken,
      });
    } catch (error) {
      console.error('Error in revokeSpecificToken:', error);
      res.status(500).json({ error: 'Failed to revoke token' });
    }
  }

  /**
   * Change user password
   */
  static async changePassword(req, res) {
    try {
      const { userId } = req.params;
      const { currentPassword, newPassword, confirmPassword } = req.body;

      // Validate required fields
      if (!currentPassword || !newPassword || !confirmPassword) {
        res.status(400).json({ error: 'All password fields are required' });
        return;
      }

      if (newPassword !== confirmPassword) {
        res.status(400).json({ error: 'New passwords do not match' });
        return;
      }

      if (newPassword.length < 8) {
        res.status(400).json({ error: 'Password must be at least 8 characters long' });
        return;
      }

      // Get user
      const user = await UsersModel.getById(parseInt(userId, 10));
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        res.status(401).json({ error: 'Current password is incorrect' });
        return;
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await UsersModel.update(parseInt(userId, 10), { password: hashedPassword });

      // Revoke all tokens for security
      await AuthTokenModel.revokeAllUserTokens(parseInt(userId, 10));

      console.log('✓ Password changed successfully:', { userId });

      res.status(200).json({
        success: true,
        message: 'Password changed successfully. Please login again.',
      });
    } catch (error) {
      console.error('Error in changePassword:', error);
      res.status(500).json({ error: 'Failed to change password' });
    }
  }

  /**
   * Cleanup expired tokens (can be called periodically)
   */
  static async cleanupExpiredTokens(req, res) {
    try {
      const count = await AuthTokenModel.cleanupExpiredTokens();

      res.status(200).json({
        success: true,
        message: 'Expired tokens cleaned up',
        data: { deletedCount: count },
      });
    } catch (error) {
      console.error('Error in cleanupExpiredTokens:', error);
      res.status(500).json({ error: 'Failed to cleanup tokens' });
    }
  }
}

module.exports = AuthController;
