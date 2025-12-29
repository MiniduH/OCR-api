const mongoose = require('mongoose');

require('dotenv').config();

/**
 * Seeder Runner
 * Runs all seeders in sequence
 * Usage: npm run seed
 */

const runSeeders = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🌱 Starting seeders...\n');

    // Import seeder files
    const seeder1 = require('./userCmsSeeder');
    const seeder2 = require('./webConfigSeeder');
    const seeder3 = require('./colorsSeeder');
    const seeder4 = require('./companySeeder');
    const seeder5 = require('./contactSeeder');
    const seeder6 = require('./enforcementSeeder');
    const seeder7 = require('./navBarSeeder');
    const seeder8 = require('./solutionSeeder');
    const seeder9 = require('./discoverSolutionsSeeder');
    const seeder10 = require('./heroSeeder');
    const seeder11 = require('./footerSeeder');
    const seeder12 = require('./testimonialsSeeder');
    const seeder13 = require('./termsAndConditionsSeeder');

    // Run seeders in sequence.
    console.log('🌱 Seeder 1: Seeding cms_user...');
    await seeder1.seed();
    console.log('✅ Seeder 1 completed\n');

    console.log('🌱 Seeder 2: Seeding cms_web_config...');
    await seeder2.seed();
    console.log('✅ Seeder 2 completed\n');

    console.log('🌱 Seeder 3: Seeding cms_colors...');
    await seeder3.seed();
    console.log('✅ Seeder 3 completed\n');

    console.log('🌱 Seeder 4: Seeding cms_company...');
    await seeder4.seed();
    console.log('✅ Seeder 4 completed\n');

    console.log('🌱 Seeder 5: Seeding cms_contact...');
    await seeder5.seed();
    console.log('✅ Seeder 5 completed\n');

    console.log('🌱 Seeder 6: Seeding cms_enforcement...');
    await seeder6.seed();
    console.log('✅ Seeder 6 completed\n');

    console.log('🌱 Seeder 7: Seeding cms_nav_bar...');
    await seeder7.seed();
    console.log('✅ Seeder 7 completed\n');

    console.log('🌱 Seeder 8: Seeding cms_solution...');
    await seeder8();
    console.log('✅ Seeder 8 completed\n');

    console.log('🌱 Seeder 9: Seeding cms_discover_solutions...');
    await seeder9.seed();
    console.log('✅ Seeder 9 completed\n');

    console.log('🌱 Seeder 10: Seeding cms_hero...');
    await seeder10.seed();
    console.log('✅ Seeder 10 completed\n');

    console.log('🌱 Seeder 11: Seeding cms_footer...');
    await seeder11.seed();
    console.log('✅ Seeder 11 completed\n');

    console.log('🌱 Seeder 12: Seeding cms_testimonials...');
    await seeder12.seed();
    console.log('✅ Seeder 12 completed\n');

    console.log('🌱 Seeder 13: Seeding cms_terms_and_conditions...');
    await seeder13.seed();
    console.log('✅ Seeder 13 completed\n');

    console.log('✨ All seeders completed successfully!');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

runSeeders();
