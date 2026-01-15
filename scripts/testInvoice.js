const mongoose = require('mongoose');
const Order = require('../models/Order');
const Settings = require('../models/Settings');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const testInvoice = async () => {
  try {
    console.log('🧪 Testing invoice generation...');
    
    // Get a sample order
    const order = await Order.findOne().populate('user');
    const settings = await Settings.findOne();
    
    if (!order) {
      console.log('❌ No orders found in database');
      return;
    }
    
    if (!settings) {
      console.log('❌ No settings found in database');
      return;
    }
    
    console.log('📋 Sample order found:', {
      id: order._id,
      user: order.user?.email || 'N/A',
      items: order.orderItems?.length || 0,
      total: order.totalPrice
    });
    
    console.log('⚙️ Settings found:', {
      storeName: settings.general?.storeName || 'N/A',
      shippingCost: settings.shipping?.defaultShippingCost || 0
    });
    
    console.log('✅ Invoice generation test data ready!');
    console.log('💡 To test the actual PDF generation, place an order through the frontend.');
    
  } catch (error) {
    console.error('❌ Error testing invoice:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the test
connectDB().then(() => {
  testInvoice();
});

