const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

const Settings = require('../models/Settings');

const connectDB = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected Successfully');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  }
};

const initializeSettings = async () => {
  try {
    console.log('📊 Checking for existing settings...');
    
    const existingSettings = await Settings.findOne();
    
    if (existingSettings) {
      console.log('✅ Settings already exist in database');
      console.log('📋 Current settings:', JSON.stringify(existingSettings, null, 2));
      return;
    }
    
    console.log('🆕 Creating default settings...');
    
    const defaultSettings = new Settings({
      general: {
        storeName: 'EastEdge',
        contactEmail: 'info@eastedge.in',
        phoneNumber: '+91 6302244544',
        logo: '',
        logoPreview: ''
      },
      store: {
        businessAddress: 'Malkajgiri, Hyderabad, Telangana, India',
        taxRate: 18,
        currency: '₹',
        timezone: 'Asia/Kolkata'
      },
      shipping: {
        freeShippingThreshold: 999,
        forcePaidShipping: false,
        defaultShippingCost: 0
      },
      payment: {
        razorpay: true,
        cod: true,
        cashfree: false
      },
      email: {
        orderConfirmation: true,
        adminNotification: true,
        shippingUpdates: true,
        smtpHost: '',
        smtpPort: '',
        smtpEmail: '',
        smtpPassword: ''
      },
      admin: {
        users: [
          { id: 'user_1', name: 'Admin User', email: 'info@eastedge.in', role: 'Super Admin' },
          { id: 'user_2', name: 'Editor User', email: 'editor@eastedge.in', role: 'Editor' }
        ]
      },
      appearance: {
        primaryColor: '#059669',
        secondaryColor: '#1a1a1a',
        themeMode: 'dark',
        fontFamily: 'Inter',
        borderRadius: '8'
      }
    });
    
    await defaultSettings.save();
    console.log('✅ Default settings created successfully!');
    console.log('📋 Settings saved:', JSON.stringify(defaultSettings, null, 2));
    
  } catch (error) {
    console.error('❌ Error initializing settings:', error);
  }
};

const main = async () => {
  await connectDB();
  await initializeSettings();
  
  console.log('🎉 Settings initialization completed!');
  process.exit(0);
};

main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
}); 