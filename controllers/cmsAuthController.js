const jwt = require('jsonwebtoken');
const UserCms = require('../models/UserCms');

// Generate JWT Token
const generateToken = (id, operatorId) => {
  return jwt.sign({ id, operatorId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

/**
 * @desc    Register CMS user
 * @route   POST /api/cms/auth/register
 * @access  Public
 */
exports.register = async (req, res) => {
  try {
    const { operatorId, name, email, password, phone, role } = req.body;

    // Validation
    if (!operatorId || !name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: operatorId, name, email, password',
      });
    }

    // Check if user already exists
    let user = await UserCms.findOne({ $or: [{ email }, { operatorId }] });
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or operatorId already exists',
      });
    }

    // Create user
    user = await UserCms.create({
      operatorId,
      name,
      email,
      password,
      phone,
      role: role || 'manager',
    });

    // Create token
    const token = generateToken(user._id, user.operatorId);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        operatorId: user.operatorId,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Login CMS user
 * @route   POST /api/cms/auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Check for user
    const user = await UserCms.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(403).json({
        success: false,
        message: 'Account is locked. Please contact administrator',
      });
    }

    // Check if account is active
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: `Account is ${user.status}. Please contact administrator`,
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      // Increment login attempts
      user.loginAttempts += 1;
      
      // Lock account after 5 failed attempts
      if (user.loginAttempts >= 5) {
        user.isLocked = true;
      }
      
      await user.save();

      return res.status(401).json({
        success: false,
        message: `Invalid credentials. Attempts: ${user.loginAttempts}/5`,
      });
    }

    // Reset login attempts on successful login
    user.loginAttempts = 0;
    user.lastLogin = new Date();
    await user.save();

    // Create token
    const token = generateToken(user._id, user.operatorId);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        operatorId: user.operatorId,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get current logged in CMS user
 * @route   GET /api/cms/auth/me
 * @access  Private
 */
exports.getMe = async (req, res) => {
  try {
    const user = await UserCms.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        operatorId: user.operatorId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        permissions: user.permissions,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Logout CMS user
 * @route   POST /api/cms/auth/logout
 * @access  Private
 */
exports.logout = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Update password
 * @route   PUT /api/cms/auth/change-password
 * @access  Private
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New passwords do not match',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    // Get user with password field
    const user = await UserCms.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Refresh token
 * @route   POST /api/cms/auth/refresh-token
 * @access  Private
 */
exports.refreshToken = async (req, res) => {
  try {
    const user = await UserCms.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const token = generateToken(user._id, user.operatorId);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
