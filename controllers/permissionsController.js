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

      // If this is a parent permission, get its children
      let response = {
        id: permission.id,
        name: permission.name,
      };

      if (permission.parent_id === null) {
        const children = await PermissionsModel.getByParentId(permission.id);
        response.children = children.map(child => ({
          id: child.id,
          name: child.name,
        }));
      }

      res.status(200).json({ success: true, data: response });
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

      // If this is a parent permission, get its children
      let response = {
        id: permission.id,
        name: permission.name,
      };

      if (permission.parent_id === null) {
        const children = await PermissionsModel.getByParentId(permission.id);
        response.children = children.map(child => ({
          id: child.id,
          name: child.name,
        }));
      }

      res.status(200).json({ success: true, data: response });
    } catch (error) {
      console.error('Error in getPermissionByName:', error);
      res.status(500).json({ error: 'Failed to get permission' });
    }
  }

  static async getAllPermissions(req, res) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 100;
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0;

      // Get all parent permissions
      const parentPermissions = await PermissionsModel.getParentPermissions(limit, offset);
      const count = await PermissionsModel.count();

      // Build hierarchical structure
      const hierarchicalPermissions = await Promise.all(
        parentPermissions.map(async (parent) => {
          // Get child permissions for this parent
          const children = await PermissionsModel.getByParentId(parent.id);
          
          return {
            id: parent.id,
            name: parent.name,
            children: children.map(child => ({
              id: child.id,
              name: child.name,
            })),
          };
        })
      );

      res.status(200).json({
        success: true,
        data: hierarchicalPermissions,
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

      // Build hierarchical structure for search results
      const hierarchicalResults = await Promise.all(
        permissions.map(async (permission) => {
          let response = {
            id: permission.id,
            name: permission.name,
          };

          if (permission.parent_id === null) {
            const children = await PermissionsModel.getByParentId(permission.id);
            response.children = children.map(child => ({
              id: child.id,
              name: child.name,
            }));
          }

          return response;
        })
      );

      res.status(200).json({
        success: true,
        data: hierarchicalResults,
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
