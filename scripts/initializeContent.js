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
      },
      legalPages: {
        terms: 'Terms and conditions for using our services. By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.',
        privacy: 'Privacy policy regarding your personal information. We are committed to protecting your privacy and ensuring the security of your personal data.',
        disclaimer: 'Disclaimer about product accuracy and information. While we strive to provide accurate product information, we cannot guarantee that all details are completely accurate.',
        shipping: 'Information about shipping and delivery policies. We offer various shipping options to meet your delivery needs.',
        returns: 'Our refund and returns policy. We want you to be completely satisfied with your purchase.',
        jurisdiction: 'Legal jurisdiction and applicable laws. This website is governed by the laws of India and any disputes will be resolved in the courts of Hyderabad.'
      }
    });

    await defaultContent.save();
    console.log('✅ Default content created successfully!');
    console.log('📝 Content includes:');
    console.log('   - Top bar announcement');
    console.log('   - Promotional banner');
    console.log('   - Site settings and contact info');
    console.log('   - Legal pages (Terms, Privacy, Disclaimer, Shipping, Returns, Jurisdiction)');

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