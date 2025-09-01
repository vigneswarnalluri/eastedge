const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../config.env') });

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = require('../models/User');

const updateExistingUsers = async () => {
  try {
    console.log('🔄 Starting user model update...');
    
    // Update all existing users to include the new fields
    const result = await User.updateMany(
      {}, // Update all users
      {
        $set: {
          dateOfBirth: null,
          gender: null,
          bio: null
        }
      }
    );
    
    console.log(`✅ Successfully updated ${result.modifiedCount} users`);
    console.log('📊 New fields added: dateOfBirth, gender, bio');
    
    // Verify the update by checking a few users
    const sampleUsers = await User.find().limit(3).select('name email dateOfBirth gender bio');
    console.log('🔍 Sample updated users:', JSON.stringify(sampleUsers, null, 2));
    
  } catch (error) {
    console.error('❌ Error updating users:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the update
updateExistingUsers();
