const CmsNavBar = require('../models/CmsNavBar');
const mongoose = require('mongoose');

/**
 * @desc    Get all navigation configurations
 * @route   GET /api/cms/nav-bar
 * @access  Public
 */
exports.getAllNavBar = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get navigation configurations
    const navBar = await CmsNavBar.find()
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    // Get total count
    const total = await CmsNavBar.countDocuments();

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
      data: navBar,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get navigation configuration by ID
 * @route   GET /api/cms/nav-bar/:id
 * @access  Public
 */
exports.getNavBar = async (req, res) => {
  try {
    const navBar = await CmsNavBar.findById(req.params.id);

    if (!navBar) {
      return res.status(404).json({
        success: false,
        message: 'Navigation configuration not found',
      });
    }

    res.status(200).json({
      success: true,
      data: navBar,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get navigation configuration by operator ID
 * @route   GET /api/cms/nav-bar/operator/:operatorId
 * @access  Public
 */
exports.getNavBarByOperatorId = async (req, res) => {
  try {
    const navBar = await CmsNavBar.findOne({ operatorId: req.params.operatorId });

    if (!navBar) {
      return res.status(404).json({
        success: false,
        message: 'Navigation configuration not found for this operator',
      });
    }

    res.status(200).json({
      success: true,
      data: navBar,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Create navigation configuration
 * @route   POST /api/cms/nav-bar
 * @access  Private/Admin
 */
exports.createNavBar = async (req, res) => {
  try {
    const {
      operatorId,
      template_id,
      links,
    } = req.body;

    // Validate required fields
    if (!operatorId || !template_id) {
      return res.status(400).json({
        success: false,
        message: 'operatorId and template_id are required',
      });
    }

    // Check if navigation configuration already exists for this operator
    const existingNavBar = await CmsNavBar.findOne({ operatorId });
    if (existingNavBar) {
      return res.status(400).json({
        success: false,
        message: 'Navigation configuration already exists for this operator',
      });
    }

    // Create navigation configuration
    const navBar = await CmsNavBar.create({
      operatorId,
      template_id,
      links,
    });

    res.status(201).json({
      success: true,
      message: 'Navigation configuration created successfully',
      data: navBar,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Update navigation configuration
 * @route   PUT /api/cms/nav-bar/:id
 * @access  Private/Admin
 */
exports.updateNavBar = async (req, res) => {
  try {
    const { id } = req.params;
    const { links } = req.body;

    // Check if navigation configuration exists
    let navBar = await CmsNavBar.findById(id);
    if (!navBar) {
      return res.status(404).json({
        success: false,
        message: 'Navigation configuration not found',
      });
    }

    // Update fields if provided
    if (links !== undefined) {
      // Sanitize links to remove invalid _ids (e.g. timestamps from frontend)
      if (Array.isArray(links)) {
        links.forEach(link => {
          if (link._id && !mongoose.Types.ObjectId.isValid(link._id)) {
            delete link._id;
          }
        });
      }
      navBar.links = links;
    }

    // Save updated navigation
    navBar = await navBar.save();

    res.status(200).json({
      success: true,
      message: 'Navigation configuration updated successfully',
      data: navBar,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Update navigation by operator ID
 * @route   PUT /api/cms/nav-bar/operator/:operatorId
 * @access  Private/Admin
 */
exports.updateNavBarByOperatorId = async (req, res) => {
  try {
    const { operatorId } = req.params;
    const { links } = req.body;

    // Check if navigation configuration exists
    let navBar = await CmsNavBar.findOne({ operatorId });
    if (!navBar) {
      return res.status(404).json({
        success: false,
        message: 'Navigation configuration not found for this operator',
      });
    }

    // Update fields if provided
    if (links !== undefined) {
      // Sanitize links to remove invalid _ids (e.g. timestamps from frontend)
      if (Array.isArray(links)) {
        links.forEach(link => {
          if (link._id && !mongoose.Types.ObjectId.isValid(link._id)) {
            delete link._id;
          }
        });
      }
      navBar.links = links;
    }

    // Save updated navigation
    navBar = await navBar.save();

    res.status(200).json({
      success: true,
      message: 'Navigation configuration updated successfully',
      data: navBar,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Delete navigation configuration
 * @route   DELETE /api/cms/nav-bar/:id
 * @access  Private/Super Admin
 */
exports.deleteNavBar = async (req, res) => {
  try {
    const navBar = await CmsNavBar.findByIdAndDelete(req.params.id);

    if (!navBar) {
      return res.status(404).json({
        success: false,
        message: 'Navigation configuration not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Navigation configuration deleted successfully',
      data: navBar,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Delete navigation configuration by operator ID
 * @route   DELETE /api/cms/nav-bar/operator/:operatorId
 * @access  Private/Super Admin
 */
exports.deleteNavBarByOperatorId = async (req, res) => {
  try {
    const navBar = await CmsNavBar.findOneAndDelete({ operatorId: req.params.operatorId });

    if (!navBar) {
      return res.status(404).json({
        success: false,
        message: 'Navigation configuration not found for this operator',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Navigation configuration deleted successfully',
      data: navBar,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
