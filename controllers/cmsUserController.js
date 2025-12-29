const UserCms = require('../models/UserCms');
const { runDefaultSeeders } = require('../database/seeders/defaultSeeders/defaultSeederRunner');

/**
 * @desc    Get all CMS users
 * @route   GET /api/cms/users
 * @access  Private/Admin
 */
exports.getAllUsers = async (req, res) => {
  try {
    const { role, status, page = 1, limit = 10 } = req.query;

    // Build filter
    let filter = {};
    if (role) filter.role = role;
    if (status) filter.status = status;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get users
    const users = await UserCms.find(filter)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    // Get total count
    const total = await UserCms.countDocuments(filter);

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get single CMS user
 * @route   GET /api/cms/users/:id
 * @access  Private
 */
exports.getUser = async (req, res) => {
  try {
    const user = await UserCms.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get user by operator ID
 * @route   GET /api/cms/users/operator/:operatorId
 * @access  Private
 */
exports.getUserByOperatorId = async (req, res) => {
  try {
    // Find user where any operator subdocument has matching operatorId
    const user = await UserCms.findOne({ 'operatorId.operatorId': req.params.operatorId }).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Create CMS user
 * @route   POST /api/cms/users
 * @access  Private/Admin
 */
exports.createUser = async (req, res) => {
  try {
    const { operatorId, name, email, password, phone, websiteUrl, role, permissions } = req.body;

    // Normalize operatorId input to an array of operator objects
    let operatorArray = [];
    if (Array.isArray(operatorId)) {
      operatorArray = operatorId;
    } else if (operatorId && typeof operatorId === 'object') {
      operatorArray = [operatorId];
    } else if (operatorId) {
      // legacy: accept plain string/number as operatorId
      operatorArray = [{ operatorId: String(operatorId) }];
    }

    // Normalize subdocument field names: map OIFNo → operatorId for backward compatibility
    operatorArray = operatorArray.map((o) => {
      if (o && o.OIFNo && !o.operatorId) {
        return { ...o, operatorId: String(o.OIFNo) };
      }
      return o;
    });

    // Basic validation
    if (!operatorArray.length || !name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Ensure at least one operator has an operatorId
    const operatorIds = operatorArray.map((o) => (o && o.operatorId ? String(o.operatorId) : null)).filter(Boolean);
    if (!operatorIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one operator with an operatorId',
      });
    }

    // Check if user already exists by email only (allow multiple operatorIds to be assigned to one user)
    let user = await UserCms.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Create user with normalized operator array
    user = await UserCms.create({
      operatorId: operatorArray,
      name,
      email,
      password,
      phone,
      websiteUrl,
      role: role || 'manager',
      permissions: permissions || [],
    });

    // Run default seeders for primary operator (use the first operatorId)
    // let seederResult = null;
    // const primaryOperatorId = operatorIds[0];
    // try {
    //   seederResult = await runDefaultSeeders(primaryOperatorId, primaryOperatorId);
    //   console.log(`✅ Default seeders completed for operator ${primaryOperatorId}`);
    // } catch (seederError) {
    //   console.error(`⚠️  Default seeders encountered an error for operator ${primaryOperatorId}:`, seederError.message);
    //   // Don't fail user creation if seeders fail - log warning instead
    // }
    const seederResult = null;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: user._id,
        operatorId: user.operatorId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        websiteUrl: user.websiteUrl,
        role: user.role,
        status: user.status,
      },
      seederInfo: seederResult
        ? {
            success: seederResult.success,
            message: seederResult.message,
            seededTables: seederResult.seededTables,
            errors: seederResult.errors,
          }
        : null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Update CMS user
 * @route   PUT /api/cms/users/:id
 * @access  Private/Admin
 */
exports.updateUser = async (req, res) => {
  try {
    let user = await UserCms.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const { operatorId, name, phone, websiteUrl, role, status, permissions } = req.body;

    // Update allowed fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (websiteUrl) user.websiteUrl = websiteUrl;
    if (role) user.role = role;
    if (status) user.status = status;
    if (permissions) user.permissions = permissions;

    // If operatorId provided, normalize and validate then assign
    if (typeof operatorId !== 'undefined') {
      let operatorArray = [];
      if (Array.isArray(operatorId)) {
        operatorArray = operatorId;
      } else if (operatorId && typeof operatorId === 'object') {
        operatorArray = [operatorId];
      } else if (operatorId) {
        operatorArray = [{ operatorId: String(operatorId) }];
      }

      // Normalize subdocument field names: map OIFNo → operatorId for backward compatibility
      operatorArray = operatorArray.map((o) => {
        if (o && o.OIFNo && !o.operatorId) {
          return { ...o, operatorId: String(o.OIFNo) };
        }
        return o;
      });

      // Ensure at least one operator has an operatorId
      const operatorIds = operatorArray.map((o) => (o && o.operatorId ? String(o.operatorId) : null)).filter(Boolean);
      if (!operatorIds.length) {
        return res.status(400).json({
          success: false,
          message: 'Please provide at least one operator with an operatorId',
        });
      }

      // Assign normalized operator array (subdocuments may include _id to update existing entries)
      user.operatorId = operatorArray;
    }

    user.updatedAt = new Date();
    user = await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        id: user._id,
        operatorId: user.operatorId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        websiteUrl: user.websiteUrl,
        role: user.role,
        status: user.status,
        permissions: user.permissions,
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
 * @desc    Delete CMS user
 * @route   DELETE /api/cms/users/:id
 * @access  Private/Admin
 */
exports.deleteUser = async (req, res) => {
  try {
    const user = await UserCms.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: {
        id: user._id,
        operatorId: user.operatorId,
        name: user.name,
        email: user.email,
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
 * @desc    Unlock user account
 * @route   PUT /api/cms/users/:id/unlock
 * @access  Private/Admin
 */
exports.unlockUser = async (req, res) => {
  try {
    let user = await UserCms.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.isLocked = false;
    user.loginAttempts = 0;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User account unlocked successfully',
      data: {
        id: user._id,
        operatorId: user.operatorId,
        name: user.name,
        isLocked: user.isLocked,
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
 * @desc    Suspend user account
 * @route   PUT /api/cms/users/:id/suspend
 * @access  Private/Admin
 */
exports.suspendUser = async (req, res) => {
  try {
    let user = await UserCms.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.status = 'suspended';
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User account suspended successfully',
      data: {
        id: user._id,
        operatorId: user.operatorId,
        name: user.name,
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
 * @desc    Activate user account
 * @route   PUT /api/cms/users/:id/activate
 * @access  Private/Admin
 */
exports.activateUser = async (req, res) => {
  try {
    let user = await UserCms.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.status = 'active';
    user.isLocked = false;
    user.loginAttempts = 0;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User account activated successfully',
      data: {
        id: user._id,
        operatorId: user.operatorId,
        name: user.name,
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
