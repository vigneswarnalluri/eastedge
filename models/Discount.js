const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  value: {
    type: Number,
    required: true,
    min: 0
  },
  minOrderAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  maxDiscount: {
    type: Number,
    min: 0
  },
  maxUses: {
    type: Number,
    min: 0
  },
  currentUses: {
    type: Number,
    default: 0,
    min: 0
  },
  validFrom: {
    type: Date
  },
  validUntil: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    trim: true
  },
  applicableCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  excludedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  userRestrictions: {
    firstTimeOnly: {
      type: Boolean,
      default: false
    },
    minimumOrders: {
      type: Number,
      default: 0
    },
    userGroups: [{
      type: String,
      enum: ['new', 'returning', 'vip', 'all']
    }]
  }
}, {
  timestamps: true
});

// Index for efficient queries
discountSchema.index({ code: 1 });
discountSchema.index({ isActive: 1 });
discountSchema.index({ validUntil: 1 });

// Method to check if discount is valid
discountSchema.methods.isValid = function() {
  const now = new Date();
  
  // Check if active
  if (!this.isActive) return false;
  
  // Check validity period
  if (this.validFrom && now < this.validFrom) return false;
  if (this.validUntil && now > this.validUntil) return false;
  
  // Check usage limits
  if (this.maxUses && this.currentUses >= this.maxUses) return false;
  
  return true;
};

// Method to apply discount to order amount
discountSchema.methods.calculateDiscount = function(orderAmount) {
  if (orderAmount < this.minOrderAmount) return 0;
  
  let discountAmount = 0;
  
  if (this.type === 'percentage') {
    discountAmount = (orderAmount * this.value) / 100;
  } else {
    discountAmount = this.value;
  }
  
  // Apply maximum discount limit if set
  if (this.maxDiscount && discountAmount > this.maxDiscount) {
    discountAmount = this.maxDiscount;
  }
  
  return Math.min(discountAmount, orderAmount);
};

// Method to increment usage
discountSchema.methods.incrementUsage = function() {
  this.currentUses += 1;
  return this.save();
};

module.exports = mongoose.model('Discount', discountSchema); 