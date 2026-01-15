const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const User = require('../models/User');
const Settings = require('../models/Settings');
const { calculateCartGST } = require('../utils/gstCalculator');
const { calculateCartShipping } = require('../utils/shippingCalculator');

// Create new order - PROTECTED ROUTE
router.post('/', auth, async (req, res) => {
  try {
    console.log('=== COD ORDER DEBUG ===');
    console.log('User ID:', req.user._id);
    console.log('Request body:', req.body);
    console.log('Payment method:', req.body.paymentMethod);
    console.log('Total amount:', req.body.total);
    console.log('Items count:', req.body.items?.length);
    
    // Debug each item's variant information
    if (req.body.items && Array.isArray(req.body.items)) {
      console.log('=== ITEM VARIANT DEBUG ===');
      req.body.items.forEach((item, index) => {
        console.log(`Item ${index + 1}:`, {
          name: item.name,
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor,
          sku: item.sku,
          variantPrice: item.variantPrice,
          category: item.category,
          categoryName: item.categoryName,
          hasVariants: !!(item.selectedSize || item.selectedColor)
        });
      });
      console.log('=== END ITEM VARIANT DEBUG ===');
    }
    
    const { items, shipping, total, paymentMethod, codCharges } = req.body;
    
    // Get shipping settings
    let shippingSettings = null;
    try {
      const settings = await Settings.findOne();
      if (settings && settings.shipping) {
        shippingSettings = settings.shipping;
        console.log('✅ Shipping settings loaded:', shippingSettings);
      } else {
        console.log('⚠️ No shipping settings found, using defaults');
        shippingSettings = {
          freeShippingThreshold: 999,
          forcePaidShipping: false,
          defaultShippingCost: 0
        };
      }
    } catch (settingsError) {
      console.error('❌ Error loading shipping settings:', settingsError);
      // Use default settings
      shippingSettings = {
        freeShippingThreshold: 999,
        forcePaidShipping: false,
        defaultShippingCost: 0
      };
    }
    
    // Calculate shipping cost
    const shippingCalculation = calculateCartShipping(items, shippingSettings);
    console.log('📦 Shipping calculation:', shippingCalculation);
    
    // Check if database schema supports variants
    try {
      const testOrder = new Order({
        user: req.user._id,
        orderItems: [{
          product: new mongoose.Types.ObjectId(), // Use proper ObjectId
          name: 'Test',
          quantity: 1,
          price: 0,
          selectedSize: 'test',
          selectedColor: 'test'
        }]
      });
      
      // Try to validate the schema
      await testOrder.validate();
      console.log('✅ Database schema supports variants');
    } catch (schemaError) {
      console.error('❌ Database schema does not support variants:', schemaError.message);
      console.log('⚠️ This suggests the database needs migration or the schema is outdated');
      
      // Calculate GST breakdown
      const gstBreakdown = calculateCartGST(items.map(item => ({
        price: item.variantPrice || item.price,
        quantity: item.quantity
      })));

      // Create order without variant fields (fallback)
      const newOrder = new Order({
        user: req.user._id,
        orderItems: items.map(item => ({
          product: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.variantPrice || item.price,
          image: item.image || item.images?.[0]
          // Note: Variant fields are omitted due to schema incompatibility
        })),
        shippingAddress: shipping,
        paymentMethod,
        totalPrice: total,
        shippingPrice: shippingCalculation.shippingCost,
        taxPrice: gstBreakdown.gstAmount,
        gstBreakdown: {
          baseAmount: gstBreakdown.baseAmount,
          gstAmount: gstBreakdown.gstAmount,
          gstRate: gstBreakdown.gstRate,
          gstPercentage: gstBreakdown.gstPercentage
        },
        status: 'Pending'
      });
      
      const savedOrder = await newOrder.save();
      console.log('Created order (fallback mode):', savedOrder);
      
      // Update user analytics after successful order creation (fallback)
      try {
        await User.findByIdAndUpdate(
          req.user._id,
          {
            $inc: { totalOrders: 1, totalSpent: total },
            $set: { lastOrderDate: new Date() }
          }
        );
        console.log('✅ User analytics updated successfully (fallback)');
      } catch (analyticsError) {
        console.error('❌ Failed to update user analytics (fallback):', analyticsError);
        // Don't fail the order if analytics update fails
      }
      
      return res.status(201).json({
        success: true,
        order: savedOrder,
        message: 'Order placed successfully (Note: Variant data not saved due to schema incompatibility)',
        schemaWarning: true
      });
    }
    
    // Calculate GST breakdown
    const gstBreakdown = calculateCartGST(items.map(item => ({
      price: item.variantPrice || item.price,
      quantity: item.quantity
    })));

    // Normal order creation with variants
    const newOrder = new Order({
      user: req.user._id,
      orderItems: items.map(item => ({
        product: item._id,
        name: item.name,
        quantity: item.quantity,
        price: item.variantPrice || item.price,
        image: item.image || item.images?.[0],
        // Add variant information
        selectedSize: item.selectedSize || null,
        selectedColor: item.selectedColor || null,
        sku: item.sku || null,
        variantPrice: item.variantPrice || item.price,
        category: item.category || null,
        categoryName: item.categoryName || null
      })),
      shippingAddress: shipping,
      paymentMethod,
      totalPrice: total,
      shippingPrice: shippingCalculation.shippingCost,
      taxPrice: gstBreakdown.gstAmount,
      gstBreakdown: {
        baseAmount: gstBreakdown.baseAmount,
        gstAmount: gstBreakdown.gstAmount,
        gstRate: gstBreakdown.gstRate,
        gstPercentage: gstBreakdown.gstPercentage
      },
      status: 'Pending'
    });
    
    console.log('=== ORDER CREATION DEBUG ===');
    console.log('Order items being saved:', newOrder.orderItems);
    console.log('=== END ORDER CREATION DEBUG ===');
    
    const savedOrder = await newOrder.save();
    console.log('Created order:', savedOrder);
    
    // Update user analytics after successful order creation
    try {
      await User.findByIdAndUpdate(
        req.user._id,
        {
          $inc: { totalOrders: 1, totalSpent: total },
          $set: { lastOrderDate: new Date() }
        }
      );
      console.log('✅ User analytics updated successfully');
    } catch (analyticsError) {
      console.error('❌ Failed to update user analytics:', analyticsError);
      // Don't fail the order if analytics update fails
    }
    
    res.status(201).json({
      success: true,
      order: savedOrder,
      message: 'Order placed successfully'
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create order',
      error: error.message
    });
  }
});

// Get user orders - PROTECTED ROUTE
router.get('/', auth, async (req, res) => {
  try {
    const userOrders = await Order.find({ user: req.user._id })
      .populate('orderItems.product', 'name image')
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({
      success: true,
      orders: userOrders
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch orders' 
    });
  }
});

// Get single order - PROTECTED ROUTE
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('orderItems.product', 'name image price')
      .populate('user', 'name email');
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }
    
    // Check if user owns this order or is admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own orders.'
      });
    }
    
    res.json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch order' 
    });
  }
});

// Get all orders - ADMIN ONLY ROUTE
router.get('/admin/all', auth, async (req, res) => {
  try {
    console.log('🔍 Admin orders request from user:', req.user._id, 'isAdmin:', req.user.isAdmin);
    
    if (req.user.role !== 'admin' && !req.user.isAdmin) {
      console.log('❌ Access denied - user is not admin');
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const { status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name image price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Order.countDocuments(query);
    
    console.log('✅ Admin orders fetched successfully:', orders.length);
    
    res.json({
      success: true,
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('❌ Admin orders fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch orders' 
    });
  }
});

// Update order status - ADMIN ONLY ROUTE
router.put('/admin/:id/status', auth, async (req, res) => {
  try {
    console.log('🔍 Admin status update request from user:', req.user._id, 'isAdmin:', req.user.isAdmin);
    
    if (req.user.role !== 'admin' && !req.user.isAdmin) {
      console.log('❌ Access denied - user is not admin');
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        ...(status === 'Delivered' && { isDelivered: true, deliveredAt: new Date() }),
        ...(status === 'Cancelled' && { isDelivered: false })
      },
      { new: true }
    ).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    console.log('✅ Order status updated successfully');

    res.json({
      success: true,
      order,
      message: 'Order status updated successfully'
    });
  } catch (error) {
    console.error('❌ Order status update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status'
    });
  }
});

// Get order statistics - ADMIN ONLY ROUTE
router.get('/admin/stats', auth, async (req, res) => {
  try {
    console.log('🔍 Admin stats request from user:', req.user._id, 'isAdmin:', req.user.isAdmin);
    
    if (req.user.role !== 'admin' && !req.user.isAdmin) {
      console.log('❌ Access denied - user is not admin');
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const { startDate, endDate, status } = req.query;
    
    // Build match stage for filtering
    let matchStage = {};
    
    // Add date filtering
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) {
        matchStage.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        // Set end date to end of day
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        matchStage.createdAt.$lte = endDateTime;
      }
    }
    
    // Add status filtering
    if (status && status !== 'all') {
      matchStage.status = status;
    }
    
    const pipeline = [];
    
    // Add match stage if filters are applied
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }
    
    pipeline.push({
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$totalPrice' },
        pendingOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] }
        },
        processingOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'Processing'] }, 1, 0] }
        },
        shippedOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'Shipped'] }, 1, 0] }
        },
        deliveredOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'Delivered'] }, 1, 0] }
        }
      }
    });
    
    const stats = await Order.aggregate(pipeline);

    console.log('✅ Admin stats fetched successfully');

    res.json({
      success: true,
      stats: stats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        processingOrders: 0,
        shippedOrders: 0,
        deliveredOrders: 0
      }
    });
  } catch (error) {
    console.error('❌ Order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order statistics'
    });
  }
});

// Create sample orders for testing - DEVELOPMENT ONLY
router.post('/admin/sample', auth, async (req, res) => {
  try {
    console.log('🔍 Admin sample orders request from user:', req.user._id, 'isAdmin:', req.user.isAdmin);
    
    if (req.user.role !== 'admin' && !req.user.isAdmin) {
      console.log('❌ Access denied - user is not admin');
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    // Create sample orders for testing
    const sampleOrders = [
      {
        user: req.user._id, // Use admin user as customer for testing
        orderItems: [{
          product: '507f1f77bcf86cd799439011', // Sample product ID
          name: 'Sample Product 1',
          quantity: 2,
          price: 1500,
          image: 'https://via.placeholder.com/150'
        }],
        shippingAddress: {
          street: '123 Sample Street',
          city: 'Sample City',
          state: 'Sample State',
          zipCode: '12345',
          country: 'India'
        },
        paymentMethod: 'Prepaid',
        totalPrice: 3000,
        shippingPrice: 0,
        status: 'Pending'
      },
      {
        user: req.user._id,
        orderItems: [{
          product: '507f1f77bcf86cd799439012',
          name: 'Sample Product 2',
          quantity: 1,
          price: 2499,
          image: 'https://via.placeholder.com/150'
        }],
        shippingAddress: {
          street: '456 Test Avenue',
          city: 'Test City',
          state: 'Test State',
          zipCode: '67890',
          country: 'India'
        },
        paymentMethod: 'Cash on Delivery',
        totalPrice: 2499,
        shippingPrice: 50,
        status: 'Processing'
      }
    ];

    const createdOrders = await Order.insertMany(sampleOrders);

    console.log('✅ Sample orders created successfully');

    res.json({
      success: true,
      message: 'Sample orders created successfully',
      orders: createdOrders
    });
  } catch (error) {
    console.error('❌ Sample orders creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create sample orders'
    });
  }
});

// Delete order - ADMIN ONLY ROUTE
router.delete('/admin/:id', auth, async (req, res) => {
  try {
    console.log('🔍 Admin delete order request from user:', req.user._id, 'isAdmin:', req.user.isAdmin);
    
    if (req.user.role !== 'admin' && !req.user.isAdmin) {
      console.log('❌ Access denied - user is not admin');
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const order = await Order.findByIdAndDelete(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    console.log('✅ Order deleted successfully');

    res.json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('❌ Order deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete order'
    });
  }
});

// Database migration route - ADMIN ONLY
router.post('/admin/migrate-schema', auth, async (req, res) => {
  try {
    console.log('🔍 Schema migration request from user:', req.user._id, 'isAdmin:', req.user.isAdmin);
    
    if (req.user.role !== 'admin' && !req.user.isAdmin) {
      console.log('❌ Access denied - user is not admin');
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    console.log('🔄 Starting database schema migration...');
    
    // Get all existing orders
    const existingOrders = await Order.find({});
    console.log(`Found ${existingOrders.length} existing orders to migrate`);
    
    let migratedCount = 0;
    let errors = [];

    for (const order of existingOrders) {
      try {
        // Check if order needs migration (missing variant fields)
        const needsMigration = order.orderItems.some(item => 
          !item.hasOwnProperty('selectedSize') || 
          !item.hasOwnProperty('selectedColor') ||
          !item.hasOwnProperty('sku')
        );

        if (needsMigration) {
          // Update each order item with default variant fields
          const updatedOrderItems = order.orderItems.map(item => ({
            ...item.toObject(),
            selectedSize: item.selectedSize || null,
            selectedColor: item.selectedColor || null,
            sku: item.sku || null,
            variantPrice: item.variantPrice || item.price || 0,
            category: item.category || null,
            categoryName: item.categoryName || null
          }));

          // Update the order
          await Order.findByIdAndUpdate(order._id, {
            orderItems: updatedOrderItems
          });

          migratedCount++;
          console.log(`✅ Migrated order ${order._id}`);
        }
      } catch (error) {
        console.error(`❌ Error migrating order ${order._id}:`, error);
        errors.push({ orderId: order._id, error: error.message });
      }
    }

    console.log(`🔄 Schema migration completed. Migrated: ${migratedCount}, Errors: ${errors.length}`);

    res.json({
      success: true,
      message: 'Database schema migration completed',
      migratedCount,
      errorCount: errors.length,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('❌ Schema migration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to migrate database schema',
      error: error.message
    });
  }
});

module.exports = router;
