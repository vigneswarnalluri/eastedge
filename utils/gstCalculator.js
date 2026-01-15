// Backend GST Calculator Utility
// Implements exclusive tax pricing model

/**
 * GST Calculation Rules:
 * - 5% GST if base amount ≤ ₹999
 * - 12% GST if base amount > ₹999
 * - All prices are base amounts, GST is added on top
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
 * Calculate GST breakdown from base amount (exclusive tax model)
 * @param {number} baseAmount - Base amount excluding tax
 * @returns {object} GST breakdown
 */
const calculateGSTBreakdown = (baseAmount) => {
  if (!baseAmount || baseAmount <= 0) {
    return {
      totalAmount: 0,
      baseAmount: 0,
      gstAmount: 0,
      gstRate: 0,
      gstPercentage: 0
    };
  }

  const gstRate = getGSTRate(baseAmount);
  const gstPercentage = gstRate * 100;
  
  // Calculate GST amount and total (exclusive tax model)
  // Formula: GST Amount = Base Amount * GST Rate
  // Formula: Total Amount = Base Amount + GST Amount
  const gstAmount = baseAmount * gstRate;
  const totalAmount = baseAmount + gstAmount;

  return {
    totalAmount: Math.round(totalAmount * 100) / 100,
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

  // Calculate base amount from cart items (prices are base amounts, excluding tax)
  const baseAmount = cartItems.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);

  return calculateGSTBreakdown(baseAmount);
};

module.exports = {
  GST_RATES,
  getGSTRate,
  calculateGSTBreakdown,
  calculateCartGST
};
