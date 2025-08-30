const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const auth = require('../middleware/auth');

// Get all settings
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      // Create default settings if none exist
      settings = new Settings();
      await settings.save();
    }
    
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ success: false, message: 'Error fetching settings' });
  }
});

// Update specific section of settings
router.put('/', auth, async (req, res) => {
  try {
    console.log('🔄 PUT /api/settings called');
    console.log('📤 Request body:', req.body);
    console.log('🔐 User:', req.user);
    
    const { section, data } = req.body;
    
    if (!section || !data) {
      console.log('❌ Missing section or data');
      return res.status(400).json({ 
        success: false, 
        message: 'Section and data are required' 
      });
    }
    
    console.log(`📝 Updating ${section} section with:`, data);
    
    let settings = await Settings.findOne();
    
    if (!settings) {
      console.log('🆕 Creating new settings document');
      settings = new Settings();
    }
    
    // Update the specific section
    settings[section] = data;
    await settings.save();
    
    console.log(`✅ ${section} settings updated successfully`);
    
    res.json({ 
      success: true, 
      message: `${section} settings updated successfully`,
      data: settings[section]
    });
  } catch (error) {
    console.error('❌ Error updating settings:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating settings' 
    });
  }
});

// Update specific section by section name
router.put('/:section', auth, async (req, res) => {
  try {
    const { section } = req.params;
    const data = req.body;
    
    if (!section || !data) {
      return res.status(400).json({ 
        success: false, 
        message: 'Section and data are required' 
      });
    }
    
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = new Settings();
    }
    
    // Update the specific section
    settings[section] = data;
    await settings.save();
    
    res.json({ 
      success: true, 
      message: `${section} settings updated successfully`,
      data: settings[section]
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating settings' 
    });
  }
});

module.exports = router; 