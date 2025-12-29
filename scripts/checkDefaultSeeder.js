#!/usr/bin/env node

/**
 * Script: Check Default Seeder Data
 * Purpose: Verify all seeded collections for operator ID 3001
 * Usage: node scripts/checkDefaultSeeder.js
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

async function checkSeederData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`\n${'═'.repeat(70)}`);
    console.log(`📊 CHECKING DEFAULT SEEDER DATA FOR OPERATOR ID: ${OPERATOR_ID}`);
    console.log(`${'═'.repeat(70)}\n`);

    // Define collections to check
    const collections = [
      { name: 'Web Config', model: CmsWebConfig, fields: ['website_url', 'status'] },
      { name: 'Colors', model: CmsColors, fields: ['template_id', 'primary', 'herosection'] },
      { name: 'Company', model: CmsCompany, fields: ['company_name', 'logo'] },
      { name: 'Contact', model: CmsContact, fields: ['phone', 'email'] },
      { name: 'Enforcement', model: CmsEnforcement, fields: ['status'] },
      { name: 'Nav Bar', model: CmsNavBar, fields: ['menu_items'] },
      { name: 'Hero', model: CmsHero, fields: ['title', 'subtitle'] },
      { name: 'Footer', model: CmsFooter, fields: ['social_links'] },
      { name: 'Discover Solutions', model: CmsDiscoverSolutions, fields: ['solutions'] },
      { name: 'Testimonials', model: CmsTestimonials, fields: ['testimonials'] },
      { name: 'Solutions', model: CmsSolution, fields: ['templates'] },
      { name: 'Terms & Conditions', model: CmsTermsAndConditions, fields: ['countries'] },
    ];

    let totalFound = 0;
    let totalMissing = 0;

    // Check each collection
    for (const collection of collections) {
      try {
        const document = await collection.model.findOne({ operatorId: OPERATOR_ID });

        if (document) {
          totalFound++;
          console.log(`✅ ${collection.name.padEnd(25)} | Found`);
          console.log(`   ID: ${document._id}`);
          console.log(`   Created: ${document.createdAt?.toISOString().split('T')[0]}`);
          console.log(`   Updated: ${document.updatedAt?.toISOString().split('T')[0]}`);

          // Show specific fields
          if (collection.fields.length > 0) {
            console.log(`   Fields:`);
            collection.fields.forEach((field) => {
              const value = document[field];
              if (value !== undefined && value !== null) {
                if (typeof value === 'object') {
                  console.log(`     • ${field}: [Object]`);
                } else if (typeof value === 'string' && value.length > 50) {
                  console.log(`     • ${field}: ${value.substring(0, 50)}...`);
                } else {
                  console.log(`     • ${field}: ${value}`);
                }
              }
            });
          }
        } else {
          totalMissing++;
          console.log(`❌ ${collection.name.padEnd(25)} | NOT FOUND`);
        }
      } catch (error) {
        console.log(`⚠️  ${collection.name.padEnd(25)} | Error: ${error.message}`);
      }

      console.log('');
    }

    // Summary
    console.log(`${'═'.repeat(70)}`);
    console.log(`📈 SUMMARY`);
    console.log(`${'═'.repeat(70)}`);
    console.log(`✅ Found:   ${totalFound} collections`);
    console.log(`❌ Missing: ${totalMissing} collections`);
    console.log(`📊 Total:   ${totalFound + totalMissing} collections`);
    console.log(`${'═'.repeat(70)}\n`);

    if (totalMissing === 0) {
      console.log('✨ All default seeder data is present for operator 3001!\n');
    } else {
      console.log(`⚠️  ${totalMissing} collection(s) need to be seeded.\n`);
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkSeederData();
