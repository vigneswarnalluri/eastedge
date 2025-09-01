import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { scrollToTop } from '../utils/scrollToTop';
import { FiEdit2, FiSave, FiX, FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiShield, FiShoppingBag, FiHeart, FiSettings, FiTrash2 } from 'react-icons/fi';
import WishlistItem from '../components/WishlistItem';
import './Profile.css';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { 
    wishlistItems, 
    removeFromWishlist, 
    moveToCart, 
    clearWishlist,
    getWishlistCount 
  } = useWishlist();
  const { addToCart } = useCart();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    dateOfBirth: '',
    gender: '',
    bio: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: (typeof user.address === 'object' ? user.address?.street : user.address) || '',
        city: (typeof user.address === 'object' ? user.address?.city : user.city) || '',
        state: (typeof user.address === 'object' ? user.address?.state : user.state) || '',
        zipCode: (typeof user.address === 'object' ? user.address?.zipCode : user.zipCode) || '',
        country: (typeof user.address === 'object' ? user.address?.country : user.country) || '',
        dateOfBirth: user.dateOfBirth || '',
        gender: user.gender || '',
        bio: user.bio || ''
      });
    }
    // Ensure page scrolls to top when component mounts
    scrollToTop();
  }, [user]);

  // Debug logging for wishlist items
  useEffect(() => {
    console.log('Wishlist items:', wishlistItems);
    if (wishlistItems.length > 0) {
      console.log('First item structure:', JSON.stringify(wishlistItems[0], null, 2));
    }
  }, [wishlistItems]);

  // Fetch user orders when orders tab is active
  useEffect(() => {
    if (activeTab === 'orders' && user) {
      fetchUserOrders();
    }
  }, [activeTab, user]);

  const fetchUserOrders = async () => {
    setOrdersLoading(true);
    try {
      const response = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
      } else {
        console.error('Failed to fetch orders:', data.message);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`🔄 Field change - ${name}: "${value}"`);
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };
      console.log('📝 Updated formData:', newData);
      return newData;
    });
  };

  const handleEdit = () => {
    setIsEditing(true);
    setMessage({ type: '', text: '' });
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: (typeof user.address === 'object' ? user.address?.street : user.address) || '',
        city: (typeof user.address === 'object' ? user.address?.city : user.city) || '',
        state: (typeof user.address === 'object' ? user.address?.state : user.state) || '',
        zipCode: (typeof user.address === 'object' ? user.address?.zipCode : user.zipCode) || '',
        country: (typeof user.address === 'object' ? user.address?.country : user.country) || '',
        dateOfBirth: user.dateOfBirth || '',
        gender: user.gender || '',
        bio: user.bio || ''
      });
    }
    setMessage({ type: '', text: '' });
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      console.log('🔄 Frontend sending profile data:', formData);
      console.log('🔍 Gender field value:', formData.gender);
      console.log('🔍 Gender field type:', typeof formData.gender);
      console.log('🔍 All form fields:', Object.keys(formData));
      const result = await updateProfile(formData);
      console.log('✅ Profile update result:', result);
      
      if (result.success) {
        setIsEditing(false);
        setMessage({ 
          type: 'success', 
          text: 'Profile updated successfully!' 
        });
      } else {
        setMessage({ 
          type: 'error', 
          text: result.message || 'Failed to update profile' 
        });
      }
    } catch (error) {
      console.error('❌ Profile update error:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to update profile' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Password change handlers
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific field error when user starts typing
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validatePassword = () => {
    const errors = {};
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters long';
    }
    
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    return errors;
  };

  const handlePasswordUpdate = async () => {
    const errors = validatePassword();
    
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }
    
    setPasswordLoading(true);
    setPasswordErrors({});
    
    try {
      const response = await fetch('/api/users/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Password updated successfully!' });
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setPasswordErrors({ currentPassword: data.message || 'Failed to update password' });
      }
    } catch (error) {
      setPasswordErrors({ currentPassword: 'An error occurred while updating password' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
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

  const formatOrderDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Wishlist handlers
  const handleRemoveFromWishlist = (productId) => {
    removeFromWishlist(productId);
    setMessage({ 
      type: 'success', 
      text: 'Item removed from wishlist' 
    });
  };

  const handleMoveToCart = (productId) => {
    const item = moveToCart(productId, addToCart);
    if (item) {
      setMessage({ 
        type: 'success', 
        text: `${item.name || 'Product'} moved to cart` 
      });
    }
  };

  const handleClearWishlist = () => {
    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      clearWishlist();
      setMessage({ 
        type: 'success', 
        text: 'Wishlist cleared successfully' 
      });
    }
  };

  const handleViewProduct = (product) => {
    // This will be handled by the Link in WishlistItem component
    // You can add additional logic here if needed
  };

  if (!user) {
    return (
      <div className="profile-page">
        <div className="container">
          <div className="profile-error">
            <h2>Please log in to view your profile</h2>
            <p>You need to be authenticated to access your profile information.</p>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <FiUser /> },
    { id: 'orders', label: 'Orders', icon: <FiShoppingBag /> },
    { id: 'wishlist', label: 'Wishlist', icon: <FiHeart /> },
    { id: 'settings', label: 'Settings', icon: <FiSettings /> }
  ];

  return (
    <div className="profile-page">
      <div className="container">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-header-content">
            <div className="profile-avatar-large">
              <div className="avatar-placeholder-large">
                {getInitials(formData.name)}
              </div>
            </div>
            <div className="profile-header-info">
              <h1>{formData.name || 'User Profile'}</h1>
              <p className="profile-email">{formData.email}</p>
              <p className="profile-member-since">
                Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long' 
                }) : 'Unknown'}
              </p>
            </div>
          </div>
          {!isEditing && (
            <button onClick={handleEdit} className="btn-edit-profile">
              <FiEdit2 /> Edit Profile
            </button>
          )}
        </div>

        {/* Message Display */}
        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="profile-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'profile' && (
            <div className="profile-content">
              <div className="profile-card">
                <div className="card-header">
                  <h3>Personal Information</h3>
                </div>
                
                <div className="profile-form">
                  {/* Basic Information */}
                  <div className="form-section">
                    <h4>Basic Information</h4>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">
                          Full Name
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Enter your full name"
                          />
                        ) : (
                          <div className="form-value">{formData.name || 'Not provided'}</div>
                        )}
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          Email Address
                        </label>
                        {isEditing ? (
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Enter your email"
                          />
                        ) : (
                          <div className="form-value">{formData.email || 'Not provided'}</div>
                        )}
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">
                          Phone Number
                        </label>
                        {isEditing ? (
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Enter your phone number"
                          />
                        ) : (
                          <div className="form-value">{formData.phone || 'Not provided'}</div>
                        )}
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          Date of Birth
                        </label>
                        {isEditing ? (
                          <input
                            type="date"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleChange}
                            className="form-input"
                          />
                        ) : (
                          <div className="form-value">
                            {formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString() : 'Not provided'}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Gender</label>
                        {isEditing ? (
                                                     <select
                             name="gender"
                             value={formData.gender}
                             onChange={handleChange}
                             className="form-input"
                           >
                             <option value="">Select gender</option>
                             <option value="Male">Male</option>
                             <option value="Female">Female</option>
                             <option value="Other">Other</option>
                             <option value="Prefer not to say">Prefer not to say</option>
                           </select>
                        ) : (
                          <div className="form-value">
                            {formData.gender ? formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1) : 'Not provided'}
                          </div>
                        )}
                      </div>

                      <div className="form-group">
                        <label className="form-label">Bio</label>
                        {isEditing ? (
                          <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            className="form-textarea"
                            placeholder="Tell us about yourself..."
                            rows="3"
                          />
                        ) : (
                          <div className="form-value">{formData.bio || 'No bio added yet'}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Address Information */}
                  <div className="form-section">
                    <h4>Address Information</h4>
                    <div className="form-row">
                      <div className="form-group full-width">
                        <label className="form-label">Street Address</label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Enter your street address"
                          />
                        ) : (
                          <div className="form-value">{formData.address || 'Not provided'}</div>
                        )}
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">City</label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Enter your city"
                          />
                        ) : (
                          <div className="form-value">{formData.city || 'Not provided'}</div>
                        )}
                      </div>

                      <div className="form-group">
                        <label className="form-label">State/Province</label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Enter your state"
                          />
                        ) : (
                          <div className="form-value">{formData.state || 'Not provided'}</div>
                        )}
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">ZIP/Postal Code</label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="zipCode"
                            value={formData.zipCode}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Enter ZIP code"
                          />
                        ) : (
                          <div className="form-value">{formData.zipCode || 'Not provided'}</div>
                        )}
                      </div>

                      <div className="form-group">
                        <label className="form-label">Country</label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Enter your country"
                          />
                        ) : (
                          <div className="form-value">{formData.country || 'Not provided'}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {isEditing && (
                    <div className="form-actions">
                      <button 
                        onClick={handleSave} 
                        className="btn-primary"
                        disabled={loading}
                      >
                        <FiSave /> {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button 
                        onClick={handleCancel} 
                        className="btn-secondary"
                        disabled={loading}
                      >
                        <FiX /> Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Sidebar */}
              <div className="profile-sidebar">
                <div className="profile-stats">
                  <h3><FiShield /> Account Information</h3>
                  <div className="stat-item">
                    <span className="stat-label">Member Since</span>
                    <span className="stat-value">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Total Orders</span>
                    <span className="stat-value">{user.totalOrders || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Account Status</span>
                    <span className="stat-value status-active">Active Member</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Last Order</span>
                    <span className="stat-value">
                      {user.lastOrderDate ? new Date(user.lastOrderDate).toLocaleDateString() : 'No orders yet'}
                    </span>
                  </div>
                </div>


              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="orders-tab">
              <div className="orders-header">
                <h3><FiShoppingBag /> Order History</h3>
                <p>Track your orders and view order details</p>
                <button 
                  onClick={() => navigate('/orders')}
                  className="btn-primary"
                  style={{ marginTop: '15px' }}
                >
                  View Full Orders Page
                </button>
              </div>

              {ordersLoading ? (
                <div className="loading-orders">
                  <div className="spinner"></div>
                  <p>Loading orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="empty-orders">
                  <div className="empty-orders-icon">
                    <FiShoppingBag />
                  </div>
                  <h4>No orders yet</h4>
                  <p>Start shopping to see your order history here!</p>
                  <button 
                    className="btn-primary"
                    onClick={() => window.location.href = '/products'}
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
                          <h4>Order #{order._id.slice(-8).toUpperCase()}</h4>
                          <p className="order-date">
                            Placed on {formatOrderDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="order-status">
                          <span className={`status-badge ${getOrderStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="order-items">
                        {order.orderItems?.map((item, index) => (
                          <div key={index} className="order-item">
                            <div className="item-image">
                              {item.image ? (
                                <img src={item.image} alt={item.name} />
                              ) : (
                                <div className="item-placeholder">
                                  <FiShoppingBag />
                                </div>
                              )}
                            </div>
                            <div className="item-details">
                              <h5>{item.name}</h5>
                              <p className="item-variants">
                                {item.selectedSize && `Size: ${item.selectedSize}`}
                                {item.selectedSize && item.selectedColor && ' • '}
                                {item.selectedColor && `Color: ${item.selectedColor}`}
                              </p>
                              <p className="item-price">₹{item.price} × {item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="order-footer">
                        <div className="order-total">
                          <span>Total:</span>
                          <strong>₹{order.totalPrice}</strong>
                        </div>
                        <div className="order-actions">
                          <button className="btn-secondary">
                            View Details
                          </button>
                          {order.status === 'delivered' && (
                            <button className="btn-primary">
                              Reorder
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

                    {activeTab === 'wishlist' && (
            <div className="wishlist-tab">
               <div className="wishlist-header">
                <h3><FiHeart /> My Wishlist</h3>
                <div className="wishlist-actions">
                  <span className="wishlist-count">
                    {getWishlistCount()} item{getWishlistCount() !== 1 ? 's' : ''}
                  </span>
                  {wishlistItems.length > 0 && (
                    <button 
                      className="btn-clear-wishlist"
                      onClick={handleClearWishlist}
                    >
                      <FiTrash2 /> Clear All
                    </button>
                  )}
                </div>
              </div>

              {wishlistItems.length === 0 ? (
                <div className="empty-wishlist">
                  <div className="empty-wishlist-icon">
                    <FiHeart />
                  </div>
                  <h4>Your wishlist is empty</h4>
                  <p>Start adding products you love to your wishlist!</p>
                  <button 
                    className="btn-primary"
                    onClick={() => window.location.href = '/products'}
                  >
                    Browse Products
                  </button>
                </div>
              ) : (
                                 <div className="wishlist-items">
                   {wishlistItems.map((item) => {
                     // Safety check - ensure item is valid
                     if (!item || typeof item !== 'object') {
                       console.error('Invalid wishlist item:', item);
                       return null;
                     }
                     
                                           // Debug log for each item being rendered
                      console.log('Rendering WishlistItem with item:', item);
                      
                      return (
                        <WishlistItem
                          key={item._id || Math.random()}
                          item={item}
                          onRemove={handleRemoveFromWishlist}
                          onMoveToCart={handleMoveToCart}
                          onView={handleViewProduct}
                        />
                      );
                   })}
                 </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="tab-panel">
              <div className="profile-card">
                <div className="card-header">
                  <h3>Account Settings</h3>
                </div>
                
                <div className="profile-form">
                  {/* Password Change Section */}
                  <div className="form-section">
                    <h4>Change Password</h4>
                    <div className="password-change-form">
                      <div className="form-group">
                        <label className="form-label">Current Password</label>
                        <input
                          type="password"
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          className="form-input"
                          placeholder="Enter your current password"
                        />
                        {passwordErrors.currentPassword && (
                          <span className="error-message">{passwordErrors.currentPassword}</span>
                        )}
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">New Password</label>
                        <input
                          type="password"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className="form-input"
                          placeholder="Enter new password (min 6 characters)"
                        />
                        {passwordErrors.newPassword && (
                          <span className="error-message">{passwordErrors.newPassword}</span>
                        )}
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Confirm New Password</label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className="form-input"
                          placeholder="Confirm your new password"
                        />
                        {passwordErrors.confirmPassword && (
                          <span className="error-message">{passwordErrors.confirmPassword}</span>
                        )}
                      </div>
                      
                      <div className="form-actions">
                        <button 
                          onClick={handlePasswordUpdate}
                          className="btn-primary"
                          disabled={passwordLoading}
                        >
                          {passwordLoading ? 'Updating...' : 'Update Password'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
