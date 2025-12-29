const CmsNavBar = require('../../models/CmsNavBar');

/**
 * Migration: Create cms_nav_bar collection with indexes
 * Run with: npm run migrate
 */
const up = async () => {
  try {
    console.log('Creating cms_nav_bar collection...');

    // Create indexes
    await CmsNavBar.collection.createIndex({ operatorId: 1 }, { unique: true });
    await CmsNavBar.collection.createIndex({ template_id: 1 });
    await CmsNavBar.collection.createIndex({ createdAt: -1 });
    await CmsNavBar.collection.createIndex({ updatedAt: -1 });

    console.log('✅ cms_nav_bar collection created with indexes');
  } catch (error) {
    console.error('❌ Error creating cms_nav_bar collection:', error.message);
    throw error;
  }
};

/**
 * Rollback: Drop cms_nav_bar collection
 * Run with: npm run migrate:rollback
 */
const down = async () => {
  try {
    console.log('Dropping cms_nav_bar collection...');
    await CmsNavBar.collection.drop();
    console.log('✅ cms_nav_bar collection dropped');
  } catch (error) {
    console.error('❌ Error dropping cms_nav_bar collection:', error.message);
    throw error;
  }
};

module.exports = { up, down };
