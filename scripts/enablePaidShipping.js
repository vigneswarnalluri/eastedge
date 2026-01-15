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

const enablePaidShipping = async () => {
  try {
    console.log('💰 Enabling paid shipping...');
    
    // Find existing settings
    const settings = await Settings.findOne();
    
    if (settings) {
      // Update shipping settings to enable paid shipping
      settings.shipping = {
        freeShippingThreshold: 999,
        forcePaidShipping: true,  // Enable force paid shipping
        defaultShippingCost: 50   // Set shipping cost to ₹50
      };
      
      await settings.save();
      console.log('✅ Updated shipping settings to enable paid shipping:');
      console.log('📋 New shipping settings:', JSON.stringify(settings.shipping, null, 2));
    } else {
      // Create new settings if none exist
      const newSettings = new Settings({
        shipping: {
          freeShippingThreshold: 999,
          forcePaidShipping: true,
          defaultShippingCost: 50
        }
      });
      
      await newSettings.save();
      console.log('✅ Created new settings with paid shipping enabled:');
      console.log('📋 New shipping settings:', JSON.stringify(newSettings.shipping, null, 2));
    }
    
    console.log('🎉 Paid shipping enabled successfully!');
    console.log('📋 Settings:');
    console.log('   - Free Shipping Threshold: ₹999');
    console.log('   - Force Paid Shipping: true');
    console.log('   - Default Shipping Cost: ₹50');
    
  } catch (error) {
    console.error('❌ Error enabling paid shipping:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the update
connectDB().then(() => {
  enablePaidShipping();
});
