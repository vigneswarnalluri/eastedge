// Backend GST Calculator Utility
// Implements inclusive tax pricing model

/**
 * GST Calculation Rules:
 * - 5% GST if cart total (including tax) ≤ ₹999
 * - 12% GST if cart total > ₹999
 * - All prices are inclusive of tax
 */

const GST_RATES = {
  LOW_RATE: 0.05,   // 5%
  HIGH_RATE: 0.12,  // 12%
  THRESHOLD: 999    // ₹999
};

/**
 * Determine GST rate based on total amount
 * @param {number} totalAmount - Total amount including tax
 * @returns {number} GST rate (0.05 or 0.12)
 */
const getGSTRate = (totalAmount) => {
  return totalAmount <= GST_RATES.THRESHOLD ? GST_RATES.LOW_RATE : GST_RATES.HIGH_RATE;
};

/**
 * Calculate GST breakdown from inclusive price
 * @param {number} inclusiveAmount - Total amount including tax
 * @returns {object} GST breakdown
 */
const calculateGSTBreakdown = (inclusiveAmount) => {
  if (!inclusiveAmount || inclusiveAmount <= 0) {
    return {
      totalAmount: 0,
      baseAmount: 0,
      gstAmount: 0,
      gstRate: 0,
      gstPercentage: 0
    };
  }

  const gstRate = getGSTRate(inclusiveAmount);
  const gstPercentage = gstRate * 100;
  
  // Calculate base amount from inclusive price
  // Formula: Base Amount = Inclusive Amount / (1 + GST Rate)
  const baseAmount = inclusiveAmount / (1 + gstRate);
  const gstAmount = inclusiveAmount - baseAmount;

  return {
    totalAmount: inclusiveAmount,
    baseAmount: Math.round(baseAmount * 100) / 100,
    gstAmount: Math.round(gstAmount * 100) / 100,
    gstRate: gstRate,
    gstPercentage: Math.round(gstPercentage)
  };
};

/**
 * Calculate GST for cart items
 * @param {Array} cartItems - Array of cart items
 * @returns {object} Complete GST breakdown
 */
const calculateCartGST = (cartItems) => {
  if (!cartItems || cartItems.length === 0) {
    return calculateGSTBreakdown(0);
  }

  // Calculate total from cart items (prices are already inclusive)
  const cartTotal = cartItems.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);

  return calculateGSTBreakdown(cartTotal);
};

module.exports = {
  GST_RATES,
  getGSTRate,
  calculateGSTBreakdown,
  calculateCartGST
};
