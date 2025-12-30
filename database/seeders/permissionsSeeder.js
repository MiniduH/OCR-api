const { query } = require('../../config/database');

/**
 * Permissions Seeder
 * Seeds default permissions into the database
 */

const permissions = [
  {
    name: 'create',
    description: 'Create new content or resources'
  },
  {
    name: 'read',
    description: 'View content or resources'
  },
  {
    name: 'update',
    description: 'Edit existing content or resources'
  },
  {
    name: 'delete',
    description: 'Remove content or resources'
  },
  {
    name: 'manage_users',
    description: 'Manage user accounts and profiles'
  },
  {
    name: 'manage_roles',
    description: 'Create, update, and delete roles'
  },
  {
    name: 'manage_settings',
    description: 'Access system settings'
  },
  {
    name: 'manage_permissions',
    description: 'Manage role permissions'
  },
  {
    name: 'view_reports',
    description: 'Access analytics and reports'
  },
  {
    name: 'export_data',
    description: 'Export data from the system'
  },
  {
    name: 'manage_tickets',
    description: 'Manage ticket system and operations'
  },
  {
    name: 'view_analytics',
    description: 'View system analytics and statistics'
  },
  {
    name: 'approve_requests',
    description: 'Approve pending requests'
  },
  {
    name: 'reject_requests',
    description: 'Reject pending requests'
  },
  {
    name: 'audit_logs',
    description: 'Access and view audit logs'
  }
];

const seed = async () => {
  try {
    console.log('🌱 Seeding permissions...');

    for (const permission of permissions) {
      const insertQuery = `
        INSERT INTO permissions (name, description)
        VALUES ($1, $2)
        ON CONFLICT (name) DO NOTHING;
      `;

      await query(insertQuery, [permission.name, permission.description]);
    }

    console.log(`✅ ${permissions.length} permissions seeded successfully`);
  } catch (error) {
    console.error('❌ Error seeding permissions:', error.message);
    throw error;
  }
};

module.exports = { seed, permissions };
