const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  // Basic Information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  
  // Customer Profile
  profile: {
    avatar: String,
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer-not-to-say']
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    },
    preferences: {
      newsletter: { type: Boolean, default: true },
      marketing: { type: Boolean, default: false },
      language: { type: String, default: 'en' },
      currency: { type: String, default: 'INR' }
    }
  },
  
  // Order Analytics
  orderStats: {
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    averageOrderValue: { type: Number, default: 0 },
    lastOrderDate: Date,
    firstOrderDate: Date,
    favoriteCategories: [{
      category: { type: String },
      count: { type: Number, default: 0 }
    }],
    orderStatusBreakdown: {
      pending: { type: Number, default: 0 },
      processing: { type: Number, default: 0 },
      shipped: { type: Number, default: 0 },
      delivered: { type: Number, default: 0 },
      cancelled: { type: Number, default: 0 }
    }
  },
  
  // Customer Behavior
  behavior: {
    totalVisits: { type: Number, default: 0 },
    lastVisit: Date,
    averageSessionDuration: { type: Number, default: 0 },
    cartAbandonmentRate: { type: Number, default: 0 },
    returnRate: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 }
  },
  
  // Customer Status
  status: {
    isActive: { type: Boolean, default: true },
    isBlocked: { type: Boolean, default: false },
    blockReason: String,
    blockedAt: Date,
    blockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    tags: [String], // VIP, New Customer, Loyal Customer, etc.
    notes: String
  },
  
  // Communication History
  communications: [{
    type: { type: String, enum: ['email', 'sms', 'push', 'support'] },
    subject: String,
    content: String,
    sentAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['sent', 'delivered', 'read', 'failed'] },
    response: String
  }],
  
  // Support Tickets
  supportTickets: [{
    ticketId: String,
    subject: String,
    description: String,
    status: { type: String, enum: ['open', 'in-progress', 'resolved', 'closed'] },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'] },
    createdAt: { type: Date, default: Date.now },
    resolvedAt: Date,
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Loyalty & Rewards
  loyalty: {
    points: { type: Number, default: 0 },
    tier: { type: String, enum: ['bronze', 'silver', 'gold', 'platinum'], default: 'bronze' },
    pointsEarned: { type: Number, default: 0 },
    pointsRedeemed: { type: Number, default: 0 },
    referralCode: String,
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer'
    },
    referrals: [{
      customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
      referredAt: { type: Date, default: Date.now },
      bonusEarned: { type: Number, default: 0 }
    }]
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Indexes for better query performance
customerSchema.index({ userId: 1 });
customerSchema.index({ email: 1 });
customerSchema.index({ 'status.isBlocked': 1 });
customerSchema.index({ 'orderStats.lastOrderDate': -1 });
customerSchema.index({ 'loyalty.tier': 1 });
customerSchema.index({ createdAt: -1 });

// Virtual for customer age
customerSchema.virtual('age').get(function() {
  if (this.profile.dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(this.profile.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
  return null;
});

// Virtual for customer lifetime value
customerSchema.virtual('lifetimeValue').get(function() {
  return this.orderStats.totalSpent || 0;
});

// Virtual for customer since
customerSchema.virtual('customerSince').get(function() {
  return this.createdAt;
});

// Method to update order statistics
customerSchema.methods.updateOrderStats = function(orderData) {
  const { totalPrice, status, category } = orderData;
  
  // Update basic stats
  this.orderStats.totalOrders += 1;
  this.orderStats.totalSpent += totalPrice;
  this.orderStats.averageOrderValue = this.orderStats.totalSpent / this.orderStats.totalOrders;
  
  // Update dates
  if (!this.orderStats.firstOrderDate) {
    this.orderStats.firstOrderDate = new Date();
  }
  this.orderStats.lastOrderDate = new Date();
  
  // Update status breakdown
  if (this.orderStats.orderStatusBreakdown[status.toLowerCase()] !== undefined) {
    this.orderStats.orderStatusBreakdown[status.toLowerCase()] += 1;
  }
  
  // Update favorite categories
  if (category) {
    const existingCategory = this.orderStats.favoriteCategories.find(cat => cat.category === category);
    if (existingCategory) {
      existingCategory.count += 1;
    } else {
      this.orderStats.favoriteCategories.push({ category, count: 1 });
    }
    
    // Sort by count and keep top 5
    this.orderStats.favoriteCategories.sort((a, b) => b.count - a.count);
    this.orderStats.favoriteCategories = this.orderStats.favoriteCategories.slice(0, 5);
  }
  
  return this.save();
};

// Method to calculate loyalty tier
customerSchema.methods.calculateLoyaltyTier = function() {
  const totalSpent = this.orderStats.totalSpent;
  
  if (totalSpent >= 100000) return 'platinum';
  if (totalSpent >= 50000) return 'gold';
  if (totalSpent >= 25000) return 'silver';
  return 'bronze';
};

// Method to add communication
customerSchema.methods.addCommunication = function(commData) {
  this.communications.push(commData);
  return this.save();
};

// Method to create support ticket
customerSchema.methods.createSupportTicket = function(ticketData) {
  this.supportTickets.push(ticketData);
  return this.save();
};

// Pre-save middleware to update loyalty tier
customerSchema.pre('save', function(next) {
  if (this.isModified('orderStats.totalSpent')) {
    this.loyalty.tier = this.calculateLoyaltyTier();
  }
  next();
});

module.exports = mongoose.model('Customer', customerSchema); 