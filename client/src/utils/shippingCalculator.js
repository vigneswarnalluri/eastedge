// Shipping Calculator Utility
// Implements free shipping threshold logic

/**
 * Calculate shipping cost based on order total and settings
 * @param {number} orderTotal - Total order amount (base amount + GST)
 * @param {Object} shippingSettings - Shipping settings from database
 * @returns {Object} Shipping calculation result
 */
export const calculateShipping = (orderTotal, shippingSettings) => {
  console.log('🔍 Shipping Calculator Debug:');
  console.log('  - Order Total:', orderTotal);
  console.log('  - Shipping Settings:', shippingSettings);
  
  if (!shippingSettings) {
    console.log('  - Result: No settings found, returning free shipping');
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

  console.log('  - Free Shipping Threshold:', freeShippingThreshold);
  console.log('  - Force Paid Shipping:', forcePaidShipping);
  console.log('  - Default Shipping Cost:', defaultShippingCost);

  // If force paid shipping is enabled, always charge shipping
  if (forcePaidShipping) {
    console.log('  - Result: Force paid shipping enabled, charging:', defaultShippingCost);
    return {
      shippingCost: defaultShippingCost,
      isFreeShipping: false,
      reason: 'Force paid shipping enabled'
    };
  }

  // Check if order qualifies for free shipping
  if (orderTotal >= freeShippingThreshold) {
    console.log('  - Result: Order qualifies for free shipping');
    return {
      shippingCost: 0,
      isFreeShipping: true,
      reason: `Order total (₹${orderTotal}) meets free shipping threshold (₹${freeShippingThreshold})`
    };
  }

  // Order doesn't qualify for free shipping
  console.log('  - Result: Order does not qualify for free shipping, charging:', defaultShippingCost);
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
export const calculateCartShipping = (cartItems, shippingSettings) => {
  if (!cartItems || cartItems.length === 0) {
    return calculateShipping(0, shippingSettings);
  }

  // Calculate total from cart items
  const cartTotal = cartItems.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);

  return calculateShipping(cartTotal, shippingSettings);
};

/**
 * Format shipping cost for display
 * @param {number} shippingCost 
 * @returns {string}
 */
export const formatShippingCost = (shippingCost) => {
  if (shippingCost === 0) {
    return 'Free';
  }
  return `₹${shippingCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
