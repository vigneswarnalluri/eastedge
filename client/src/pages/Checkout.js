import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useUserPreferences } from '../context/UserPreferencesContext';
import RazorpayPayment from '../components/RazorpayPayment';
import { scrollToTop } from '../utils/scrollToTop';
import api from '../services/api';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const { items: cartItems, clearCart, getTotalPrice, isInitialized } = useCart();
  const { user, isAuthenticated } = useAuth();
  
  // All hooks must be called before any conditional returns
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [error, setError] = useState(null);
  const [cartLoading, setCartLoading] = useState(true);
  const [formData, setFormData] = useState({
    email: user?.email || '',
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    address: user?.address || '',
    city: '',
    state: '',
    zipCode: '',
    phone: user?.phone || '',
    paymentMethod: 'razorpay'
  });
  const [errors, setErrors] = useState({});
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('razorpay');

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { 
          message: 'Please log in to complete your checkout',
          redirectTo: '/checkout'
        }
      });
      return;
    }
  }, [isAuthenticated, navigate]);

  // Handle cart loading
  useEffect(() => {
    // Check if cart context is initialized
    if (isInitialized) {
      if (cartItems && Array.isArray(cartItems) && cartItems.length > 0) {
        setCartLoading(false);
        console.log('Cart loaded successfully. Cart items:', cartItems);
        console.log('Cart items length:', cartItems.length);
      } else if (cartItems && Array.isArray(cartItems) && cartItems.length === 0) {
        // Cart is loaded but empty
        setCartLoading(false);
        console.log('Cart loaded but empty');
      } else {
        // Cart context initialized but cartItems is undefined/null
        setCartLoading(false);
        console.log('Cart context initialized but cartItems is:', cartItems);
      }
    } else {
      // Cart context not yet initialized, wait
      const timer = setTimeout(() => {
        setCartLoading(false);
        console.log('Cart loading timeout. isInitialized:', isInitialized, 'cartItems:', cartItems);
      }, 1500); // Increased timeout
      
      return () => clearTimeout(timer);
    }
    // Ensure page scrolls to top when component mounts
    scrollToTop();
  }, [cartItems, isInitialized]);

  // Don't render anything if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Show loading state while cart is initializing
  if (cartLoading) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading your cart...</p>
          </div>
        </div>
      </div>
    );
  }

  // Debug cart state
  console.log('Checkout render - isInitialized:', isInitialized);
  console.log('Checkout render - cartItems:', cartItems);
  console.log('Checkout render - cartItems type:', typeof cartItems);
  console.log('Checkout render - cartItems isArray:', Array.isArray(cartItems));
  console.log('Checkout render - cartItems length:', cartItems?.length);
  
  // Add manual cart reload for debugging
  const handleReloadCart = () => {
    console.log('=== MANUAL CART RELOAD ===');
    console.log('Current cart state:', { cartItems, isInitialized });
    console.log('localStorage keys:', Object.keys(localStorage));
    const cartKeys = Object.keys(localStorage).filter(key => key.startsWith('cart_'));
    console.log('Cart keys found:', cartKeys);
    cartKeys.forEach(key => {
      const data = localStorage.getItem(key);
      console.log(`Cart key ${key}:`, data);
    });
  };

  // Function to load the cart with items
  const loadCartWithItems = () => {
    console.log('=== LOADING CART WITH ITEMS ===');
    const cartKeys = Object.keys(localStorage).filter(key => key.startsWith('cart_'));
    
    // Find the cart key that has items
    for (const key of cartKeys) {
      const data = localStorage.getItem(key);
      try {
        const cartData = JSON.parse(data);
        if (cartData.items && cartData.items.length > 0) {
          console.log('Found cart with items:', key, cartData);
          
          // Copy the cart data to the current user's cart key
          const currentCartKey = `cart_${user?._id || 'guest'}`;
          localStorage.setItem(currentCartKey, JSON.stringify(cartData));
          console.log('Copied cart data to:', currentCartKey);
          
          // Force page reload to refresh cart context
          window.location.reload();
          break;
        }
      } catch (error) {
        console.error('Error parsing cart data:', error);
      }
    }
  };

  // Safety check for cart context - only show error if cart is initialized but empty
  if (isInitialized && (!cartItems || cartItems.length === 0)) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="empty-cart">
            <h2>Your cart is empty</h2>
            <p>Add some items to your cart before checking out.</p>
            <div style={{ marginTop: '1rem' }}>
              <button 
                onClick={handleReloadCart} 
                className="btn-secondary"
                style={{ marginRight: '1rem' }}
              >
                Debug Cart
              </button>
              <button 
                onClick={loadCartWithItems} 
                className="btn-secondary"
                style={{ marginRight: '1rem' }}
              >
                Load Cart with Items
              </button>
              <button 
                onClick={() => navigate('/products')} 
                className="btn-primary"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Update selectedPaymentMethod when payment method changes
    if (name === 'paymentMethod') {
      setSelectedPaymentMethod(value);
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.zipCode) newErrors.zipCode = 'ZIP code is required';
    if (!formData.phone) newErrors.phone = 'Phone number is required';

    // COD validation
    if (formData.paymentMethod === 'cod' && getTotalPrice && getTotalPrice() < 500) {
      newErrors.paymentMethod = 'Cash on Delivery is only available for orders above ₹500';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Safety check for cart items
    if (!cartItems || cartItems.length === 0) {
      setErrors({ submit: 'No items in cart. Please add items before proceeding.' });
      return;
    }
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        items: cartItems,
        shipping: formData,
        total: formData.paymentMethod === 'cod' ? getTotalPrice() + 50 : getTotalPrice(),
        paymentMethod: formData.paymentMethod,
        codCharges: formData.paymentMethod === 'cod' ? 50 : 0
      };

      console.log('=== COD ORDER SUBMISSION DEBUG ===');
      console.log('Payment method:', formData.paymentMethod);
      console.log('Order data being sent:', orderData);
      console.log('Cart total:', getTotalPrice());
      console.log('COD total:', formData.paymentMethod === 'cod' ? getTotalPrice() + 50 : getTotalPrice());
      
      // Debug cart items structure
      console.log('=== CART ITEMS DEBUG ===');
      if (cartItems && Array.isArray(cartItems)) {
        cartItems.forEach((item, index) => {
          console.log(`Cart Item ${index + 1}:`, {
            _id: item._id,
            name: item.name,
            selectedSize: item.selectedSize,
            selectedColor: item.selectedColor,
            sku: item.sku,
            variantPrice: item.variantPrice,
            category: item.category,
            categoryName: item.categoryName,
            hasVariants: !!(item.selectedSize || item.selectedColor),
            fullItem: item
          });
        });
      } else {
        console.log('Cart items is not an array:', cartItems);
      }
      console.log('=== END CART ITEMS DEBUG ===');

      const response = await api.post('/api/orders', orderData);

      console.log('COD order successful:', response.data);
        clearCart();
        setOrderPlaced(true);

    } catch (error) {
      console.error('Order error:', error);
      setErrors({ submit: 'Failed to place order. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (!cartItems || cartItems.length === 0 && !orderPlaced) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="empty-cart">
            <h2>Your cart is empty</h2>
            <p>Add some items to your cart before checking out.</p>
            <button 
              onClick={() => navigate('/products')} 
              className="btn-primary"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="order-success">
            <div className="success-icon">✓</div>
            <h2>Order Placed Successfully!</h2>
            <p>Thank you for your purchase. You will receive a confirmation email shortly.</p>
            {selectedPaymentMethod === 'cod' && (
              <div className="cod-success-info">
                <p>💵 <strong>Cash on Delivery Order</strong></p>
                <p>Pay ₹{((getTotalPrice() || 0) + 50).toFixed(2)} when you receive your order.</p>
                <p>Our delivery team will contact you to arrange delivery.</p>
              </div>
            )}
            <div className="success-actions">
              <button 
                onClick={() => navigate('/')} 
                className="btn-primary"
              >
                Continue Shopping
              </button>
              <button 
                onClick={() => navigate('/profile')} 
                className="btn-secondary"
              >
                View Orders
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <h1 className="checkout-title">Checkout</h1>
        
        <div className="checkout-content">
          <div className="checkout-form">
            <form onSubmit={handleSubmit}>
              <div className="form-section">
                <h3>Contact Information</h3>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`form-input ${errors.email ? 'error' : ''}`}
                    placeholder="Enter your email"
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>
              </div>

              <div className="form-section">
                <h3>Shipping Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`form-input ${errors.firstName ? 'error' : ''}`}
                      placeholder="First name"
                    />
                    {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`form-input ${errors.lastName ? 'error' : ''}`}
                      placeholder="Last name"
                    />
                    {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={`form-input ${errors.address ? 'error' : ''}`}
                    placeholder="Street address"
                  />
                  {errors.address && <span className="error-message">{errors.address}</span>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={`form-input ${errors.city ? 'error' : ''}`}
                      placeholder="City"
                    />
                    {errors.city && <span className="error-message">{errors.city}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className={`form-input ${errors.state ? 'error' : ''}`}
                      placeholder="State"
                    />
                    {errors.state && <span className="error-message">{errors.state}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">ZIP Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      className={`form-input ${errors.zipCode ? 'error' : ''}`}
                      placeholder="ZIP"
                    />
                    {errors.zipCode && <span className="error-message">{errors.zipCode}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`form-input ${errors.phone ? 'error' : ''}`}
                    placeholder="Phone number"
                  />
                  {errors.phone && <span className="error-message">{errors.phone}</span>}
                </div>
              </div>

              <div className="form-section">
                <h3>Payment Method</h3>
                <div className="payment-options">
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="razorpay"
                      checked={formData.paymentMethod === 'razorpay'}
                      onChange={handleChange}
                    />
                    <span>Razorpay (Recommended)</span>
                  </label>
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={handleChange}
                    />
                    <span>Cash on Delivery (COD)</span>
                  </label>
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={formData.paymentMethod === 'card'}
                      onChange={handleChange}
                    />
                    <span>Credit/Debit Card</span>
                  </label>
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paypal"
                      checked={formData.paymentMethod === 'paypal'}
                      onChange={handleChange}
                    />
                    <span>PayPal</span>
                  </label>
                </div>
                {errors.paymentMethod && (
                  <span className="error-message">{errors.paymentMethod}</span>
                )}
              </div>

              {errors.submit && (
                <div className="error-message submit-error">{errors.submit}</div>
              )}

              {formData.paymentMethod === 'razorpay' ? (
                <RazorpayPayment
                  amount={getTotalPrice() || 0}
                  orderData={{
                    items: cartItems || [],
                    shipping: formData,
                    total: getTotalPrice() || 0
                  }}
                  onSuccess={(paymentResponse) => {
                    console.log('Payment successful:', paymentResponse);
                    clearCart();
                    setOrderPlaced(true);
                  }}
                  onFailure={(error) => {
                    console.error('Payment failed:', error);
                    setErrors({ submit: 'Payment failed. Please try again.' });
                  }}
                />
              ) : formData.paymentMethod === 'cod' ? (
                <div className="cod-payment-section">
                  <div className="cod-info">
                    <p>💵 Pay when you receive your order</p>
                    <p>Cash on delivery charges: ₹50</p>
                    <p>Available for orders above ₹500</p>
                    <p>Not available for international shipping</p>
                  </div>
                  <button 
                    type="submit" 
                    className="btn-primary checkout-submit-btn cod-btn"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : `Place COD Order - ₹${((getTotalPrice() || 0) + 50).toFixed(2)}`}
                  </button>
                </div>
              ) : (
                <button 
                  type="submit" 
                  className="btn-primary checkout-submit-btn"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : `Place Order - ₹${(getTotalPrice() || 0).toFixed(2)}`}
                </button>
              )}
            </form>
          </div>

          <div className="order-summary">
            <h3>Order Summary</h3>
            <div className="order-items">
              {cartItems && cartItems.map(item => (
                <div key={`${item.id}-${item.selectedSize}`} className="order-item">
                  <img src={item.image} alt={item.name} className="order-item-image" />
                  <div className="order-item-details">
                    <h4>{item.name}</h4>
                    {item.selectedSize && <p>Size: {item.selectedSize}</p>}
                    <p>Qty: {item.quantity}</p>
                  </div>
                  <div className="order-item-price">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="order-totals">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>₹{(getTotalPrice() || 0).toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>Shipping:</span>
                <span>Free</span>
              </div>
              {formData.paymentMethod === 'cod' && (
                <div className="total-row">
                  <span>COD Charges:</span>
                  <span>₹50.00</span>
                </div>
              )}
              <div className="total-row total-final">
                <span>Total:</span>
                <span>₹{formData.paymentMethod === 'cod' ? ((getTotalPrice() || 0) + 50).toFixed(2) : (getTotalPrice() || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
