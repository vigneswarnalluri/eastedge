const mongoose = require('mongoose');
const Content = require('../models/Content');

// MongoDB connection string - replace with your actual connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';

async function initializeContent() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if content already exists
    const existingContent = await Content.findOne();
    
    if (existingContent) {
      console.log('Content already exists in database');
      return;
    }

    // Create default content
    const defaultContent = new Content({
      announcement: {
        text: '🎉 Welcome to EastEdge! Free shipping on orders above ₹1000',
        link: '/products',
        linkType: 'internal',
        buttonText: 'Shop Now',
        targetPage: '/products',
        enabled: true
      },
      heroSlides: [
        {
          title: 'Timeless Essentials',
          description: 'Discover our curated collection of quality products that stand the test of time.',
          ctaText: 'Shop Now',
          ctaLink: '/products',
          image: '',
          imagePreview: '',
          order: 0,
          active: true
        },
        {
          title: 'New Arrivals',
          description: 'Fresh styles and innovative designs just arrived. Be the first to explore!',
          ctaText: 'Explore New',
          ctaLink: '/new-arrivals',
          image: '',
          imagePreview: '',
          order: 1,
          active: true
        }
      ],
      promotionalBanner: {
        title: '🎯 Special Offer: 20% Off on Selected Items',
        ctaText: 'Shop the Sale',
        enabled: true
      },

      siteSettings: {
        siteName: 'EastEdge',
        siteDescription: 'Timeless Essentials for Modern Living',
        contactEmail: 'info@eastedge.in',
        phoneNumber: '+91 6302244544',
        address: 'Malkajgiri, Hyderabad, Telangana, India',
        socialMedia: {
          facebook: 'https://facebook.com/eastedge',
          twitter: 'https://twitter.com/eastedge',
          instagram: 'https://instagram.com/eastedge',
          linkedin: 'https://linkedin.com/company/eastedge'
        }
      }
    });

    await defaultContent.save();
    console.log('✅ Default content created successfully!');
    console.log('📝 Content includes:');
    console.log('   - Top bar announcement');
    console.log('   - 2 hero slides');
    console.log('   - Promotional banner');
    console.log('   - Site settings and contact info');

  } catch (error) {
    console.error('❌ Error initializing content:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the initialization
initializeContent(); 