const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  general: {
    storeName: { type: String, default: 'EastEdge' },
    contactEmail: { type: String, default: 'info@eastedge.in' },
    phoneNumber: { type: String, default: '+91 6302244544' },
    logo: { type: String, default: '' },
    logoPreview: { type: String, default: '' }
  },
  store: {
    businessAddress: { type: String, default: 'Malkajgiri, Hyderabad, Telangana, India' },
    taxRate: { type: Number, default: 18 },
    currency: { type: String, default: '₹' },
    timezone: { type: String, default: 'Asia/Kolkata' }
  },
  shipping: {
    freeShippingThreshold: { type: Number, default: 1000 },
    forcePaidShipping: { type: Boolean, default: false },
    defaultShippingCost: { type: Number, default: 100 }
  },
  payment: {
    razorpay: { type: Boolean, default: true },
    cod: { type: Boolean, default: true },
    cashfree: { type: Boolean, default: false }
  },
  email: {
    orderConfirmation: { type: Boolean, default: true },
    adminNotification: { type: Boolean, default: true },
    shippingUpdates: { type: Boolean, default: true },
    smtpHost: { type: String, default: '' },
    smtpPort: { type: String, default: '' },
    smtpEmail: { type: String, default: '' },
    smtpPassword: { type: String, default: '' }
  },
  admin: {
    users: [{
      id: { type: String, required: true },
      name: { type: String, required: true },
      email: { type: String, required: true },
      role: { type: String, default: 'Editor' }
    }]
  },
  appearance: {
    primaryColor: { type: String, default: '#059669' },
    secondaryColor: { type: String, default: '#1a1a1a' },
    themeMode: { type: String, default: 'dark' },
    fontFamily: { type: String, default: 'Inter' },
    borderRadius: { type: String, default: '8' }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Settings', settingsSchema); 