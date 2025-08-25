const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Mock orders storage (in a real app, this would be in MongoDB)
let orders = [];
let orderIdCounter = 1;

// Create new order - PROTECTED ROUTE
router.post('/', auth, async (req, res) => {
  try {
    console.log('=== COD ORDER DEBUG ===');
    console.log('User ID:', req.user._id);
    console.log('Request body:', req.body);
    console.log('Payment method:', req.body.paymentMethod);
    console.log('Total amount:', req.body.total);
    console.log('Items count:', req.body.items?.length);
    
    const { items, shipping, total, paymentMethod, codCharges } = req.body;
    
    const newOrder = {
      _id: `order_${orderIdCounter++}`,
      userId: req.user._id, // Add user ID to order
      userEmail: req.user.email,
      items,
      shipping,
      total,
      paymentMethod,
      codCharges: codCharges || 0,
      status: 'pending',
      createdAt: new Date().toISOString(),
      orderNumber: `ORD-${Date.now()}`
    };
    
    console.log('Created order:', newOrder);
    orders.push(newOrder);
    
    res.status(201).json({
      success: true,
      order: newOrder,
      message: 'Order placed successfully'
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create order' 
    });
  }
});

// Get user orders - PROTECTED ROUTE
router.get('/', auth, async (req, res) => {
  try {
    // Filter orders by user ID
    const userOrders = orders.filter(order => order.userId === req.user._id);
    res.json({
      success: true,
      orders: userOrders.slice(-10) // Return last 10 orders for this user
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
    const order = orders.find(o => o._id === req.params.id);
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }
    
    // Check if user owns this order
    if (order.userId !== req.user._id) {
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

module.exports = router;
