const mongoose = require('mongoose');
const Category = require('../models/Category');
require('dotenv').config({ path: './config.env' });

// Categories based on sample products
const categories = [
  {
    name: "Apparel",
    description: "Clothing and fashion items including jackets, jeans, and other wearables",
    image: "/apparel.webp",
    isActive: true,
    parentCategory: null
  },
  {
    name: "Accessories",
    description: "Personal accessories including watches, phones, and other gadgets",
    image: "/accessories.png",
    isActive: true,
    parentCategory: null
  },
  {
    name: "Furniture",
    description: "Home and office furniture including chairs, tables, and other furnishings",
    image: "/homegoods.png",
    isActive: true,
    parentCategory: null
  },
  {
    name: "Electronics",
    description: "Electronic devices and gadgets including headphones and other tech items",
    image: "/man-1281562.jpg",
    isActive: true,
    parentCategory: null
  },
  {
    name: "Home Goods",
    description: "Home decor and household items for daily living",
    image: "/homegoods.png",
    isActive: true,
    parentCategory: null
  }
];

// Subcategories
const subcategories = [
  {
    name: "Outerwear",
    description: "Jackets, coats, and other outer garments",
    image: "/apparel.webp",
    isActive: true,
    parentCategory: "Apparel"
  },
  {
    name: "Bottoms",
    description: "Pants, jeans, and other lower body garments",
    image: "/apparel.webp",
    isActive: true,
    parentCategory: "Apparel"
  },
  {
    name: "Watches",
    description: "Timepieces and wrist accessories",
    image: "/accessories.png",
    isActive: true,
    parentCategory: "Accessories"
  },
  {
    name: "Phones",
    description: "Mobile phones and smartphones",
    image: "/space-shuttle-774_1280.jpg",
    isActive: true,
    parentCategory: "Accessories"
  },
  {
    name: "Seating",
    description: "Chairs, sofas, and other seating furniture",
    image: "/homegoods.png",
    isActive: true,
    parentCategory: "Furniture"
  },
  {
    name: "Tables",
    description: "Tables, desks, and other flat surface furniture",
    image: "/homegoods.png",
    isActive: true,
    parentCategory: "Furniture"
  },
  {
    name: "Audio",
    description: "Headphones, speakers, and other audio equipment",
    image: "/man-1281562.jpg",
    isActive: true,
    parentCategory: "Electronics"
  }
];

const connectDB = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    
    // Use the same connection logic as server.js
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://eastedge:eastedge@cluster0.ab9we9f.mongodb.net/eastedge';
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 30000,
      maxPoolSize: 5,
      minPoolSize: 1,
    });
    
    console.log('✅ MongoDB Connected Successfully!');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  }
};

const populateCategories = async () => {
  try {
    console.log('🗑️  Clearing existing categories...');
    await Category.deleteMany({});
    
    console.log('📝 Creating main categories...');
    const createdCategories = {};
    
    // Create main categories first
    for (const categoryData of categories) {
      const category = new Category(categoryData);
      const savedCategory = await category.save();
      createdCategories[categoryData.name] = savedCategory._id;
      console.log(`✅ Created category: ${categoryData.name}`);
    }
    
    console.log('📝 Creating subcategories...');
    
    // Create subcategories with parent references
    for (const subcategoryData of subcategories) {
      const parentId = createdCategories[subcategoryData.parentCategory];
      if (parentId) {
        const subcategory = new Category({
          ...subcategoryData,
          parentCategory: parentId
        });
        await subcategory.save();
        console.log(`✅ Created subcategory: ${subcategoryData.name} under ${subcategoryData.parentCategory}`);
      } else {
        console.log(`⚠️  Parent category not found for: ${subcategoryData.name}`);
      }
    }
    
    console.log('🎉 Categories populated successfully!');
    
    // Display final results
    const allCategories = await Category.find({}).populate('parentCategory', 'name');
    console.log('\n📊 Final Categories:');
    allCategories.forEach(cat => {
      const parentInfo = cat.parentCategory ? ` (Parent: ${cat.parentCategory.name})` : ' (Main Category)';
      console.log(`  - ${cat.name}${parentInfo}`);
    });
    
  } catch (error) {
    console.error('❌ Error populating categories:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the script
connectDB().then(() => {
  populateCategories();
}); 