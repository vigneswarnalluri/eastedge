const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

// Get reviews for a specific product (PUBLIC)
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    
    const reviews = await Review.find({ 
      product: productId, 
      status: 'approved' // Only show approved reviews
    })
    .populate('user', 'name')
    .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      reviews
    });
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch reviews' 
    });
  }
});

// Submit a new review (PROTECTED)
router.post('/', auth, async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    
    if (!productId || !rating || !comment) {
      return res.status(400).json({ 
        success: false, 
        message: 'Product ID, rating, and comment are required' 
      });
    }
    
    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      product: productId,
      user: req.user._id
    });
    
    if (existingReview) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already reviewed this product' 
      });
    }
    
    // Create new review
    const review = new Review({
      product: productId,
      user: req.user._id,
      name: req.user.name,
      rating: parseInt(rating),
      comment: comment.trim(),
      status: 'pending' // Default to pending for admin approval
    });
    
    await review.save();
    
    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit review' 
    });
  }
});

// Migrate existing reviews from Product model to Review model (ADMIN ONLY)
router.post('/admin/migrate', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }

    console.log('🔄 Starting review migration...');

    // Get all products with reviews
    const products = await Product.find({ 'reviews.0': { $exists: true } });
    console.log(`📦 Found ${products.length} products with reviews`);

    let migratedCount = 0;
    let errorCount = 0;

    for (const product of products) {
      if (product.reviews && product.reviews.length > 0) {
        for (const review of product.reviews) {
          try {
            // Check if review already exists
            const existingReview = await Review.findOne({
              product: product._id,
              user: review.user,
              comment: review.comment,
              rating: review.rating
            });

            if (!existingReview) {
              // Create new review
              await Review.create({
                product: product._id,
                user: review.user,
                name: review.name,
                rating: review.rating,
                comment: review.comment,
                status: 'approved', // Default to approved for existing reviews
                createdAt: review.createdAt || new Date()
              });
              migratedCount++;
            }
          } catch (error) {
            console.error(`❌ Error migrating review for product ${product._id}:`, error);
            errorCount++;
          }
        }
      }
    }

    console.log(`✅ Migration completed: ${migratedCount} reviews migrated, ${errorCount} errors`);

    res.json({
      success: true,
      message: `Migration completed successfully! ${migratedCount} reviews migrated.`,
      migratedCount,
      errorCount
    });
  } catch (error) {
    console.error('❌ Migration error:', error);
    res.status(500).json({ success: false, message: 'Migration failed' });
  }
});

// Get all reviews (ADMIN ONLY)
router.get('/admin', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }

    const { page = 1, limit = 10, status = 'all', search = '' } = req.query;
    const skip = (page - 1) * limit;

    // Build search query
    let searchQuery = {};
    if (status && status !== 'all') {
      searchQuery.status = status;
    }

    if (search) {
      searchQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { comment: { $regex: search, $options: 'i' } }
      ];
    }

    // Get reviews with pagination and populate product and user info
    const reviews = await Review.find(searchQuery)
      .populate('product', 'name image')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalReviews = await Review.countDocuments(searchQuery);

    // Get review analytics
    const analytics = await Review.aggregate([
      { $match: searchQuery },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          pendingReviews: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          approvedReviews: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          rejectedReviews: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          },
          averageRating: { $avg: '$rating' }
        }
      }
    ]);

    res.json({
      success: true,
      reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalReviews / limit),
        totalReviews,
        hasNextPage: page * limit < totalReviews,
        hasPrevPage: page > 1
      },
      analytics: analytics[0] || {
        totalReviews: 0,
        pendingReviews: 0,
        approvedReviews: 0,
        rejectedReviews: 0,
        averageRating: 0
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
  }
});

// Reply to a review (ADMIN ONLY)
router.post('/admin/:id/reply', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }

    const { id } = req.params;
    const { reply } = req.body;

    if (!reply || reply.trim() === '') {
      return res.status(400).json({ success: false, message: 'Reply content is required' });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    review.adminReply = reply.trim();
    review.adminReplyDate = new Date();
    await review.save();

    res.json({
      success: true,
      message: 'Reply added successfully',
      review
    });
  } catch (error) {
    console.error('Error replying to review:', error);
    res.status(500).json({ success: false, message: 'Failed to add reply' });
  }
});

// Delete a review (ADMIN ONLY)
router.delete('/admin/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }

    const { id } = req.params;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Delete the review
    await Review.findByIdAndDelete(id);

    // Update product rating based on remaining approved reviews
    await updateProductRating(review.product);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ success: false, message: 'Failed to delete review' });
  }
});

// Helper function to update product rating based on approved reviews
const updateProductRating = async (productId) => {
  try {
    // Get all approved reviews for this product
    const approvedReviews = await Review.find({
      product: productId,
      status: 'approved'
    });

    const product = await Product.findById(productId);
    if (!product) {
      console.error('Product not found for rating update:', productId);
      return;
    }

    if (approvedReviews.length > 0) {
      // Calculate average rating from approved reviews only
      const totalRating = approvedReviews.reduce((sum, review) => sum + review.rating, 0);
      product.rating = totalRating / approvedReviews.length;
      product.numReviews = approvedReviews.length;
    } else {
      // No approved reviews
      product.rating = 0;
      product.numReviews = 0;
    }

    await product.save();
    console.log(`✅ Updated product ${productId} rating: ${product.rating} (${product.numReviews} reviews)`);
  } catch (error) {
    console.error('Error updating product rating:', error);
  }
};

// Update review status (ADMIN ONLY)
router.put('/admin/:id/status', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const oldStatus = review.status;
    review.status = status;
    await review.save();

    // Update product rating when status changes to/from approved
    if (oldStatus !== status && (status === 'approved' || oldStatus === 'approved')) {
      await updateProductRating(review.product);
    }

    res.json({
      success: true,
      message: 'Review status updated successfully',
      review
    });
  } catch (error) {
    console.error('Error updating review status:', error);
    res.status(500).json({ success: false, message: 'Failed to update review status' });
  }
});

// Recalculate all product ratings based on approved reviews (ADMIN ONLY)
router.post('/admin/recalculate-ratings', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }

    console.log('🔄 Starting product rating recalculation...');

    // Get all products
    const products = await Product.find({});
    let updatedCount = 0;
    let errorCount = 0;

    for (const product of products) {
      try {
        await updateProductRating(product._id);
        updatedCount++;
      } catch (error) {
        console.error(`❌ Error updating rating for product ${product._id}:`, error);
        errorCount++;
      }
    }

    console.log(`✅ Rating recalculation completed: ${updatedCount} products updated, ${errorCount} errors`);

    res.json({
      success: true,
      message: `Product ratings recalculated successfully! ${updatedCount} products updated.`,
      updatedCount,
      errorCount
    });
  } catch (error) {
    console.error('❌ Rating recalculation error:', error);
    res.status(500).json({ success: false, message: 'Failed to recalculate ratings' });
  }
});

module.exports = router; 