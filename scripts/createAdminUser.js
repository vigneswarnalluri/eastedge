const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ path: './config.env' });

const connectDB = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    console.log('📊 MongoDB URI exists:', !!process.env.MONGO_URI);
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const createAdminUser = async () => {
  try {
    console.log('🔍 Checking for existing admin user...');
    
    const adminEmail = 'eastedge4@gmail.com';
    const adminPassword = '123456';
    
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists with email:', adminEmail);
      
      // Update password if needed
      existingAdmin.password = adminPassword;
      existingAdmin.isAdmin = true;
      await existingAdmin.save();
      
      console.log('✅ Admin user password updated successfully');
      return;
    }
    
    console.log('🆕 Creating new admin user...');
    
    const adminUser = new User({
      name: 'EastEdge Admin',
      email: adminEmail,
      password: adminPassword,
      isAdmin: true
    });
    
    await adminUser.save();
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminEmail);
    console.log('🔐 Password:', adminPassword);
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the script
connectDB().then(() => {
  createAdminUser();
});
