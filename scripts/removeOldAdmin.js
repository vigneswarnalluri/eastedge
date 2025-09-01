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

const removeOldAdmin = async () => {
  try {
    console.log('🔍 Looking for old admin user...');
    
    const oldAdminEmail = 'admin@eastedge.in';
    
    // Find the old admin user
    const oldAdmin = await User.findOne({ email: oldAdminEmail });
    
    if (!oldAdmin) {
      console.log('ℹ️ No user found with email:', oldAdminEmail);
      return;
    }
    
    console.log('🗑️ Found old admin user, removing...');
    console.log('📧 Email:', oldAdmin.email);
    console.log('👤 Name:', oldAdmin.name);
    console.log('🔐 Admin status:', oldAdmin.isAdmin);
    
    // Delete the old admin user
    await User.findByIdAndDelete(oldAdmin._id);
    
    console.log('✅ Old admin user removed successfully!');
    console.log('🚮 Deleted user with email:', oldAdminEmail);
    
  } catch (error) {
    console.error('❌ Error removing old admin user:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the script
connectDB().then(() => {
  removeOldAdmin();
});
