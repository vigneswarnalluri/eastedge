const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const auth = require('../middleware/auth'); // Added auth middleware

// Register user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password
    });

    const savedUser = await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: savedUser._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      _id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      isAdmin: savedUser.isAdmin,
      token
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    console.log('🔐 Login attempt for email:', req.body.email);
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found for email:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('✅ User found:', user._id);

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('❌ Password mismatch for user:', user._id);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('✅ Password verified for user:', user._id);

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ JWT token generated successfully for user:', user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    console.log('🔍 Profile request received');
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    console.log('✅ Token received, length:', token.length);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ JWT verified, userId:', decoded.userId);

    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      console.log('❌ User not found for userId:', decoded.userId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('✅ User profile retrieved successfully');
    res.json(user);
  } catch (error) {
    console.error('❌ Profile error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
 });

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user fields
    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;
    if (req.body.password) user.password = req.body.password;
    if (req.body.address) user.address = req.body.address;
    if (req.body.phone) user.phone = req.body.phone;

    const updatedUser = await user.save();
    const userResponse = updatedUser.toObject();
    delete userResponse.password;

    res.json(userResponse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Make user admin - DEVELOPMENT ONLY
router.put('/make-admin/:id', async (req, res) => {
  try {
    console.log('🔍 Making user admin:', req.params.id);
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isAdmin: true },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('✅ User made admin successfully:', user.email);
    
    res.json({
      success: true,
      message: 'User is now admin',
      user
    });
  } catch (error) {
    console.error('❌ Error making user admin:', error);
    res.status(500).json({ message: error.message });
  }
});

// Check admin status
router.get('/check-admin', auth, async (req, res) => {
  try {
    console.log('🔍 Checking admin status for user:', req.user._id, 'isAdmin:', req.user.isAdmin);
    
    res.json({
      success: true,
      isAdmin: req.user.isAdmin || false,
      user: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        isAdmin: req.user.isAdmin
      }
    });
  } catch (error) {
    console.error('❌ Error checking admin status:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
