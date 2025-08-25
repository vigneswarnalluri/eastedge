import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag, FiArrowLeft, FiCreditCard } from 'react-icons/fi';
import './Cart.css';

const Cart = () => {
  const { items, total, itemCount, updateQuantity, removeFromCart, clearCart } = useCart();

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity > 0) {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleRemoveItem = (productId) => {
    removeFromCart(productId);
  };

  if (itemCount === 0) {
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
            <p>{itemCount} item{itemCount !== 1 ? 's' : ''} in your cart</p>
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
                    <p className="item-price">₹{item.price.toLocaleString()}</p>
                  </div>

                  <div className="item-quantity">
                    <button
                      onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                      className="quantity-btn minus-btn"
                      disabled={item.quantity <= 1}
                      title="Decrease quantity"
                    >
                      <FiMinus />
                    </button>
                    <span className="quantity-value">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                      className="quantity-btn plus-btn"
                      title="Increase quantity"
                    >
                      <FiPlus />
                    </button>
                  </div>

                  <div className="item-total">
                    <p className="total-amount">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>

                  <button
                    onClick={() => handleRemoveItem(item._id)}
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
                <div className="summary-row total">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
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
