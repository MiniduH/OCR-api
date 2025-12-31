const UsersModel = require('../models/Users');

class UsersController {
  static async createUser(req, res) {
    try {
      const user = req.body;

      // Validate required fields
      const requiredFields = [
        'first_name',
        'last_name',
        'username',
        'email',
        'password',
      ];

      for (const field of requiredFields) {
        if (!(field in user) || user[field] === undefined || user[field] === null) {
          res.status(400).json({ error: `Missing required field: ${field}` });
          return;
        }
      }

      const newUser = await UsersModel.create(user);
      res.status(201).json({ success: true, data: newUser });
    } catch (error) {
      console.error('Error in createUser:', error.message);
      console.error('Error details:', error);
      res.status(500).json({ error: 'Failed to create user', details: error.message });
    }
  }

  static async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await UsersModel.getById(parseInt(id, 10));

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.status(200).json({ success: true, data: user });
    } catch (error) {
      console.error('Error in getUserById:', error);
      res.status(500).json({ error: 'Failed to get user' });
    }
  }

  static async getUserByUsername(req, res) {
    try {
      const { username } = req.params;
      const user = await UsersModel.getByUsername(username);

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.status(200).json({ success: true, data: user });
    } catch (error) {
      console.error('Error in getUserByUsername:', error);
      res.status(500).json({ error: 'Failed to get user' });
    }
  }

  static async getUserByEmail(req, res) {
    try {
      const { email } = req.params;
      const user = await UsersModel.getByEmail(email);

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.status(200).json({ success: true, data: user });
    } catch (error) {
      console.error('Error in getUserByEmail:', error);
      res.status(500).json({ error: 'Failed to get user' });
    }
  }

  static async getAllUsers(req, res) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0;

      const users = await UsersModel.getAll(limit, offset);
      const count = await UsersModel.count();

      res.status(200).json({
        success: true,
        data: users,
        pagination: {
          limit,
          offset,
          total: count,
        },
      });
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      res.status(500).json({ error: 'Failed to get users' });
    }
  }

  static async updateUser(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const updatedUser = await UsersModel.update(parseInt(id, 10), updates);

      if (!updatedUser) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.status(200).json({ success: true, data: updatedUser });
    } catch (error) {
      console.error('Error in updateUser:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  }

  static async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const deleted = await UsersModel.delete(parseInt(id, 10));

      if (!deleted) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error in deleteUser:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  }

  static async getUserCount(req, res) {
    try {
      const count = await UsersModel.count();
      res.status(200).json({ success: true, data: { count } });
    } catch (error) {
      console.error('Error in getUserCount:', error);
      res.status(500).json({ error: 'Failed to get user count' });
    }
  }

  static async getUsersByRole(req, res) {
    try {
      const { role } = req.params;

      if (!role) {
        res.status(400).json({ error: 'Missing required parameter: role' });
        return;
      }

      const users = await UsersModel.getByRole(role);

      res.status(200).json({ success: true, data: users });
    } catch (error) {
      console.error('Error in getUsersByRole:', error);
      res.status(500).json({ error: 'Failed to get users by role' });
    }
  }

  static async getUsersByStatus(req, res) {
    try {
      const { status } = req.params;

      if (!status) {
        res.status(400).json({ error: 'Missing required parameter: status' });
        return;
      }

      const users = await UsersModel.getByStatus(status);

      res.status(200).json({ success: true, data: users });
    } catch (error) {
      console.error('Error in getUsersByStatus:', error);
      res.status(500).json({ error: 'Failed to get users by status' });
    }
  }
}

module.exports = UsersController;
