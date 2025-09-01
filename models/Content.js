const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  // Top Bar Announcement
  announcement: {
    text: { type: String, default: '' },
    link: { type: String, default: '' },
    linkType: { type: String, enum: ['none', 'internal', 'external'], default: 'none' },
    buttonText: { type: String, default: 'Learn More' },
    targetPage: { type: String, default: '' },
    enabled: { type: Boolean, default: false }
  },

  // Hero Slider
  heroSlidesEnabled: { type: Boolean, default: true },
  heroSlides: [{
    title: { type: String, required: true },
    description: { type: String, required: true },
    ctaText: { type: String, default: '' },
    ctaLink: { type: String, default: '' },
    image: { type: String, default: '' },
    imagePreview: { type: String, default: '' },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true }
  }],

  // Promotional Banner
  promotionalBanner: {
    title: { type: String, default: '' },
    ctaText: { type: String, default: '' },
    enabled: { type: Boolean, default: false }
  },



  // Site Settings
  siteSettings: {
    siteName: { type: String, default: 'EastEdge' },
    siteDescription: { type: String, default: '' },
    contactEmail: { type: String, default: '' },
    phoneNumber: { type: String, default: '' },
    address: { type: String, default: '' },
    socialMedia: {
      facebook: { type: String, default: '' },
      twitter: { type: String, default: '' },
      instagram: { type: String, default: '' },
      linkedin: { type: String, default: '' }
    }
  },

  // Legal Pages
  legalPages: {
    terms: { type: String, default: 'Terms and conditions for using our services...' },
    privacy: { type: String, default: 'Privacy policy regarding your personal information...' },
    disclaimer: { type: String, default: 'Disclaimer about product accuracy and information...' },
    shipping: { type: String, default: 'Information about shipping and delivery policies...' },
    returns: { type: String, default: 'Our refund and returns policy...' },
    jurisdiction: { type: String, default: 'Legal jurisdiction and applicable laws...' }
  }
}, {
  timestamps: true
});

// Create indexes
contentSchema.index({ 'heroSlides.order': 1 });

module.exports = mongoose.model('Content', contentSchema); 