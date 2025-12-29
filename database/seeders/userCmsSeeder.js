const mongoose = require('mongoose');
const UserCms = require('../../models/UserCms');

/**
 * Seeder to populate UserCms with sample data
 * Run: node database/seeders/userCmsSeeder.js
 */

const userCmsSeeds = [
  {
    operatorId: [
      {
        operatorId: 1001,
        operatorName: 'ParkFinda Super Admin',
        webUrl: 'https://superadmin.parkfinda.com',
      },
    ],
    name: 'Super Admin',
    email: 'superadmin@parkfinda.com',
    password: '$2b$10$o/Ad9S.piDRBoE0GjvR48.8ZE/nLQBstHA2yuCyU..gBNi30kCUHW',
    phone: '+1234567890',
    websiteUrl: 'https://superadmin.parkfinda.com',
    role: 'super_admin',
    status: 'active',
    permissions: [
      'manage_users',
      'manage_parking',
      'manage_bookings',
      'manage_reports',
      'manage_settings',
      'manage_admins',
    ],
  },
  {
    operatorId: [
      {
        operatorId: 1002,
        operatorName: 'ParkFinda Admin',
        webUrl: 'https://admin.parkfinda.com',
      },
    ],
    name: 'Admin User',
    email: 'admin@parkfinda.com',
    password: '$2b$10$o/Ad9S.piDRBoE0GjvR48.8ZE/nLQBstHA2yuCyU..gBNi30kCUHW',
    phone: '+0987654321',
    websiteUrl: 'https://admin.parkfinda.com',
    role: 'admin',
    status: 'active',
    permissions: [
      'manage_users',
      'manage_parking',
      'manage_bookings',
      'manage_reports',
      'view_analytics',
    ],
  },
  {
    operatorId: [
      {
        operatorId: 1003,
        operatorName: 'ParkFinda Moderator',
        webUrl: 'https://moderator.parkfinda.com',
      },
    ],
    name: 'Moderator User',
    email: 'moderator@parkfinda.com',
    password: '$2b$10$o/Ad9S.piDRBoE0GjvR48.8ZE/nLQBstHA2yuCyU..gBNi30kCUHW',
    phone: '+1122334455',
    websiteUrl: 'https://moderator.parkfinda.com',
    role: 'moderator',
    status: 'active',
    permissions: [
      'manage_parking',
      'manage_bookings',
      'view_analytics',
      'moderate_reviews',
    ],
  },
  {
    operatorId: [
      {
        operatorId: 1004,
        operatorName: 'ParkFinda Manager',
        webUrl: 'https://manager.parkfinda.com',
      },
    ],
    name: 'Manager User',
    email: 'manager@parkfinda.com',
    password: '$2b$10$o/Ad9S.piDRBoE0GjvR48.8ZE/nLQBstHA2yuCyU..gBNi30kCUHW',
    phone: '+5544332211',
    websiteUrl: 'https://manager.parkfinda.com',
    role: 'manager',
    status: 'active',
    permissions: ['view_parking', 'view_bookings', 'view_analytics'],
  },
  {
    operatorId: [
      {
        operatorId: 1005,
        operatorName: 'ParkFinda Test',
        webUrl: 'https://test.parkfinda.com',
      },
    ],
    name: 'Test User',
    email: 'test@parkfinda.com',
    password: '$2b$10$o/Ad9S.piDRBoE0GjvR48.8ZE/nLQBstHA2yuCyU..gBNi30kCUHW',
    phone: '+9876543210',
    websiteUrl: 'https://test.parkfinda.com',
    role: 'manager',
    status: 'active',
    permissions: ['view_parking'],
  },
];

const seedUserCms = async () => {
  try {
    // Skip connection if already connected (when called from index.js)
    if (require('mongoose').connection.readyState === 0) {
      await require('mongoose').connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }

    console.log('🌱 Starting cms_user seeding...\n');

    // Clear existing data (optional - comment out to preserve existing data)
    try {
      const deletedCount = await UserCms.deleteMany({});
      console.log(`🗑️  Deleted ${deletedCount.deletedCount} existing cms_user records`);
    } catch (deleteError) {
      console.log('⚠️  Skipping delete (may not have permissions). Attempting to insert...');
    }

    // Insert seed data
    const createdUsers = await UserCms.insertMany(userCmsSeeds);

    console.log(`\n✅ Successfully seeded ${createdUsers.length} cms_user records:\n`);

    createdUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`);
      console.log(`   🆔 Operator ID: ${user.operatorId[0].operatorId}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   👤 Role: ${user.role}`);
      console.log(`   🔓 Password: ${userCmsSeeds[index].password}`);
      console.log(`   ✓ Status: ${user.status}\n`);
    });

    console.log('✨ cms_user seeding completed successfully!');
    
    // Only close connection if this is the main module
    if (require.main === module) {
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    if (error.code === 11000) {
      console.error('⚠️  Duplicate key error - Some users may already exist');
    }
    
    // Only exit if this is the main module
    if (require.main === module) {
      process.exit(1);
    } else {
      throw error;
    }
  }
};

// Run seeder
if (require.main === module) {
  require('dotenv').config();
  seedUserCms();
}

module.exports = { seed: seedUserCms };
