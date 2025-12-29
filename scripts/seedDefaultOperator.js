#!/usr/bin/env node

/**
 * Script: Seed Default Operator Data
 * Purpose: Create default seeder data for operator ID 3001
 * Usage: node scripts/seedDefaultOperator.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Import all models
const CmsWebConfig = require('../models/CmsWebConfig');
const CmsColors = require('../models/CmsColors');
const CmsCompany = require('../models/CmsCompany');
const CmsContact = require('../models/CmsContact');
const CmsEnforcement = require('../models/CmsEnforcement');
const CmsNavBar = require('../models/CmsNavBar');
const CmsHero = require('../models/CmsHero');
const CmsFooter = require('../models/CmsFooter');
const CmsDiscoverSolutions = require('../models/CmsDiscoverSolutions');
const CmsTestimonials = require('../models/CmsTestimonials');
const CmsSolution = require('../models/CmsSolution');
const CmsTermsAndConditions = require('../models/CmsTermsAndConditions');

const OPERATOR_ID = 3001;

async function seedDefaultOperator() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`\n${'═'.repeat(70)}`);
    console.log(`🌱 SEEDING DEFAULT DATA FOR OPERATOR ID: ${OPERATOR_ID}`);
    console.log(`${'═'.repeat(70)}\n`);

    let seededCount = 0;

    // 1. Web Config
    try {
      const webConfigExists = await CmsWebConfig.findOne({ operatorId: OPERATOR_ID });
      if (!webConfigExists) {
        await CmsWebConfig.create({
          operatorId: OPERATOR_ID,
          template_id: 3001,
          parkfinder_api_key: 'pk_live_default_' + OPERATOR_ID,
          website_url: 'https://default.parkfinda.com',
          website_name: 'ParkFinda Default',
          status: 'active',
        });
        console.log('✅ Web Config seeded');
        seededCount++;
      } else {
        console.log('⏭️  Web Config already exists');
      }
    } catch (error) {
      console.log(`❌ Web Config error: ${error.message}`);
    }

    // 2. Colors
    try {
      const colorsExists = await CmsColors.findOne({ operatorId: OPERATOR_ID });
      if (!colorsExists) {
        await CmsColors.create({
          operatorId: OPERATOR_ID,
          template_id: 3001,
          primary: {
            bg: '#CBDCEB',
            text: '#0A1F44',
            dark: '#001D3D',
            darkHover: '#003566',
            darker: '#0a174e',
            light: '#86AFF4',
          },
          herosection: {
            heading: '#133E87',
            secondary: '#718BB7',
            border: '#A1B2CF',
            textLight: '#FFFFFF',
            textDark: '#000000',
            heroBg1: '#E8F1F7',
            heroBg2: '#D4E3F0',
            heroBg3: '#C0D5E8',
            heroBg4: '#A8C4DC',
            heroBg5: '#90B3D0',
            heroBg6: '#7898C4',
          },
          ui: {
            authButtonBg: '#E7ECF3',
            servicecardBorder: '#EDEDED',
            expressCheckout: '#EDF4FF',
            emailFieldBg: '#E8E8E8',
          },
          status: {
            error: '#E54444',
            errorBorder: '#DC2626',
            successBg: '#F2FBE6',
            warning: '#ffc107',
          },
          border: {
            light: '#c0cfe4',
            medium: '#b4c4db',
            dark: '#1976d2',
            darker: '#115293',
          },
          background: {
            dark: '#040D12',
            white: '#ffffff',
            gray: '#e4e5e9',
            lightGray: '#D1D5DB',
          },
          text: {
            black: '#000000',
            gray: '#666666',
            dark: '#111827',
            medium: '#6B7280',
            placeholder: '#9ca3af',
            red: '#ef4444',
          },
          accent: {
            blue: '#2563eb',
            blueHover: '#1d4ed8',
            blueLight: '#dbeafe',
            blueDark: '#1e3a8a',
            blueBorder: '#3b82f6',
          },
        });
        console.log('✅ Colors seeded');
        seededCount++;
      } else {
        console.log('⏭️  Colors already exists');
      }
    } catch (error) {
      console.log(`❌ Colors error: ${error.message}`);
    }

    // 3. Company
    try {
      const companyExists = await CmsCompany.findOne({ operatorId: OPERATOR_ID });
      if (!companyExists) {
        await CmsCompany.create({
          operatorId: OPERATOR_ID,
          template_id: 3001,
          company_name: 'ParkFinda Default',
          company_description: 'Default parking management platform',
          logo: 'https://cdn.parkfinda.com/default-logo.png',
          favicon: 'https://cdn.parkfinda.com/default-favicon.png',
        });
        console.log('✅ Company seeded');
        seededCount++;
      } else {
        console.log('⏭️  Company already exists');
      }
    } catch (error) {
      console.log(`❌ Company error: ${error.message}`);
    }

    // 4. Contact
    try {
      const contactExists = await CmsContact.findOne({ operatorId: OPERATOR_ID });
      if (!contactExists) {
        await CmsContact.create({
          operatorId: OPERATOR_ID,
          template_id: 3001,
          phone: '+1-800-PARK-FINDA',
          email: 'support@parkfinda.com',
          address: '75 E 23rd St, Bayonne, NJ 07002, USA',
          support_hours: '24/7',
        });
        console.log('✅ Contact seeded');
        seededCount++;
      } else {
        console.log('⏭️  Contact already exists');
      }
    } catch (error) {
      console.log(`❌ Contact error: ${error.message}`);
    }

    // 5. Enforcement
    try {
      const enforcementExists = await CmsEnforcement.findOne({ operatorId: OPERATOR_ID });
      if (!enforcementExists) {
        await CmsEnforcement.create({
          operatorId: OPERATOR_ID,
          template_id: 3001,
          status: 'active',
          rules: ['Follow parking guidelines', 'Respect time limits', 'Pay on time'],
        });
        console.log('✅ Enforcement seeded');
        seededCount++;
      } else {
        console.log('⏭️  Enforcement already exists');
      }
    } catch (error) {
      console.log(`❌ Enforcement error: ${error.message}`);
    }

    // 6. Nav Bar
    try {
      const navBarExists = await CmsNavBar.findOne({ operatorId: OPERATOR_ID });
      if (!navBarExists) {
        await CmsNavBar.create({
          operatorId: OPERATOR_ID,
          template_id: 3001,
          menu_items: [
            { label: 'Home', link: '/' },
            { label: 'Find Parking', link: '/search' },
            { label: 'My Bookings', link: '/bookings' },
            { label: 'Contact Us', link: '/contact' },
          ],
        });
        console.log('✅ Nav Bar seeded');
        seededCount++;
      } else {
        console.log('⏭️  Nav Bar already exists');
      }
    } catch (error) {
      console.log(`❌ Nav Bar error: ${error.message}`);
    }

    // 7. Hero
    try {
      const heroExists = await CmsHero.findOne({ operatorId: OPERATOR_ID });
      if (!heroExists) {
        await CmsHero.create({
          operatorId: OPERATOR_ID,
          template_id: 3001,
          title: 'Find Your Perfect Parking Spot',
          subtitle: 'Easy, affordable, and reliable parking solutions',
          cta_button_text: 'Find Parking Now',
          cta_button_link: '/search',
          background_image: 'https://cdn.parkfinda.com/default-hero-bg.jpg',
        });
        console.log('✅ Hero seeded');
        seededCount++;
      } else {
        console.log('⏭️  Hero already exists');
      }
    } catch (error) {
      console.log(`❌ Hero error: ${error.message}`);
    }

    // 8. Footer
    try {
      const footerExists = await CmsFooter.findOne({ operatorId: OPERATOR_ID });
      if (!footerExists) {
        await CmsFooter.create({
          operatorId: OPERATOR_ID,
          template_id: 3001,
          footer_text: '© 2025 ParkFinda. All rights reserved.',
          social_links: {
            facebook: 'https://facebook.com/parkfinda',
            twitter: 'https://twitter.com/parkfinda',
            instagram: 'https://instagram.com/parkfinda',
          },
        });
        console.log('✅ Footer seeded');
        seededCount++;
      } else {
        console.log('⏭️  Footer already exists');
      }
    } catch (error) {
      console.log(`❌ Footer error: ${error.message}`);
    }

    // 9. Discover Solutions
    try {
      const discoverExists = await CmsDiscoverSolutions.findOne({ operatorId: OPERATOR_ID });
      if (!discoverExists) {
        await CmsDiscoverSolutions.create({
          operatorId: OPERATOR_ID,
          template_id: 3001,
          solutions: [
            { title: 'Real-time Availability', description: 'See available parking spots instantly' },
            { title: 'Easy Booking', description: 'Book your spot in seconds' },
            { title: '24/7 Support', description: 'Get help whenever you need it' },
          ],
        });
        console.log('✅ Discover Solutions seeded');
        seededCount++;
      } else {
        console.log('⏭️  Discover Solutions already exists');
      }
    } catch (error) {
      console.log(`❌ Discover Solutions error: ${error.message}`);
    }

    // 10. Testimonials
    try {
      const testimonialsExists = await CmsTestimonials.findOne({ operatorId: OPERATOR_ID });
      if (!testimonialsExists) {
        await CmsTestimonials.create({
          operatorId: OPERATOR_ID,
          template_id: 3001,
          testimonials: [
            {
              name: 'John Doe',
              title: 'Regular User',
              quote: 'ParkFinda makes finding parking so easy!',
              rating: 5,
            },
            {
              name: 'Jane Smith',
              title: 'Business Owner',
              quote: 'Great service and excellent customer support',
              rating: 5,
            },
          ],
        });
        console.log('✅ Testimonials seeded');
        seededCount++;
      } else {
        console.log('⏭️  Testimonials already exists');
      }
    } catch (error) {
      console.log(`❌ Testimonials error: ${error.message}`);
    }

    // 11. Solutions
    try {
      const solutionsExists = await CmsSolution.findOne({ operatorId: OPERATOR_ID });
      if (!solutionsExists) {
        await CmsSolution.create({
          operatorId: OPERATOR_ID,
          template_id: 3001,
          templates: [
            { id: 1, name: 'Standard', description: 'Standard parking solution' },
            { id: 2, name: 'Premium', description: 'Premium parking with benefits' },
          ],
        });
        console.log('✅ Solutions seeded');
        seededCount++;
      } else {
        console.log('⏭️  Solutions already exists');
      }
    } catch (error) {
      console.log(`❌ Solutions error: ${error.message}`);
    }

    // 12. Terms and Conditions
    try {
      const termsExists = await CmsTermsAndConditions.findOne({ operatorId: OPERATOR_ID });
      if (!termsExists) {
        await CmsTermsAndConditions.create({
          operatorId: OPERATOR_ID,
          countries: [
            {
              name: 'United States',
              code: 'US',
              language: 'en',
              last_updated: new Date(),
              terms_block: {
                terms_and_conditions_html: '<h1>Terms & Conditions</h1><p>Default T&C for US</p>',
                privacy_policy_html: '<h1>Privacy Policy</h1><p>Default Privacy for US</p>',
                cancellations_policy_html: '<h1>Cancellation Policy</h1><p>Default Cancellation for US</p>',
                driver_parking_agreement_html: '<h1>Driver Agreement</h1><p>Default Agreement for US</p>',
              },
            },
          ],
        });
        console.log('✅ Terms & Conditions seeded');
        seededCount++;
      } else {
        console.log('⏭️  Terms & Conditions already exists');
      }
    } catch (error) {
      console.log(`❌ Terms & Conditions error: ${error.message}`);
    }

    // Summary
    console.log(`\n${'═'.repeat(70)}`);
    console.log(`📈 SUMMARY`);
    console.log(`${'═'.repeat(70)}`);
    console.log(`✅ Successfully seeded: ${seededCount} collections`);
    console.log(`${'═'.repeat(70)}\n`);

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedDefaultOperator();
