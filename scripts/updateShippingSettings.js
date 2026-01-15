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

const updateShippingSettings = async () => {
  try {
    console.log('📦 Updating shipping settings to Option 1...');
    
    // Find existing settings
    const existingSettings = await Settings.findOne();
    
    if (existingSettings) {
      // Update existing settings
      existingSettings.shipping = {
        freeShippingThreshold: 999,
        forcePaidShipping: false,
        defaultShippingCost: 0
      };
      
      await existingSettings.save();
      console.log('✅ Updated existing shipping settings:', existingSettings.shipping);
    } else {
      // Create new settings if none exist
      const newSettings = new Settings({
        shipping: {
          freeShippingThreshold: 999,
          forcePaidShipping: false,
          defaultShippingCost: 0
        }
      });
      
      await newSettings.save();
      console.log('✅ Created new shipping settings:', newSettings.shipping);
    }
    
    console.log('🎉 Shipping settings updated successfully!');
    console.log('📋 New settings:');
    console.log('   - Free Shipping Threshold: ₹999');
    console.log('   - Force Paid Shipping: false');
    console.log('   - Default Shipping Cost: ₹0');
    
  } catch (error) {
    console.error('❌ Error updating shipping settings:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the update
connectDB().then(() => {
  updateShippingSettings();
});
