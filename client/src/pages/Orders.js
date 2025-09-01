import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiShoppingBag, FiPackage, FiTruck, FiCheckCircle, FiXCircle, FiClock, FiMapPin, FiCalendar, FiUser, FiPhone, FiMail } from 'react-icons/fi';
import { scrollToTop } from '../utils/scrollToTop';
import { formatCurrency, getGSTRateDescription } from '../utils/gstCalculator';
import './Orders.css';

const Orders = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  useEffect(() => {
    // Ensure page scrolls to top when component mounts
    scrollToTop();
    
    // Redirect unauthenticated users to login
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { 
          message: 'Please log in to view your orders',
          redirectTo: '/orders'
        }
      });
      return;
    }

    // Fetch user orders
    fetchUserOrders();
  }, [isAuthenticated, navigate]);

  const fetchUserOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Fetching orders from backend...');
      console.log('🔑 Auth token:', localStorage.getItem('token') ? 'Present' : 'Missing');
      
      // Use full backend URL since proxy isn't working
      const backendUrl = 'http://localhost:5000';
      const apiUrl = `${backendUrl}/api/orders`;
      
      console.log('🌐 Using backend URL:', apiUrl);
      
      // First check if server is accessible
      try {
        const healthCheck = await fetch(apiUrl, { method: 'HEAD' });
        console.log('🏥 Server health check status:', healthCheck.status);
      } catch (healthError) {
        console.error('❌ Server health check failed:', healthError);
        throw new Error('Server is not accessible. Please check if the backend server is running.');
      }
      
      // Test if server responds to basic request (will fail auth but show server is up)
      try {
        const testResponse = await fetch(apiUrl);
        console.log('🧪 Test response status:', testResponse.status);
        if (testResponse.status === 401) {
          console.log('✅ Server is running, authentication required');
        }
      } catch (testError) {
        console.error('❌ Server test failed:', testError);
      }
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers);
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      console.log('📡 Content-Type:', contentType);
      
      if (!contentType || !contentType.includes('application/json')) {
        console.error('❌ Server returned non-JSON response');
        const textResponse = await response.text();
        console.error('❌ Response text:', textResponse.substring(0, 200) + '...');
        throw new Error('Server returned invalid response format. Please check if the server is running.');
      }
      
      const data = await response.json();
      console.log('✅ Orders data received:', data);
      
      if (data.success) {
        setOrders(data.orders);
      } else {
        setError(data.message || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      console.error('❌ Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      if (error.message.includes('Server is not accessible')) {
        setError('Server is not running. Please start the backend server and try again.');
      } else if (error.message.includes('Server returned invalid response')) {
        setError('Server error: Unable to connect to orders service. Please try again later.');
      } else {
        setError('Failed to load orders. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getOrderStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'status-pending';
      case 'processing':
        return 'status-processing';
      case 'shipped':
        return 'status-shipped';
      case 'delivered':
        return 'status-delivered';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  };

  const getOrderStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <FiClock />;
      case 'processing':
        return <FiPackage />;
      case 'shipped':
        return <FiTruck />;
      case 'delivered':
        return <FiCheckCircle />;
      case 'cancelled':
        return <FiXCircle />;
      default:
        return <FiClock />;
    }
  };

  const formatOrderDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatOrderId = (orderId) => {
    return `#${orderId.slice(-8).toUpperCase()}`;
  };

  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleCloseOrderDetails = () => {
    setShowOrderDetails(false);
    setSelectedOrder(null);
  };

  const handleReorder = (order) => {
    // TODO: Implement reorder functionality
    console.log('Reorder order:', order);
    navigate('/products');
  };

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  if (loading) {
    return (
      <div className="orders-page">
        <div className="container">
          <div className="loading-orders">
            <div className="spinner"></div>
            <p>Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-page">
        <div className="container">
          <div className="orders-error">
            <h2>Error Loading Orders</h2>
            <p>{error}</p>
            <button onClick={fetchUserOrders} className="btn-primary">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="container">
        {/* Page Header */}
        <div className="orders-header">
          <h1><FiShoppingBag /> My Orders</h1>
          <p>Track your orders and view order history</p>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="empty-orders">
            <div className="empty-orders-icon">
              <FiShoppingBag />
            </div>
            <h2>No orders yet</h2>
            <p>Start shopping to see your order history here!</p>
            <button 
              onClick={() => navigate('/products')} 
              className="btn-primary"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h3>{formatOrderId(order._id)}</h3>
                    <p className="order-date">
                      <FiCalendar /> Placed on {formatOrderDate(order.createdAt)}
                    </p>
                    <p className="order-total">
                      Total: <strong>₹{order.totalPrice?.toFixed(2)}</strong>
                    </p>
                  </div>
                  <div className="order-status">
                    <span className={`status-badge ${getOrderStatusColor(order.status)}`}>
                      {getOrderStatusIcon(order.status)} {order.status}
                    </span>
                  </div>
                </div>
                
                <div className="order-items-preview">
                  {order.orderItems?.slice(0, 3).map((item, index) => (
                    <div key={index} className="order-item-preview">
                      <div className="item-image">
                        {item.image ? (
                          <img src={item.image} alt={item.name} />
                        ) : (
                          <div className="item-placeholder">
                            <FiPackage />
                          </div>
                        )}
                      </div>
                      <div className="item-details">
                        <h4>{item.name}</h4>
                        <p className="item-variants">
                          {item.selectedSize && `Size: ${item.selectedSize}`}
                          {item.selectedSize && item.selectedColor && ' • '}
                          {item.selectedColor && `Color: ${item.selectedColor}`}
                        </p>
                        <p className="item-price">₹{item.price} × {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                  {order.orderItems?.length > 3 && (
                    <div className="more-items">
                      <p>+{order.orderItems.length - 3} more items</p>
                    </div>
                  )}
                </div>
                
                <div className="order-footer">
                  <div className="order-actions">
                    <button 
                      onClick={() => handleViewOrderDetails(order)}
                      className="btn-secondary"
                    >
                      View Details
                    </button>
                    {order.status === 'delivered' && (
                      <button 
                        onClick={() => handleReorder(order)}
                        className="btn-primary"
                      >
                        Reorder
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Order Details Modal */}
        {showOrderDetails && selectedOrder && (
          <div className="order-details-modal">
            <div className="modal-overlay" onClick={handleCloseOrderDetails}></div>
            <div className="modal-content">
              <div className="modal-header">
                <h2>Order Details {formatOrderId(selectedOrder._id)}</h2>
                <button onClick={handleCloseOrderDetails} className="close-btn">
                  <FiXCircle />
                </button>
              </div>
              
              <div className="modal-body">
                {/* Order Status */}
                <div className="order-status-section">
                  <h3>Order Status</h3>
                  <div className={`status-badge large ${getOrderStatusColor(selectedOrder.status)}`}>
                    {getOrderStatusIcon(selectedOrder.status)} {selectedOrder.status}
                  </div>
                  <p className="order-date">
                    Placed on {formatOrderDate(selectedOrder.createdAt)}
                  </p>
                </div>

                {/* Shipping Address */}
                <div className="shipping-address-section">
                  <h3><FiMapPin /> Shipping Address</h3>
                  <div className="address-details">
                    {/* Debug: Log the order data structure */}
                    {console.log('🔍 Order data for address:', selectedOrder)}
                    {console.log('🔍 Shipping data:', selectedOrder.shipping)}
                    {console.log('🔍 ShippingAddress data:', selectedOrder.shippingAddress)}
                    
                    {(selectedOrder.shipping?.firstName || selectedOrder.shippingAddress?.firstName) && (
                      <p><strong>{selectedOrder.shipping?.firstName || selectedOrder.shippingAddress?.firstName} {selectedOrder.shipping?.lastName || selectedOrder.shippingAddress?.lastName}</strong></p>
                    )}
                    
                    {(selectedOrder.shipping?.address || selectedOrder.shippingAddress?.address) && (
                      <p>{selectedOrder.shipping?.address || selectedOrder.shippingAddress?.address}</p>
                    )}
                    
                    {(selectedOrder.shipping?.city || selectedOrder.shippingAddress?.city) && (
                      <p>{selectedOrder.shipping?.city || selectedOrder.shippingAddress?.city}, {selectedOrder.shipping?.state || selectedOrder.shippingAddress?.state} {selectedOrder.shipping?.zipCode || selectedOrder.shippingAddress?.zipCode}</p>
                    )}
                    
                    <p>{selectedOrder.shipping?.country || selectedOrder.shippingAddress?.country || 'India'}</p>
                    
                    {(selectedOrder.shipping?.phone || selectedOrder.shippingAddress?.phone) && (
                      <p><FiPhone /> {selectedOrder.shipping?.phone || selectedOrder.shippingAddress?.phone}</p>
                    )}
                    
                    {(selectedOrder.shipping?.email || selectedOrder.shippingAddress?.email) && (
                      <p><FiMail /> {selectedOrder.shipping?.email || selectedOrder.shippingAddress?.email}</p>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div className="order-items-section">
                  <h3>Order Items</h3>
                  <div className="order-items-list">
                    {selectedOrder.orderItems?.map((item, index) => (
                      <div key={index} className="order-item-detail">
                        <div className="item-image">
                          {item.image ? (
                            <img src={item.image} alt={item.name} />
                          ) : (
                            <div className="item-placeholder">
                              <FiPackage />
                            </div>
                          )}
                        </div>
                        <div className="item-details">
                          <h4>{item.name}</h4>
                          <p className="item-variants">
                            {item.selectedSize && `Size: ${item.selectedSize}`}
                            {item.selectedSize && item.selectedColor && ' • '}
                            {item.selectedColor && `Color: ${item.selectedColor}`}
                          </p>
                          <p className="item-price">₹{item.price} × {item.quantity}</p>
                        </div>
                        <div className="item-total">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="order-summary-section">
                  <h3>Order Summary</h3>
                  {selectedOrder.gstBreakdown ? (
                    <>
                      <div className="summary-row">
                        <span>Base Amount:</span>
                        <span>{formatCurrency(selectedOrder.gstBreakdown.baseAmount)}</span>
                      </div>
                      <div className="summary-row gst-breakdown">
                        <span>{getGSTRateDescription(selectedOrder.totalPrice)}:</span>
                        <span>{formatCurrency(selectedOrder.gstBreakdown.gstAmount)}</span>
                      </div>
                      {selectedOrder.shippingPrice > 0 && (
                        <div className="summary-row">
                          <span>Shipping:</span>
                          <span>₹{selectedOrder.shippingPrice.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="summary-row total">
                        <span>Total (Incl. GST):</span>
                        <span>₹{selectedOrder.totalPrice.toFixed(2)}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="summary-row">
                        <span>Subtotal:</span>
                        <span>₹{(selectedOrder.totalPrice - (selectedOrder.shippingPrice || 0)).toFixed(2)}</span>
                      </div>
                      {selectedOrder.shippingPrice > 0 && (
                        <div className="summary-row">
                          <span>Shipping:</span>
                          <span>₹{selectedOrder.shippingPrice.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="summary-row total">
                        <span>Total:</span>
                        <span>₹{selectedOrder.totalPrice.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                  <div className="summary-row">
                    <span>Payment Method:</span>
                    <span>{selectedOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</span>
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button onClick={handleCloseOrderDetails} className="btn-secondary">
                  Close
                </button>
                {selectedOrder.status === 'delivered' && (
                  <button onClick={() => handleReorder(selectedOrder)} className="btn-primary">
                    Reorder
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders; 