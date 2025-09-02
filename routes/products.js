const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');
const auth = require('../middleware/auth');
const sampleProducts = require('../data/sampleProducts');

// Get all products
router.get('/', async (req, res) => {
  try {
    const { category, featured, newArrival, trending, search, limit, page = 1, sort = 'createdAt' } = req.query;
    
    // Build filter object
    let filter = {};
    
    if (category) {
      filter.category = category;
    }
    if (featured) {
      filter.featured = featured === 'true';
    }
    if (newArrival) {
      filter.newArrival = newArrival === 'true';
    }
    if (trending) {
      filter.trending = trending === 'true';
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Pagination
    const pageSize = limit ? parseInt(limit) : 12;
    const skip = (page - 1) * pageSize;

    // Build sort object
    let sortObj = {};
    if (sort === 'price') sortObj.price = 1;
    else if (sort === 'price-desc') sortObj.price = -1;
    else if (sort === 'name') sortObj.name = 1;
    else if (sort === 'rating') sortObj.rating = -1;
    else sortObj.createdAt = -1;

    const products = await Product.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(pageSize);

    const total = await Product.countDocuments(filter);

    res.json({
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / pageSize),
        totalProducts: total,
        hasNext: skip + pageSize < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate({
        path: 'reviews',
        populate: {
          path: 'user',
          select: 'name'
        }
      });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create product (Admin only)
router.post('/', async (req, res) => {
  try {
    const product = new Product(req.body);
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update product (Admin only)
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete product (Admin only)
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Note: Product reviews are now handled through the /api/reviews endpoint
// which includes admin approval functionality

// Clear database (for testing)
router.delete('/clear', async (req, res) => {
  try {
    await Product.deleteMany({});
    await Category.deleteMany({});
    res.json({ message: 'Database cleared successfully' });
  } catch (error) {
    console.error('❌ Clear error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Seed database with sample data
router.post('/seed', async (req, res) => {
  try {
    // Check if products already exist
    const existingProducts = await Product.countDocuments();
    if (existingProducts > 0) {
      return res.status(400).json({ message: 'Database already seeded' });
    }

    // Create categories first
    const categories = [
      { name: 'Furniture', description: 'Home and office furniture', image: '/homegoods.png' },
      { name: 'Apparel', description: 'Clothing and accessories', image: '/apparel.webp' },
      { name: 'Electronics', description: 'Electronic devices and accessories', image: '/man-1281562.jpg' }
    ];

    const createdCategories = await Category.insertMany(categories);
    console.log('✅ Categories created:', createdCategories.length);

    // Create a map of category names to IDs
    const categoryMap = {};
    createdCategories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });

    // Add category IDs to sample products
    const productsWithCategories = sampleProducts.map(product => ({
      ...product,
      category: categoryMap[product.categoryName]
    }));

    // Insert products
    const createdProducts = await Product.insertMany(productsWithCategories);
    console.log('✅ Products created:', createdProducts.length);

    res.status(201).json({ 
      message: 'Database seeded successfully',
      categories: createdCategories.length,
      products: createdProducts.length
    });
  } catch (error) {
    console.error('❌ Seeding error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
