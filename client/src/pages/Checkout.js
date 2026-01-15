import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { useSettings } from '../context/SettingsContext';
import { downloadInvoice } from '../utils/invoiceGenerator';
import RazorpayPayment from '../components/RazorpayPayment';
import { scrollToTop } from '../utils/scrollToTop';
import api from '../services/api';
import { formatCurrency, getGSTRateDescription } from '../utils/gstCalculator';
import { calculateCartShipping, formatShippingCost } from '../utils/shippingCalculator';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const { items: cartItems, clearCart, getTotalPrice, getGSTBreakdown, getTotalWithGST, isInitialized } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { settings, loadSettings } = useSettings();
  
  // All hooks must be called before any conditional returns
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [error, setError] = useState(null);
  const [cartLoading, setCartLoading] = useState(true);
  const [formData, setFormData] = useState({
    email: user?.email || '',
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    address: (typeof user?.address === 'object' ? user?.address?.street || user?.address?.address || '' : user?.address || ''),
    city: (typeof user?.address === 'object' ? user?.address?.city || '' : ''),
    state: (typeof user?.address === 'object' ? user?.address?.state || '' : ''),
    zipCode: (typeof user?.address === 'object' ? user?.address?.zipCode || '' : ''),
    phone: user?.phone || '',
    paymentMethod: 'razorpay'
  });
  const [errors, setErrors] = useState({});
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('razorpay');

  // Discount code state
  const [discountCode, setDiscountCode] = useState('');
  const [discountLoading, setDiscountLoading] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [discountError, setDiscountError] = useState('');

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

  // Debug orderPlaced state changes
  useEffect(() => {
    console.log('🔄 orderPlaced state changed:', orderPlaced);
    if (orderPlaced) {
      console.log('✅ Order success page should now be visible');
      // Scroll to top when showing success page
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [orderPlaced]);

  // Check localStorage for order success on component mount
  useEffect(() => {
    const savedOrderPlaced = localStorage.getItem('orderPlaced');
    if (savedOrderPlaced === 'true') {
      console.log('🔄 Restoring orderPlaced state from localStorage');
      setOrderPlaced(true);
    }
    
    // Cleanup function to clear localStorage when component unmounts
    return () => {
      if (orderPlaced) {
        localStorage.removeItem('orderPlaced');
        localStorage.removeItem('orderData');
      }
    };
  }, [orderPlaced]);

  // Force re-render when discount changes to update payment amounts
  useEffect(() => {
    // This effect will trigger re-render when appliedDiscount changes
  }, [appliedDiscount]);

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData(prevData => ({
        ...prevData,
        email: user.email || '',
        firstName: user.name?.split(' ')[0] || '',
        lastName: user.name?.split(' ')[1] || '',
        address: (typeof user.address === 'object' ? user.address?.street || user.address?.address || '' : user.address || ''),
        city: (typeof user.address === 'object' ? user.address?.city || '' : ''),
        state: (typeof user.address === 'object' ? user.address?.state || '' : ''),
        zipCode: (typeof user.address === 'object' ? user.address?.zipCode || '' : ''),
        phone: user.phone || ''
      }));
    }
  }, [user]);

  // Discount code validation
  const validateDiscountCode = async () => {
    if (!discountCode.trim()) {
      setDiscountError('Please enter a discount code');
      return;
    }

    setDiscountLoading(true);
    setDiscountError('');

    try {
      const response = await api.post('/api/discounts/validate', {
        code: discountCode.trim(),
        orderAmount: getFinalTotal() || 0
      });

      if (response.data.valid) {
        setAppliedDiscount(response.data.discount);
        setDiscountError('');
        console.log('Discount applied:', response.data.discount);
      }
    } catch (error) {
      console.error('Discount validation error:', error);
      if (error.response?.data?.message) {
        setDiscountError(error.response.data.message);
      } else {
        setDiscountError('Invalid discount code');
      }
      setAppliedDiscount(null);
    } finally {
      setDiscountLoading(false);
    }
  };

  // Remove applied discount
  const removeDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode('');
    setDiscountError('');
  };

  // Settings are already loaded by SettingsContext on app startup
  // No need to reload settings here as it causes infinite re-renders

  // Calculate shipping cost
  const getShippingCost = () => {
    console.log('🔍 Debug - Settings in checkout:', settings);
    console.log('🔍 Debug - Shipping settings:', settings?.shipping);
    
    if (!settings || !settings.shipping) {
      console.log('⚠️ No shipping settings found, using defaults');
      return { shippingCost: 0, isFreeShipping: true };
    }
    
    const shippingResult = calculateCartShipping(cartItems, settings.shipping);
    console.log('📦 Shipping calculation result:', shippingResult);
    return shippingResult;
  };

  // Calculate final total with discount
  const getFinalTotal = () => {
    // Use getTotalWithGST() to get the total including GST
    let total = getTotalWithGST() || 0;
    const shipping = getShippingCost();
    
    // Add shipping cost
    total += shipping.shippingCost;
    
    // Add COD charges if applicable
    if (formData.paymentMethod === 'cod') {
      total += 50;
    }
    
    // Apply discount if available
    if (appliedDiscount) {
      total -= appliedDiscount.discountAmount;
      total = Math.max(0, total); // Ensure total doesn't go below 0
    }
    
    return total;
  };

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

  // Safety check for cart context - only show error if cart is initialized but empty
  if (isInitialized && (!cartItems || cartItems.length === 0)) {
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
    
    console.log('🚀 Starting COD order submission...');
    console.log('📋 Form data:', formData);
    console.log('🛒 Cart items:', cartItems);
    console.log('💰 Base price:', getTotalPrice());
    console.log('💰 Total with GST:', getTotalWithGST());
    console.log('💳 Payment method:', formData.paymentMethod);
    
    // Safety check for cart items
    if (!cartItems || cartItems.length === 0) {
      console.error('❌ No cart items found');
      setErrors({ submit: 'No items in cart. Please add items before proceeding.' });
      return;
    }
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      console.error('❌ Form validation failed:', formErrors);
      setErrors(formErrors);
      return;
    }

    console.log('✅ Form validation passed, proceeding with order placement...');
    setLoading(true);

    try {
      const orderData = {
        items: cartItems,
        shipping: formData,
        total: getFinalTotal(),
        paymentMethod: formData.paymentMethod,
        codCharges: formData.paymentMethod === 'cod' ? 50 : 0
      };

      console.log('=== COD ORDER SUBMISSION DEBUG ===');
      console.log('Payment method:', formData.paymentMethod);
      console.log('Order data being sent:', orderData);
      console.log('Cart base total:', getTotalPrice());
      console.log('Cart total with GST:', getTotalWithGST());
      console.log('Final total with discounts:', getFinalTotal());
      console.log('COD total:', formData.paymentMethod === 'cod' ? getFinalTotal() : getFinalTotal());
      
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

      console.log('📡 Making API call to /api/orders...');
      const response = await api.post('/api/orders', orderData);
      console.log('📡 API response received:', response);

      console.log('COD order successful:', response.data);
      
      if (response.data.success) {
        console.log('✅ Order placed successfully, clearing cart and showing success page');
        
        // Store order success in localStorage as backup first
        localStorage.setItem('orderPlaced', 'true');
        localStorage.setItem('orderData', JSON.stringify(response.data.order));
        
        // Clear cart immediately
        clearCart();
        console.log('🛒 Cart cleared');
        
        // Set order placed state after clearing cart
        setOrderPlaced(true);
        console.log('🎯 orderPlaced state set to true, should show success page now');
        
        setError(null); // Clear any previous errors
        
        // Scroll to top to show success page
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        console.error('❌ Order response indicates failure:', response.data);
        setErrors({ submit: response.data.message || 'Failed to place order. Please try again.' });
      }

    } catch (error) {
      console.error('❌ Order placement error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      let errorMessage = 'Failed to place order. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors({ submit: errorMessage });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if ((!cartItems || cartItems.length === 0) && !orderPlaced) {
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
    // Get order data from localStorage
    const orderData = JSON.parse(localStorage.getItem('orderData') || '{}');
    
    const handleDownloadInvoice = async () => {
      try {
        await downloadInvoice(orderData, settings);
      } catch (error) {
        console.error('Error downloading invoice:', error);
        alert('Failed to download invoice. Please try again.');
      }
    };

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
                <p>Pay ₹{getFinalTotal().toFixed(2)} when you receive your order.</p>
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
              <button 
                onClick={handleDownloadInvoice} 
                className="btn-primary"
                style={{ marginLeft: '10px' }}
              >
                📄 Download Invoice
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
                  key={`razorpay-${getFinalTotal()}-${appliedDiscount?.code || 'no-discount'}`}
                  amount={getFinalTotal() || 0}
                  orderData={{
                    items: cartItems || [],
                    shipping: formData,
                    total: getFinalTotal() || 0
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
                    <p className="cod-total">Pay ₹{getFinalTotal().toFixed(2)} when you receive your order.</p>
                  </div>
                  
                  <button 
                    type="button" 
                    className="btn-primary checkout-submit-btn cod-btn"
                    disabled={loading}
                    onClick={async (e) => {
                      // Call the actual order placement logic
                      await handleSubmit(e);
                    }}
                  >
                    {loading ? 'Processing...' : `Place COD Order - ₹${getFinalTotal().toFixed(2)}`}
                  </button>
                </div>
              ) : (
                <button 
                  type="submit" 
                  className="btn-primary checkout-submit-btn"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : `Place Order - ₹${getFinalTotal().toFixed(2)}`}
                </button>
              )}
            </form>
          </div>

          <div className="order-summary">
            <h3>Order Summary</h3>
            
            {/* Discount Code Section */}
            <div className="discount-section">
              <h4>Have a discount code?</h4>
              <div className="discount-input-group">
                <input
                  type="text"
                  placeholder="Enter discount code"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                  className="discount-input"
                  disabled={discountLoading || !!appliedDiscount}
                />
                {!appliedDiscount ? (
                  <button
                    type="button"
                    onClick={validateDiscountCode}
                    className="discount-apply-btn"
                    disabled={discountLoading || !discountCode.trim()}
                  >
                    {discountLoading ? 'Applying...' : 'Apply'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={removeDiscount}
                    className="discount-remove-btn"
                  >
                    Remove
                  </button>
                )}
              </div>
              
              {/* Discount Error Message */}
              {discountError && (
                <div className="discount-error">{discountError}</div>
              )}
              
              {/* Applied Discount Display */}
              {appliedDiscount && (
                <div className="applied-discount">
                  <span className="discount-label">
                    {appliedDiscount.type === 'percentage' ? `${appliedDiscount.value}% OFF` : `₹${appliedDiscount.value} OFF`}
                  </span>
                  <span className="discount-amount">
                    -₹{appliedDiscount.discountAmount.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

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
              {(() => {
                const gstBreakdown = getGSTBreakdown();
                return (
                  <>
                    <div className="total-row">
                      <span>Base Amount:</span>
                      <span>{formatCurrency(gstBreakdown.baseAmount)}</span>
                    </div>
                    <div className="total-row gst-breakdown">
                      <span>{getGSTRateDescription(gstBreakdown.totalAmount)}:</span>
                      <span>{formatCurrency(gstBreakdown.gstAmount)}</span>
                    </div>
                    <div className="total-row">
                      <span>Shipping:</span>
                      <span>{formatShippingCost(getShippingCost().shippingCost)}</span>
                    </div>
                    {formData.paymentMethod === 'cod' && (
                      <div className="total-row">
                        <span>COD Charges:</span>
                        <span>₹50.00</span>
                      </div>
                    )}
                    {appliedDiscount && (
                      <div className="total-row discount-row">
                        <span>Discount ({appliedDiscount.code}):</span>
                        <span>-₹{appliedDiscount.discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="total-row total-final">
                      <span>Total (Incl. GST):</span>
                      <span>₹{getFinalTotal().toFixed(2)}</span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;