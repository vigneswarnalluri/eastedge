import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag, FiArrowLeft, FiCreditCard } from 'react-icons/fi';
import './Cart.css';

const Cart = () => {
  const { items, total, itemCount, uniqueItemCount, updateQuantity, removeFromCart, clearCart } = useCart();

  // Create unique key for cart operations
  const createItemKey = (item) => {
    const size = item.selectedSize || '';
    const color = item.selectedColor || '';
    return `${item._id}_${size}_${color}`;
  };

  const handleQuantityChange = (item, newQuantity) => {
    if (newQuantity > 0) {
      updateQuantity(createItemKey(item), newQuantity);
    }
  };

  const handleRemoveItem = (item) => {
    removeFromCart(createItemKey(item));
  };

  // Debug function to show cart state
  const debugCart = () => {
    console.log('=== CART DEBUG ===');
    console.log('Cart items:', items);
    console.log('Total:', total);
    console.log('Item count (total quantity):', itemCount);
    console.log('Unique item count:', uniqueItemCount);
    items.forEach((item, index) => {
      console.log(`Item ${index}:`, {
        id: item._id,
        name: item.name,
        size: item.selectedSize,
        color: item.selectedColor,
        quantity: item.quantity,
        key: createItemKey(item)
      });
    });
    console.log('=== END CART DEBUG ===');
  };

  if (uniqueItemCount === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="empty-cart">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="empty-cart-content"
            >
              <div className="empty-cart-icon">
                <FiShoppingBag />
              </div>
              <h2>Your cart is empty</h2>
              <p>Looks like you haven't added any items to your cart yet.</p>
              <Link to="/products" className="btn btn-primary start-shopping-btn">
                <FiArrowLeft /> Start Shopping
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <div className="cart-header">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1>Shopping Cart</h1>
            <p>{uniqueItemCount} item{uniqueItemCount !== 1 ? 's' : ''} in your cart ({itemCount} total quantity)</p>
          </motion.div>
        </div>

        <div className="cart-content">
          <div className="cart-items">
            <AnimatePresence>
              {items.map((item, index) => (
                <motion.div
                  key={item._id}
                  className="cart-item"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="item-image">
                    <Link to={`/products/${item._id}`}>
                      <img src={item.image} alt={item.name} />
                    </Link>
                  </div>
                  
                  <div className="item-details">
                    <h3>
                      <Link to={`/products/${item._id}`}>
                        {item.name}
                      </Link>
                    </h3>
                    
                    {/* Show variant price if available, otherwise show base price */}
                    <p className="item-price">
                      ₹{(item.variantPrice || item.price).toLocaleString()}
                      {/* Always show original price when variant is selected */}
                      {item.selectedSize && item.selectedColor && (
                        <span className="original-price-strike">
                          <del>₹{item.price.toLocaleString()}</del>
                        </span>
                      )}
                    </p>
                    
                    {/* Show price difference when variant is selected */}
                    {item.selectedSize && item.selectedColor && item.variantPrice && item.variantPrice !== item.price && (
                      <div className="price-difference">
                        {item.variantPrice > item.price ? (
                          <span className="price-increase">
                            +₹{(item.variantPrice - item.price).toLocaleString()} extra
                          </span>
                        ) : (
                          <span className="price-savings">
                            -₹{(item.price - item.variantPrice).toLocaleString()} savings
                          </span>
                        )}
                      </div>
                    )}
                    
                    {/* Enhanced variant information display */}
                    {(item.selectedSize || item.selectedColor) ? (
                      <div className="item-options">
                        {item.selectedSize && (
                          <span className="option-tag size-tag">
                            <strong>Size:</strong> {item.selectedSize}
                          </span>
                        )}
                        {item.selectedColor && (
                          <span className="option-tag color-tag">
                            <strong>Color:</strong> {item.selectedColor}
                          </span>
                        )}
                        
                        {/* Change Variant Button */}
                        <button 
                          className="change-variant-btn"
                          onClick={() => {
                            // Navigate to product detail page to change variant
                            window.location.href = `/products/${item._id}`;
                          }}
                          title="Change variant selection"
                        >
                          Change Variant
                        </button>
                      </div>
                    ) : (
                      /* Show note for products that might have variants but no selection */
                      <div className="variant-note">
                        <small>
                          💡 This product may have size/color options. 
                          <Link to={`/products/${item._id}`} className="select-variant-link">
                            Click here to select variants
                          </Link>
                        </small>
                      </div>
                    )}
                    
                    {/* Show product category if available */}
                    {item.category && (
                      <p className="item-category">
                        <small>Category: {item.category}</small>
                      </p>
                    )}
                  </div>

                  <div className="item-quantity">
                    <button
                      onClick={() => handleQuantityChange(item, item.quantity - 1)}
                      className="quantity-btn minus-btn"
                      disabled={item.quantity <= 1}
                      title="Decrease quantity"
                    >
                      <FiMinus />
                    </button>
                    <span className="quantity-value">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item, item.quantity + 1)}
                      className="quantity-btn plus-btn"
                      title="Increase quantity"
                    >
                      <FiPlus />
                    </button>
                  </div>

                  <div className="item-total">
                    <p className="total-amount">
                      ₹{((item.variantPrice || item.price) * item.quantity).toLocaleString()}
                    </p>
                  </div>

                  <button
                    onClick={() => handleRemoveItem(item)}
                    className="remove-btn"
                    title="Remove item"
                  >
                    <FiTrash2 />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="cart-summary">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="summary-header">
                <h3><FiCreditCard /> Order Summary</h3>
              </div>
              
              <div className="summary-details">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span className="free-shipping">Free</span>
                </div>
                
                {/* Show total price difference when variants are selected */}
                {(() => {
                  const itemsWithVariants = items.filter(item => item.selectedSize && item.selectedColor && item.variantPrice);
                  if (itemsWithVariants.length > 0) {
                    const totalOriginalPrice = itemsWithVariants.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                    const totalVariantPrice = itemsWithVariants.reduce((sum, item) => sum + ((item.variantPrice || item.price) * item.quantity), 0);
                    const priceDifference = totalVariantPrice - totalOriginalPrice;
                    
                    if (priceDifference !== 0) {
                      return (
                        <div className="summary-row price-difference-row">
                          <span>Variant Price Adjustment</span>
                          <span className={priceDifference > 0 ? 'price-increase-summary' : 'price-savings-summary'}>
                            {priceDifference > 0 ? '+' : ''}₹{priceDifference.toLocaleString()}
                          </span>
                        </div>
                      );
                    }
                  }
                  return null;
                })()}
                
                <div className="summary-row total">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
                
                {/* Variant information summary */}
                <div className="summary-variants">
                  <div className="summary-row variant-info">
                    <span>Items with variants</span>
                    <span>{items.filter(item => item.selectedSize || item.selectedColor).length}</span>
                  </div>
                  <div className="summary-row variant-info">
                    <span>Total variants</span>
                    <span>{items.reduce((sum, item) => sum + (item.selectedSize && item.selectedColor ? 1 : 0), 0)}</span>
                  </div>
                </div>
              </div>

              <div className="summary-actions">
                <Link to="/checkout" className="btn btn-primary checkout-btn">
                  <FiCreditCard /> Proceed to Checkout
                </Link>
                <button onClick={clearCart} className="btn btn-outline clear-cart-btn">
                  <FiTrash2 /> Clear Cart
                </button>
              </div>

              <div className="continue-shopping">
                <Link to="/products" className="continue-link">
                  <FiArrowLeft /> Continue Shopping
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
