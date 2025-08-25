const express = require('express');
const router = express.Router();

// Get cart (mock implementation)
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Cart endpoint working',
    note: 'Cart is managed client-side with localStorage'
  });
});

// Add item to cart (mock implementation)
router.post('/add', (req, res) => {
  res.json({
    success: true,
    message: 'Item added to cart',
    note: 'Cart is managed client-side with localStorage'
  });
});

// Remove item from cart (mock implementation)
router.delete('/remove/:id', (req, res) => {
  res.json({
    success: true,
    message: 'Item removed from cart',
    note: 'Cart is managed client-side with localStorage'
  });
});

module.exports = router;
