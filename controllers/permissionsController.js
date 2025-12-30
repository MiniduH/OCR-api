const PermissionsModel = require('../models/Permissions');

class PermissionsController {
  static async getPermissionById(req, res) {
    try {
      const { id } = req.params;
      const permission = await PermissionsModel.getById(parseInt(id, 10));

      if (!permission) {
        res.status(404).json({ error: 'Permission not found' });
        return;
      }

      res.status(200).json({ success: true, data: permission });
    } catch (error) {
      console.error('Error in getPermissionById:', error);
      res.status(500).json({ error: 'Failed to get permission' });
    }
  }

  static async getPermissionByName(req, res) {
    try {
      const { name } = req.params;
      const permission = await PermissionsModel.getByName(name);

      if (!permission) {
        res.status(404).json({ error: 'Permission not found' });
        return;
      }

      res.status(200).json({ success: true, data: permission });
    } catch (error) {
      console.error('Error in getPermissionByName:', error);
      res.status(500).json({ error: 'Failed to get permission' });
    }
  }

  static async getAllPermissions(req, res) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 100;
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0;

      const permissions = await PermissionsModel.getAll(limit, offset);
      const count = await PermissionsModel.count();

      res.status(200).json({
        success: true,
        data: permissions,
        pagination: {
          limit,
          offset,
          total: count,
        },
      });
    } catch (error) {
      console.error('Error in getAllPermissions:', error);
      res.status(500).json({ error: 'Failed to get permissions' });
    }
  }

  static async getPermissionCount(req, res) {
    try {
      const count = await PermissionsModel.count();
      res.status(200).json({ success: true, data: { count } });
    } catch (error) {
      console.error('Error in getPermissionCount:', error);
      res.status(500).json({ error: 'Failed to get permission count' });
    }
  }

  static async searchPermissions(req, res) {
    try {
      const { q } = req.query;

      if (!q) {
        res.status(400).json({ error: 'Search query is required' });
        return;
      }

      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0;

      const permissions = await PermissionsModel.search(q, limit, offset);

      res.status(200).json({
        success: true,
        data: permissions,
        pagination: {
          limit,
          offset,
          search_query: q,
        },
      });
    } catch (error) {
      console.error('Error in searchPermissions:', error);
      res.status(500).json({ error: 'Failed to search permissions' });
    }
  }
}

module.exports = PermissionsController;
