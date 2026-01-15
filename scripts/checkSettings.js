const mongoose = require('mongoose');
const Settings = require('../models/Settings');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const checkSettings = async () => {
  try {
    console.log('📊 Checking current settings...');
    
    const settings = await Settings.findOne();
    
    if (settings) {
      console.log('✅ Settings found in database:');
      console.log('📋 Current shipping settings:', JSON.stringify(settings.shipping, null, 2));
    } else {
      console.log('❌ No settings found in database');
    }
    
  } catch (error) {
    console.error('❌ Error checking settings:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the check
connectDB().then(() => {
  checkSettings();
});
