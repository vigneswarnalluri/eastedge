const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const auth = require('../middleware/auth'); // Added auth middleware
const Order = require('../models/Order'); // Added Order model

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

// Get all customers (ADMIN ONLY)
router.get('/admin/customers', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }

    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    const skip = (page - 1) * limit;

    // Build search query
    let searchQuery = {};
    if (search) {
      searchQuery = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ]
      };
    }

    // Add status filter if provided
    if (status && status !== 'all') {
      if (status === 'no-orders') {
        searchQuery.orders = { $size: 0 };
      } else {
        searchQuery['lastOrder.status'] = status;
      }
    }

    // Get customers with pagination and last order status
    const customers = await User.aggregate([
      { $match: searchQuery },
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'user',
          as: 'orders'
        }
      },
      {
        $addFields: {
          lastOrder: {
            $cond: {
              if: { $gt: [{ $size: '$orders' }, 0] },
              then: { $arrayElemAt: ['$orders', 0] },
              else: null
            }
          },
          orderCount: { $size: '$orders' }
        }
      },
      {
        $sort: { 'lastOrder.createdAt': -1, createdAt: -1 }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          phone: 1,
          createdAt: 1,
          isBlocked: 1,
          lastOrderStatus: '$lastOrder.status',
          lastOrderDate: '$lastOrder.createdAt',
          orderCount: 1
        }
      },
      { $skip: skip },
      { $limit: parseInt(limit) }
    ]);

    // Get total count for pagination
    const totalCustomers = await User.countDocuments(searchQuery);

    // Get customer analytics
    const analytics = await User.aggregate([
      { $match: searchQuery },
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'user',
          as: 'orders'
        }
      },
      {
        $addFields: {
          lastOrder: {
            $cond: {
              if: { $gt: [{ $size: '$orders' }, 0] },
              then: { $arrayElemAt: ['$orders', 0] },
              else: null
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          activeCustomers: { $sum: { $cond: [{ $eq: ['$isBlocked', false] }, 1, 0] } },
          blockedCustomers: { $sum: { $cond: [{ $eq: ['$isBlocked', true] }, 1, 0] } },
          newCustomersThisMonth: {
            $sum: {
              $cond: [
                { $gte: ['$createdAt', new Date(new Date().getFullYear(), new Date().getMonth(), 1)] },
                1,
                0
              ]
            }
          },
          customersWithOrders: {
            $sum: {
              $cond: [
                { $gt: [{ $size: '$orders' }, 0] },
                1,
                0
              ]
            }
          },
          pendingOrders: {
            $sum: {
              $cond: [
                { $eq: ['$lastOrder.status', 'Pending'] },
                1,
                0
              ]
            }
          },
          processingOrders: {
            $sum: {
              $cond: [
                { $eq: ['$lastOrder.status', 'Processing'] },
                1,
                0
              ]
            }
          },
          shippedOrders: {
            $sum: {
              $cond: [
                { $eq: ['$lastOrder.status', 'Shipped'] },
                1,
                0
              ]
            }
          },
          deliveredOrders: {
            $sum: {
              $cond: [
                { $eq: ['$lastOrder.status', 'Delivered'] },
                1,
                0
              ]
            }
          },
          cancelledOrders: {
            $sum: {
              $cond: [
                { $eq: ['$lastOrder.status', 'Cancelled'] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    res.json({
      success: true,
      customers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCustomers / limit),
        totalCustomers,
        hasNextPage: page * limit < totalCustomers,
        hasPrevPage: page > 1
      },
      analytics: analytics[0] || {
        totalCustomers: 0,
        activeCustomers: 0,
        blockedCustomers: 0,
        newCustomersThisMonth: 0,
        customersWithOrders: 0,
        pendingOrders: 0,
        processingOrders: 0,
        shippedOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0
      }
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch customers' });
  }
});

// Update customer status (block/unblock) - ADMIN ONLY
router.put('/admin/customers/:id/status', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }

    const { id } = req.params;
    const { isBlocked, reason } = req.body;

    const customer = await User.findById(id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // Update customer status
    customer.isBlocked = isBlocked;
    if (reason) {
      customer.blockReason = reason;
    }
    customer.blockedAt = isBlocked ? new Date() : null;

    await customer.save();

    res.json({
      success: true,
      message: `Customer ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
      customer: {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        isBlocked: customer.isBlocked,
        blockReason: customer.blockReason,
        blockedAt: customer.blockedAt
      }
    });
  } catch (error) {
    console.error('Error updating customer status:', error);
    res.status(500).json({ success: false, message: 'Failed to update customer status' });
  }
});

// Get customer details with orders - ADMIN ONLY
router.get('/admin/customers/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }

    const { id } = req.params;

    const customer = await User.findById(id).select('-password');
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // Get customer's orders
    const orders = await Order.find({ user: id })
      .sort({ createdAt: -1 })
      .limit(10);

    // Get customer statistics
    const orderStats = await Order.aggregate([
      { $match: { user: customer._id } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalPrice' },
          averageOrderValue: { $avg: '$totalPrice' },
          lastOrderDate: { $max: '$createdAt' }
        }
      }
    ]);

    res.json({
      success: true,
      customer,
      orders,
      stats: orderStats[0] || {
        totalOrders: 0,
        totalSpent: 0,
        averageOrderValue: 0,
        lastOrderDate: null
      }
    });
  } catch (error) {
    console.error('Error fetching customer details:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch customer details' });
  }
});

module.exports = router;
