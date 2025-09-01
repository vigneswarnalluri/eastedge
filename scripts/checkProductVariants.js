const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config({ path: './config.env' });

const connectDB = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const checkProductVariants = async () => {
  await connectDB();

  try {
    console.log('🔍 Checking product variants in database...');
    
    // Find the specific product
    const product = await Product.findById('68b48f3f9c52fac8aee4eb66');
    
    if (product) {
      console.log('\n📦 Product found:');
      console.log(`   Name: ${product.name}`);
      console.log(`   Base Price: ₹${product.price}`);
      console.log(`   Sale Price: ₹${product.salePrice || 'None'}`);
      console.log(`   Sizes: ${JSON.stringify(product.sizes)}`);
      console.log(`   Colors: ${JSON.stringify(product.colors)}`);
      
      console.log('\n🎯 Variants:');
      if (product.variants && product.variants.length > 0) {
        product.variants.forEach((variant, index) => {
          console.log(`   ${index + 1}. Size: ${variant.size}, Color: ${variant.color}, Price: ₹${variant.price}, Stock: ${variant.stock}`);
        });
      } else {
        console.log('   ❌ No variants found!');
      }
      
      // Check specifically for M size variants
      const mVariants = product.variants.filter(v => v.size === 'M');
      console.log('\n🔍 M size variants specifically:');
      if (mVariants.length > 0) {
        mVariants.forEach((variant, index) => {
          console.log(`   ${index + 1}. Size: ${variant.size}, Color: ${variant.color}, Price: ₹${variant.price}, Stock: ${variant.stock}`);
        });
      } else {
        console.log('   ❌ No M size variants found!');
      }
      
    } else {
      console.log('❌ Product not found with that ID');
    }

  } catch (error) {
    console.error('❌ Error checking product variants:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

checkProductVariants();
