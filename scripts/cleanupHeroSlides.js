const mongoose = require('mongoose');
const Content = require('../models/Content');

// MongoDB connection string - replace with your actual connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';

async function cleanupHeroSlides() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all content documents
    const contents = await Content.find({});
    console.log(`Found ${contents.length} content document(s)`);

    for (const content of contents) {
      console.log(`Processing content document: ${content._id}`);
      
      // Remove hero slider fields if they exist
      if (content.heroSlides || content.heroSlidesEnabled !== undefined) {
        console.log('  - Removing hero slider fields...');
        
        // Use unset to remove the fields completely
        await Content.updateOne(
          { _id: content._id },
          { 
            $unset: { 
              heroSlides: 1, 
              heroSlidesEnabled: 1 
            } 
          }
        );
        
        console.log('  - Hero slider fields removed successfully');
      } else {
        console.log('  - No hero slider fields found');
      }
    }

    console.log('✅ Hero slider cleanup completed successfully!');

  } catch (error) {
    console.error('❌ Error cleaning up hero slides:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the cleanup
cleanupHeroSlides();
