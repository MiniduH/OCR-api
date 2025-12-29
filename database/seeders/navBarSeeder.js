const CmsNavBar = require('../../models/CmsNavBar');

/**
 * Seeder: Populate cms_nav_bar with sample navigation links
 * Run with: npm run seed
 */
const navBarData = [
  {
    operatorId: 1001,
    template_id: 101,
    links: [
      { label: 'Home', href: '/' },
      { label: 'Company', href: '/company' },
      { label: 'Solutions', href: '/solutions' },
      { label: 'Enforcement', href: '/enforcement' },
      { label: 'Contact Us', href: '/contact-us' },
    ],
  },
  {
    operatorId: 1002,
    template_id: 102,
    links: [
      { label: 'Home', href: '/' },
      { label: 'Company', href: '/company' },
      { label: 'Solutions', href: '/solutions' },
      { label: 'Enforcement', href: '/enforcement' },
      { label: 'Contact Us', href: '/contact-us' },
    ],
  },
];

/**
 * Seed function
 */
const seed = async () => {
  try {
    // Clear existing data
    await CmsNavBar.deleteMany({});
    console.log('🗑️  Cleared existing cms_nav_bar data');

    // Insert nav bar data
    const result = await CmsNavBar.insertMany(navBarData);
    console.log(`✅ Inserted ${result.length} navigation configuration(s)`);

    return result;
  } catch (error) {
    console.error('❌ Error seeding cms_nav_bar:', error.message);
    throw error;
  }
};

module.exports = { seed };
