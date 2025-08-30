const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  categoryName: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  images: [String],
  sizes: [{
    type: String
  }],
  colors: [{
    name: String,
    hexCode: String,
    inStock: { type: Boolean, default: true }
  }],
  variants: [{
    size: String,
    color: String,
    price: Number,
    stock: Number,
    sku: String
  }],
  inStock: {
    type: Boolean,
    default: true
  },
  stockQuantity: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  newArrival: {
    type: Boolean,
    default: false
  },
  trending: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  numReviews: {
    type: Number,
    default: 0
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: String,
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [String],
  weight: Number,
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  shippingInfo: {
    freeShipping: { type: Boolean, default: false },
    estimatedDays: { type: Number, default: 3 }
  },
  washDetails: {
    washing: { type: String, default: '' },
    drying: { type: String, default: '' },
    ironing: { type: String, default: '' },
    bleaching: { type: String, default: '' },
    dryCleaning: { type: String, default: '' },
    additionalCare: { type: String, default: '' }
  }
}, {
  timestamps: true
});

// Create index for SKU uniqueness
productSchema.index({ sku: 1 }, { unique: true });

module.exports = mongoose.model('Product', productSchema);
