const UserCms = require('../../models/UserCms');

/**
 * Migration: Create cms_user collection with indexes
 * Run with: npm run migrate
 */
const up = async () => {
  try {
    console.log('Creating cms_user collection...');

    // Create indexes
    await UserCms.collection.createIndex({ email: 1 }, { unique: true });
    await UserCms.collection.createIndex({ role: 1 });
    await UserCms.collection.createIndex({ status: 1 });
    await UserCms.collection.createIndex({ websiteUrl: 1 });
    await UserCms.collection.createIndex({ createdAt: -1 });
    await UserCms.collection.createIndex({ updatedAt: -1 });

    console.log('✅ cms_user collection created with indexes');
  } catch (error) {
    console.error('❌ Error creating cms_user collection:', error.message);
    throw error;
  }
};

/**
 * Rollback: Drop cms_user collection
 * Run with: npm run migrate:rollback
 */
const down = async () => {
  try {
    console.log('Dropping cms_user collection...');
    await UserCms.collection.drop();
    console.log('✅ cms_user collection dropped');
  } catch (error) {
    console.error('❌ Error dropping cms_user collection:', error.message);
    throw error;
  }
};

module.exports = { up, down };
