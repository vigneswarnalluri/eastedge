import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './RazorpayPayment.css';

const RazorpayPayment = ({ amount, onSuccess, onFailure, orderData }) => {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    if (!window.Razorpay) {
      setError('Razorpay is not loaded. Please refresh the page.');
      return;
    }

    // Validate form data
    if (!orderData?.items || orderData.items.length === 0) {
      setError('No items in cart. Please add items before proceeding.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create Razorpay order
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount: amount,
          currency: 'INR',
          receipt: `order_${Date.now()}`,
          notes: {
            userId: user?._id,
            orderType: 'ecommerce',
            items: orderData?.items?.length || 0
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create payment order');
      }

      const { order } = await response.json();

      // Initialize Razorpay payment
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY_ID', // Replace with your key
        amount: order.amount,
        currency: order.currency,
        name: 'EastEdge Store',
        description: 'E-commerce Purchase',
        order_id: order.id,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await fetch('/api/payments/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            if (verifyResponse.ok) {
              const verifyData = await verifyResponse.json();
              
              // Clear cart on successful payment
              clearCart();
              
              // Call success callback
              if (onSuccess) {
                onSuccess({
                  ...response,
                  verification: verifyData
                });
              }
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            setError('Payment verification failed. Please contact support.');
            if (onFailure) {
              onFailure(error);
            }
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || ''
        },
        theme: {
          color: '#059669'
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error('Payment initialization error:', error);
      setError('Failed to initialize payment. Please try again.');
      if (onFailure) {
        onFailure(error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="razorpay-payment">
      {error && (
        <div className="payment-error">
          {error}
        </div>
      )}
      
      <button
        onClick={handlePayment}
        disabled={loading}
        className="razorpay-pay-btn"
      >
        {loading ? (
          <span className="loading-text">
            <span className="spinner"></span>
            Initializing Payment...
          </span>
        ) : (
          `Pay ₹${amount.toFixed(2)}`
        )}
      </button>
      
      <div className="payment-info">
        <p>Secure payment powered by Razorpay</p>
        <div className="payment-methods">
          <span>💳 Credit/Debit Cards</span>
          <span>🏦 Net Banking</span>
          <span>📱 UPI</span>
          <span>💸 Wallets</span>
        </div>
      </div>
    </div>
  );
};

export default RazorpayPayment;
