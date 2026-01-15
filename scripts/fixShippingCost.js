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

const fixShippingCost = async () => {
  try {
    console.log('🔧 Fixing shipping cost...');
    
    const settings = await Settings.findOne();
    
    if (settings) {
      settings.shipping.defaultShippingCost = 50;
      await settings.save();
      console.log('✅ Updated shipping cost to ₹50');
      console.log('📋 Current shipping settings:', JSON.stringify(settings.shipping, null, 2));
    } else {
      console.log('❌ No settings found');
    }
    
  } catch (error) {
    console.error('❌ Error fixing shipping cost:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the fix
connectDB().then(() => {
  fixShippingCost();
});
