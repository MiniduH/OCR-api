const RolesModel = require('../models/Roles');
const PermissionsModel = require('../models/Permissions');

class RolesController {
  static async createRole(req, res) {
    try {
      const role = req.body;

      // Validate required fields
      const requiredFields = ['name'];

      for (const field of requiredFields) {
        if (!(field in role) || role[field] === undefined || role[field] === null) {
          res.status(400).json({ error: `Missing required field: ${field}` });
          return;
        }
      }

      const newRole = await RolesModel.create(role);
      res.status(201).json({ success: true, data: newRole });
    } catch (error) {
      console.error('Error in createRole:', error);
      res.status(500).json({ error: 'Failed to create role' });
    }
  }

  static async getRoleById(req, res) {
    try {
      const { id } = req.params;
      const role = await RolesModel.getById(parseInt(id, 10));

      if (!role) {
        res.status(404).json({ error: 'Role not found' });
        return;
      }

      res.status(200).json({ success: true, data: role });
    } catch (error) {
      console.error('Error in getRoleById:', error);
      res.status(500).json({ error: 'Failed to get role' });
    }
  }

  static async getRoleByName(req, res) {
    try {
      const { name } = req.params;
      const role = await RolesModel.getByName(name);

      if (!role) {
        res.status(404).json({ error: 'Role not found' });
        return;
      }

      res.status(200).json({ success: true, data: role });
    } catch (error) {
      console.error('Error in getRoleByName:', error);
      res.status(500).json({ error: 'Failed to get role' });
    }
  }

  static async getAllRoles(req, res) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0;

      const roles = await RolesModel.getAll(limit, offset);
      const count = await RolesModel.count();

      // Fetch permission details for each role
      const rolesWithPermissionDetails = await Promise.all(
        roles.map(async (role) => {
          const permissionIds = Array.isArray(role.permissions) 
            ? role.permissions 
            : JSON.parse(role.permissions || '[]');
          
          const permissionDetails = await Promise.all(
            permissionIds.map(async (permId) => {
              const permission = await PermissionsModel.getById(permId);
              return permission ? { id: permission.id, name: permission.name } : null;
            })
          );

          return {
            ...role,
            permissions: permissionDetails.filter(p => p !== null),
          };
        })
      );

      res.status(200).json({
        success: true,
        data: rolesWithPermissionDetails,
        pagination: {
          limit,
          offset,
          total: count,
        },
      });
    } catch (error) {
      console.error('Error in getAllRoles:', error);
      res.status(500).json({ error: 'Failed to get roles' });
    }
  }

  static async getActiveRoles(req, res) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0;

      const roles = await RolesModel.getActive(limit, offset);

      res.status(200).json({
        success: true,
        data: roles,
        pagination: {
          limit,
          offset,
        },
      });
    } catch (error) {
      console.error('Error in getActiveRoles:', error);
      res.status(500).json({ error: 'Failed to get active roles' });
    }
  }

  static async updateRole(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const updatedRole = await RolesModel.update(parseInt(id, 10), updates);

      if (!updatedRole) {
        res.status(404).json({ error: 'Role not found' });
        return;
      }

      res.status(200).json({ success: true, data: updatedRole });
    } catch (error) {
      console.error('Error in updateRole:', error);
      res.status(500).json({ error: 'Failed to update role' });
    }
  }

  static async deleteRole(req, res) {
    try {
      const { id } = req.params;
      const deleted = await RolesModel.delete(parseInt(id, 10));

      if (!deleted) {
        res.status(404).json({ error: 'Role not found' });
        return;
      }

      res.status(200).json({ success: true, message: 'Role deleted successfully' });
    } catch (error) {
      console.error('Error in deleteRole:', error);
      res.status(500).json({ error: 'Failed to delete role' });
    }
  }

  static async getRoleCount(req, res) {
    try {
      const count = await RolesModel.count();
      res.status(200).json({ success: true, data: { count } });
    } catch (error) {
      console.error('Error in getRoleCount:', error);
      res.status(500).json({ error: 'Failed to get role count' });
    }
  }

  static async addPermission(req, res) {
    try {
      const { id } = req.params;
      const { permissionId } = req.body;

      if (!permissionId) {
        res.status(400).json({ error: 'Permission ID is required' });
        return;
      }

      const role = await RolesModel.getById(parseInt(id, 10));
      if (!role) {
        res.status(404).json({ error: 'Role not found' });
        return;
      }

      const updatedRole = await RolesModel.addPermission(parseInt(id, 10), permissionId);

      res.status(200).json({
        success: true,
        message: `Permission ID ${permissionId} added to role`,
        data: updatedRole,
      });
    } catch (error) {
      console.error('Error in addPermission:', error);
      res.status(500).json({ error: 'Failed to add permission' });
    }
  }

  static async removePermission(req, res) {
    try {
      const { id } = req.params;
      const { permissionId } = req.body;

      if (!permissionId) {
        res.status(400).json({ error: 'Permission ID is required' });
        return;
      }

      const role = await RolesModel.getById(parseInt(id, 10));
      if (!role) {
        res.status(404).json({ error: 'Role not found' });
        return;
      }

      const updatedRole = await RolesModel.removePermission(parseInt(id, 10), permissionId);

      res.status(200).json({
        success: true,
        message: `Permission ID ${permissionId} removed from role`,
        data: updatedRole,
      });
    } catch (error) {
      console.error('Error in removePermission:', error);
      res.status(500).json({ error: 'Failed to remove permission' });
    }
  }

  static async checkPermission(req, res) {
    try {
      const { id } = req.params;
      const { permissionId } = req.body;

      if (!permissionId) {
        res.status(400).json({ error: 'Permission ID is required' });
        return;
      }

      const role = await RolesModel.getById(parseInt(id, 10));
      if (!role) {
        res.status(404).json({ error: 'Role not found' });
        return;
      }

      const hasPermission = await RolesModel.hasPermission(parseInt(id, 10), permissionId);

      res.status(200).json({
        success: true,
        role_id: parseInt(id, 10),
        permission_id: parseInt(permissionId, 10),
        has_permission: hasPermission,
      });
    } catch (error) {
      console.error('Error in checkPermission:', error);
      res.status(500).json({ error: 'Failed to check permission' });
    }
  }
}

module.exports = {
  createRole: RolesController.createRole,
  getRoleById: RolesController.getRoleById,
  getRoleByName: RolesController.getRoleByName,
  getAllRoles: RolesController.getAllRoles,
  getActiveRoles: RolesController.getActiveRoles,
  updateRole: RolesController.updateRole,
  deleteRole: RolesController.deleteRole,
  getRoleCount: RolesController.getRoleCount,
  addPermission: RolesController.addPermission,
  removePermission: RolesController.removePermission,
  checkPermission: RolesController.checkPermission,
};
