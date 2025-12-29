require('dotenv').config();
const mongoose = require('mongoose');
const CmsTermsAndConditions = require('./models/CmsTermsAndConditions');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB\n');
    
    const count = await CmsTermsAndConditions.countDocuments();
    console.log(`✅ Total records in cms_terms_and_conditions: ${count}\n`);
    
    const records = await CmsTermsAndConditions.find({}).select('operatorId status');
    records.forEach(record => {
      console.log(`   - Operator ID: ${record.operatorId}, Status: ${record.status}`);
    });
    
    console.log('\n✅ Verification complete!');
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
})();
