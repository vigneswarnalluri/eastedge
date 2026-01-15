// Shipping Calculator Utility
// Implements free shipping threshold logic

/**
 * Calculate shipping cost based on order total and settings
 * @param {number} orderTotal - Total order amount (base amount + GST)
 * @param {Object} shippingSettings - Shipping settings from database
 * @returns {Object} Shipping calculation result
 */
const calculateShipping = (orderTotal, shippingSettings) => {
  if (!shippingSettings) {
    return {
      shippingCost: 0,
      isFreeShipping: true,
      reason: 'No shipping settings found'
    };
  }

  const {
    freeShippingThreshold = 999,
    forcePaidShipping = false,
    defaultShippingCost = 0
  } = shippingSettings;

  // If force paid shipping is enabled, always charge shipping
  if (forcePaidShipping) {
    return {
      shippingCost: defaultShippingCost,
      isFreeShipping: false,
      reason: 'Force paid shipping enabled'
    };
  }

  // Check if order qualifies for free shipping
  if (orderTotal >= freeShippingThreshold) {
    return {
      shippingCost: 0,
      isFreeShipping: true,
      reason: `Order total (₹${orderTotal}) meets free shipping threshold (₹${freeShippingThreshold})`
    };
  }

  // Order doesn't qualify for free shipping
  return {
    shippingCost: defaultShippingCost,
    isFreeShipping: false,
    reason: `Order total (₹${orderTotal}) below free shipping threshold (₹${freeShippingThreshold})`
  };
};

/**
 * Calculate shipping for cart items
 * @param {Array} cartItems - Array of cart items
 * @param {Object} shippingSettings - Shipping settings from database
 * @returns {Object} Complete shipping calculation
 */
const calculateCartShipping = (cartItems, shippingSettings) => {
  if (!cartItems || cartItems.length === 0) {
    return calculateShipping(0, shippingSettings);
  }

  // Calculate total from cart items
  const cartTotal = cartItems.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);

  return calculateShipping(cartTotal, shippingSettings);
};

module.exports = {
  calculateShipping,
  calculateCartShipping
};
