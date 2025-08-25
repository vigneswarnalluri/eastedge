const express = require('express');
const router = express.Router();

// Mock orders storage (in a real app, this would be in MongoDB)
let orders = [];
let orderIdCounter = 1;

// Create new order
router.post('/', async (req, res) => {
  try {
    console.log('=== COD ORDER DEBUG ===');
    console.log('Request body:', req.body);
    console.log('Payment method:', req.body.paymentMethod);
    console.log('Total amount:', req.body.total);
    console.log('Items count:', req.body.items?.length);
    
    const { items, shipping, total, paymentMethod, codCharges } = req.body;
    
    const newOrder = {
      _id: `order_${orderIdCounter++}`,
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

// Get user orders
router.get('/', async (req, res) => {
  try {
    // In a real app, you'd filter by user ID from JWT token
    res.json({
      success: true,
      orders: orders.slice(-10) // Return last 10 orders
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch orders' 
    });
  }
});

// Get single order
router.get('/:id', async (req, res) => {
  try {
    const order = orders.find(o => o._id === req.params.id);
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
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
