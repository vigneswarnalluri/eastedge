const express = require('express');
const router = express.Router();
const Content = require('../models/Content');
const auth = require('../middleware/auth');

// Get all content (public endpoint)
router.get('/', async (req, res) => {
  try {
    let content = await Content.findOne();
    
    if (!content) {
      // Create default content if none exists
      content = new Content({
        announcement: {
          text: 'Welcome to EastEdge!',
          link: '',
          enabled: false
        },
        heroSlides: [{
          title: 'Welcome to EastEdge',
          description: 'Discover our amazing collection',
          ctaText: 'Shop Now',
          ctaLink: '/products',
          order: 0,
          active: true
        }],
        promotionalBanner: {
          title: 'Special Offer!',
          ctaText: 'Learn More',
          enabled: false
        },

        siteSettings: {
          siteName: 'EastEdge',
          siteDescription: 'Timeless Essentials',
          contactEmail: 'info@eastedge.in',
          phoneNumber: '+91 6302244544',
          address: 'Malkajgiri, Hyderabad, Telangana, India'
        }
      });
      
      await content.save();
    }
    
    res.json(content);
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ message: 'Error fetching content' });
  }
});

// Get content by section (public endpoint)
router.get('/section/:section', async (req, res) => {
  try {
    const { section } = req.params;
    const content = await Content.findOne();
    
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    if (section === 'announcement') {
      res.json({ announcement: content.announcement });
    } else if (section === 'hero-slides') {
      res.json({ heroSlides: content.heroSlides.filter(slide => slide.active) });
    } else if (section === 'promotional-banner') {
      res.json({ promotionalBanner: content.promotionalBanner });
    } else if (section === 'site-settings') {
      res.json({ siteSettings: content.siteSettings });
    } else {
      res.status(400).json({ message: 'Invalid section' });
    }
  } catch (error) {
    console.error('Error fetching content section:', error);
    res.status(500).json({ message: 'Error fetching content section' });
  }
});



// Get current content structure (for debugging)
router.get('/debug', auth, async (req, res) => {
  try {
    let content = await Content.findOne();
    if (!content) {
      return res.json({ message: 'No content found', content: null });
    }
    
    // Check what fields exist
    const announcementFields = content.announcement ? Object.keys(content.announcement) : [];
    const heroSlideFields = content.heroSlides && content.heroSlides.length > 0 ? Object.keys(content.heroSlides[0]) : [];
    
    res.json({
      message: 'Content structure debug info',
      hasContent: !!content,
      announcementFields,
      heroSlideFields,
      content: content
    });
  } catch (error) {
    console.error('❌ Debug route error:', error);
    res.status(500).json({ message: 'Debug failed', error: error.message });
  }
});

// Test route to debug content saving
router.post('/test', auth, async (req, res) => {
  try {
    console.log('🧪 Test route called');
    console.log('📝 Request body:', req.body);
    
    // Try to create a simple test document
    const testContent = new Content({
      announcement: {
        text: 'Test announcement',
        link: '',
        linkType: 'none',
        buttonText: 'Learn More',
        targetPage: '',
        enabled: true
      },
      heroSlides: [{
        title: 'Test Slide',
        description: 'Test Description',
        ctaText: 'Test CTA',
        ctaLink: '/test',
        image: '',
        imagePreview: '',
        order: 0,
        active: true
      }]
    });
    
    console.log('💾 Attempting to save test content...');
    await testContent.save();
    console.log('✅ Test content saved successfully!');
    
    res.json({ message: 'Test successful', content: testContent });
  } catch (error) {
    console.error('❌ Test route error:', error);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      message: 'Test failed',
      error: error.message,
      details: error.stack
    });
  }
});

// Update content (admin only)
router.put('/', auth, async (req, res) => {
  try {
    console.log('📝 Received content update request:', req.body);
    const { announcement, heroSlides, promotionalBanner, siteSettings } = req.body;
    
    let content = await Content.findOne();
    
    if (!content) {
      console.log('🆕 Creating new content document');
      content = new Content();
    } else {
      console.log('📝 Updating existing content document');
    }
    
    // Update announcement
    if (announcement) {
      console.log('📢 Updating announcement:', announcement);
      // Ensure all required fields exist with defaults
      const defaultAnnouncement = {
        text: '',
        link: '',
        linkType: 'none',
        buttonText: 'Learn More',
        targetPage: '',
        enabled: false
      };
      content.announcement = { ...defaultAnnouncement, ...content.announcement, ...announcement };
    }
    
    // Update hero slides
    if (heroSlides) {
      console.log('🖼️ Updating hero slides:', heroSlides.length, 'slides');
      content.heroSlides = heroSlides.map((slide, index) => ({
        ...slide,
        order: index
      }));
    }
    
    // Update promotional banner
    if (promotionalBanner) {
      console.log('🎯 Updating promotional banner:', promotionalBanner);
      content.promotionalBanner = { ...content.promotionalBanner, ...promotionalBanner };
    }
    

    
    // Update site settings
    if (siteSettings) {
      console.log('⚙️ Updating site settings:', siteSettings);
      content.siteSettings = { ...content.siteSettings, ...siteSettings };
    }
    
    console.log('💾 Saving content to database...');
    await content.save();
    console.log('✅ Content saved successfully');
    
    res.json({ message: 'Content updated successfully', content });
  } catch (error) {
    console.error('❌ Error updating content:', error);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      validationErrors: error.errors ? Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message,
        value: error.errors[key].value
      })) : null
    });
    
    // Check if it's a validation error
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error',
        errors: Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        }))
      });
    }
    
    res.status(500).json({ 
      message: 'Error updating content',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Update specific section (admin only)
router.put('/section/:section', auth, async (req, res) => {
  try {
    const { section } = req.params;
    const updateData = req.body;
    
    let content = await Content.findOne();
    
    if (!content) {
      content = new Content();
    }
    
    if (section === 'announcement') {
      content.announcement = { ...content.announcement, ...updateData };
    } else if (section === 'hero-slides') {
      content.heroSlides = updateData.map((slide, index) => ({
        ...slide,
        order: index
      }));
    } else if (section === 'promotional-banner') {
      content.promotionalBanner = { ...content.promotionalBanner, ...updateData };
    } else if (section === 'site-settings') {
      content.siteSettings = { ...content.siteSettings, ...updateData };
    } else {
      return res.status(400).json({ message: 'Invalid section' });
    }
    
    await content.save();
    
    res.json({ message: `${section} updated successfully`, content });
  } catch (error) {
    console.error('Error updating content section:', error);
    res.status(500).json({ message: 'Error updating content section' });
  }
});

// Upload image for hero slide (admin only)
router.post('/upload-image', auth, async (req, res) => {
  try {
    // This would typically handle file upload
    // For now, we'll just return a success message
    res.json({ message: 'Image upload endpoint - implement file handling here' });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ message: 'Error uploading image' });
  }
});

module.exports = router; 