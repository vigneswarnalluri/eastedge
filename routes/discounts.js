const express = require('express');
const router = express.Router();
const Discount = require('../models/Discount');
const auth = require('../middleware/auth');

// Get all discounts (admin only)
router.get('/', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const discounts = await Discount.find().sort({ createdAt: -1 });
    res.json(discounts);
  } catch (error) {
    console.error('Error fetching discounts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get active discounts (public)
router.get('/active', async (req, res) => {
  try {
    const now = new Date();
    const discounts = await Discount.find({
      isActive: true,
      $or: [
        { validUntil: { $gt: now } },
        { validUntil: { $exists: false } }
      ],
      $or: [
        { maxUses: { $exists: false } },
        { $expr: { $lt: ['$currentUses', '$maxUses'] } }
      ]
    }).select('code type value minOrderAmount maxDiscount description');
    
    res.json(discounts);
  } catch (error) {
    console.error('Error fetching active discounts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Validate discount code
router.post('/validate', async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    
    if (!code || !orderAmount) {
      return res.status(400).json({ message: 'Code and order amount are required' });
    }

    const discount = await Discount.findOne({ code: code.toUpperCase() });
    
    if (!discount) {
      return res.status(404).json({ message: 'Invalid discount code' });
    }

    if (!discount.isValid()) {
      return res.status(400).json({ message: 'Discount code is not valid' });
    }

    if (orderAmount < discount.minOrderAmount) {
      return res.status(400).json({ 
        message: `Minimum order amount of ₹${discount.minOrderAmount} required` 
      });
    }

    const discountAmount = discount.calculateDiscount(orderAmount);
    
    res.json({
      valid: true,
      discount: {
        id: discount._id,
        code: discount.code,
        type: discount.type,
        value: discount.value,
        discountAmount,
        minOrderAmount: discount.minOrderAmount
      }
    });
  } catch (error) {
    console.error('Error validating discount:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new discount (admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const {
      code,
      type,
      value,
      minOrderAmount,
      maxDiscount,
      maxUses,
      validFrom,
      validUntil,
      isActive,
      description
    } = req.body;

    // Check if code already exists
    const existingDiscount = await Discount.findOne({ code: code.toUpperCase() });
    if (existingDiscount) {
      return res.status(400).json({ message: 'Discount code already exists' });
    }

    const discount = new Discount({
      code: code.toUpperCase(),
      type,
      value: Number(value),
      minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
      maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
      maxUses: maxUses ? Number(maxUses) : undefined,
      validFrom: validFrom || undefined,
      validUntil: validUntil || undefined,
      isActive: isActive !== undefined ? isActive : true,
      description
    });

    await discount.save();
    res.status(201).json(discount);
  } catch (error) {
    console.error('Error creating discount:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Update discount (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const {
      code,
      type,
      value,
      minOrderAmount,
      maxDiscount,
      maxUses,
      validFrom,
      validUntil,
      isActive,
      description
    } = req.body;

    const discount = await Discount.findById(req.params.id);
    if (!discount) {
      return res.status(404).json({ message: 'Discount not found' });
    }

    // Check if code already exists (excluding current discount)
    if (code && code !== discount.code) {
      const existingDiscount = await Discount.findOne({ 
        code: code.toUpperCase(),
        _id: { $ne: req.params.id }
      });
      if (existingDiscount) {
        return res.status(400).json({ message: 'Discount code already exists' });
      }
    }

    discount.code = code ? code.toUpperCase() : discount.code;
    discount.type = type || discount.type;
    discount.value = value ? Number(value) : discount.value;
    discount.minOrderAmount = minOrderAmount !== undefined ? Number(minOrderAmount) : discount.minOrderAmount;
    discount.maxDiscount = maxDiscount !== undefined ? Number(maxDiscount) : discount.maxDiscount;
    discount.maxUses = maxUses !== undefined ? Number(maxUses) : discount.maxUses;
    discount.validFrom = validFrom || discount.validFrom;
    discount.validUntil = validUntil || discount.validUntil;
    discount.isActive = isActive !== undefined ? isActive : discount.isActive;
    discount.description = description !== undefined ? description : discount.description;

    await discount.save();
    res.json(discount);
  } catch (error) {
    console.error('Error updating discount:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete discount (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const discount = await Discount.findById(req.params.id);
    if (!discount) {
      return res.status(404).json({ message: 'Discount not found' });
    }

    await Discount.findByIdAndDelete(req.params.id);
    res.json({ message: 'Discount deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting discount:', error);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Toggle discount status (admin only)
router.patch('/:id/toggle', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const discount = await Discount.findById(req.params.id);
    if (!discount) {
      return res.status(404).json({ message: 'Discount not found' });
    }

    discount.isActive = !discount.isActive;
    await discount.save();
    
    res.json({ 
      message: `Discount ${discount.isActive ? 'activated' : 'deactivated'} successfully`,
      isActive: discount.isActive 
    });
  } catch (error) {
    console.error('Error toggling discount:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 