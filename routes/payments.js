const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const router = express.Router();

// Test endpoint to verify route is working
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Payments route is working',
    timestamp: new Date().toISOString()
  });
});

// Initialize Razorpay only if keys are available
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  console.log('✅ Razorpay initialized successfully');
} else {
  console.log('⚠️ Razorpay keys not found, payment features will be disabled');
}

// Create Razorpay Order
router.post('/create-order', async (req, res) => {
  try {
    console.log('🔐 Payment order creation request received');
    console.log('Request body:', req.body);
    console.log('RAZORPAY_KEY_ID:', !!process.env.RAZORPAY_KEY_ID);
    console.log('RAZORPAY_KEY_SECRET:', !!process.env.RAZORPAY_KEY_SECRET);
    
    // Check if Razorpay is initialized
    if (!razorpay) {
      return res.status(503).json({ 
        error: 'Payment service temporarily unavailable',
        message: 'Razorpay is not configured' 
      });
    }
    
    const { amount, currency = 'INR', receipt, notes } = req.body;

    if (!amount) {
      console.log('❌ Amount is missing');
      return res.status(400).json({ error: 'Amount is required' });
    }

    console.log('✅ Amount received:', amount);

    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes: notes || {},
    };

    console.log('✅ Razorpay options:', options);

    const order = await razorpay.orders.create(options);
    console.log('✅ Razorpay order created successfully:', order.id);
    
    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
      },
    });
  } catch (error) {
    console.error('❌ Razorpay order creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create payment order',
      details: error.message 
    });
  }
});

// Verify Payment Signature
router.post('/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment verification parameters' });
    }

    // Create the signature string
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    
    // Generate expected signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    // Verify signature
    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      res.json({
        success: true,
        message: 'Payment verified successfully',
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      });
    } else {
      res.status(400).json({ 
        error: 'Payment verification failed',
        message: 'Invalid signature' 
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ 
      error: 'Payment verification failed',
      details: error.message 
    });
  }
});

// Get Payment Details
router.get('/payment/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    const payment = await razorpay.payments.fetch(paymentId);
    
    res.json({
      success: true,
      payment: {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        created_at: payment.created_at,
      },
    });
  } catch (error) {
    console.error('Payment fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch payment details',
      details: error.message 
    });
  }
});

module.exports = router;
