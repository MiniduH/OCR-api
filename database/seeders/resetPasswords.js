require('dotenv').config();
const mongoose = require('mongoose');
const UserCms = require('../../models/UserCms');

const resetPasswords = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Default password for all users
    const defaultPassword = 'password123';

    // Get all users
    const users = await UserCms.find();

    if (users.length === 0) {
      console.log('⚠️  No users found in the database');
      process.exit(0);
    }

    console.log(`\n🔄 Resetting passwords for ${users.length} user(s)...`);

    // Reset password for each user
    for (const user of users) {
      user.password = defaultPassword;
      user.loginAttempts = 0;
      user.isLocked = false;
      user.status = 'active';
      user.updatedAt = new Date();
      await user.save();
      
      console.log(`✅ Reset password for: ${user.email} (${user.name})`);
    }

    console.log('\n✅ All passwords have been reset successfully!');
    console.log(`\n📝 Default credentials:`);
    console.log(`   Password: ${defaultPassword}`);
    console.log(`\n👥 User accounts:`);
    users.forEach(user => {
      console.log(`   - Email: ${user.email} | Role: ${user.role} | Operator ID: ${user.operatorId}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting passwords:', error);
    process.exit(1);
  }
};

resetPasswords();