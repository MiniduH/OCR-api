const { query } = require('../../config/database');

/**
 * Migration: Update roles to use permission IDs instead of names
 * Run with: npm run migrate
 */
const up = async () => {
  try {
    console.log('Updating roles to use permission IDs...');

    // Update admin role: permissions [1,2,3,4,5,6] (create, read, update, delete, manage_users, manage_roles)
    await query(`
      UPDATE roles 
      SET permissions = '[1, 2, 3, 4, 5, 6]'::jsonb
      WHERE name = 'admin'
    `);

    // Update moderator role: permissions [1,2,3,4] (create, read, update, delete)
    await query(`
      UPDATE roles 
      SET permissions = '[1, 2, 3, 4]'::jsonb
      WHERE name = 'moderator'
    `);

    // Update user role: permissions [1,2] (create, read)
    await query(`
      UPDATE roles 
      SET permissions = '[1, 2]'::jsonb
      WHERE name = 'user'
    `);

    console.log('✅ Roles updated to use permission IDs');
  } catch (error) {
    console.error('❌ Error updating roles:', error.message);
    throw error;
  }
};

/**
 * Rollback: Revert roles to use permission names
 */
const down = async () => {
  try {
    console.log('Reverting roles to use permission names...');

    // Revert admin role
    await query(`
      UPDATE roles 
      SET permissions = '["create", "read", "update", "delete", "manage_users", "manage_roles"]'::jsonb
      WHERE name = 'admin'
    `);

    // Revert moderator role
    await query(`
      UPDATE roles 
      SET permissions = '["create", "read", "update", "delete"]'::jsonb
      WHERE name = 'moderator'
    `);

    // Revert user role
    await query(`
      UPDATE roles 
      SET permissions = '["read", "create"]'::jsonb
      WHERE name = 'user'
    `);

    console.log('✅ Roles reverted to use permission names');
  } catch (error) {
    console.error('❌ Error reverting roles:', error.message);
    throw error;
  }
};

module.exports = { up, down };
