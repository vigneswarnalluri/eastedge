import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiHeart, 
  FiStar, 
  FiTruck, 
  FiShield, 
  FiRefreshCw,
  FiArrowLeft,
  FiShoppingCart,
  FiEye,
  FiChevronLeft,
  FiChevronRight,
  FiCheck,
  FiPackage,
  FiCreditCard
} from 'react-icons/fi';
import './ProductDetail.css';
import api from '../services/api';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('description');

  // Use ref to track current quantity (bypasses React Strict Mode issues)
  const quantityRef = useRef(1);

  // Update ref whenever quantity state changes
  useEffect(() => {
    quantityRef.current = quantity;
    console.log('Quantity ref updated to:', quantityRef.current);
  }, [quantity]);

  // Debug quantity state changes
  useEffect(() => {
    console.log('Quantity state changed to:', quantity);
  }, [quantity]);

  // Debug component re-renders
  useEffect(() => {
    console.log('ProductDetail component rendered with quantity:', quantity);
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/products/${id}`);
        setProduct(response.data);
        
        // Set default selections
        if (response.data.sizes && Array.isArray(response.data.sizes) && response.data.sizes.length > 0) {
          setSelectedSize(response.data.sizes[0]);
        }
        if (response.data.colors && Array.isArray(response.data.colors) && response.data.colors.length > 0) {
          // Handle different color formats
          const firstColor = response.data.colors[0];
          if (typeof firstColor === 'string') {
            setSelectedColor(firstColor);
          } else if (firstColor && typeof firstColor === 'object' && firstColor.name) {
            setSelectedColor(firstColor.name);
          } else if (firstColor && typeof firstColor === 'object' && firstColor.color) {
            setSelectedColor(firstColor.color);
          }
        }
        
        // Fetch reviews
        fetchReviews(response.data._id);
        
      } catch (error) {
        console.error('Error fetching product:', error);
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    // Don't reset quantity here - let it persist
  }, [id]);

  useEffect(() => {
    if (product) {
      setIsWishlisted(isInWishlist(product._id));
    }
  }, [product, isInWishlist]);



  const fetchReviews = async (productId) => {
    try {
      const response = await api.get(`/api/products/${productId}/reviews`);
      setReviews(response.data.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  // Test function to isolate the issue
  const testAddToCart = () => {
    console.log('=== TEST ADD TO CART ===');
    console.log('Current quantity state:', quantity);
    
    if (product && selectedSize && selectedColor) {
      const testItem = {
        ...product,
        selectedSize,
        selectedColor,
        quantity: 5 // Hardcoded test quantity
      };
      console.log('Test item with hardcoded quantity 5:', testItem);
      addToCart(testItem);
      console.log('Test addToCart called with quantity 5');
    } else {
      console.log('Missing size or color for test');
    }
  };

  const handleAddToCart = useCallback(() => {
    console.log('🚨 handleAddToCart FUNCTION CALLED! 🚨');
    console.log('=== handleAddToCart DEBUG ===');
    console.log('Current quantity state:', quantity);
    console.log('Current quantity ref:', quantityRef.current);
    console.log('Selected size:', selectedSize);
    console.log('Selected color:', selectedColor);
    console.log('Product:', product);
    
    // Force a direct check of the current quantity
    const currentQuantity = quantityRef.current; // Use ref instead of state
    console.log('Direct quantity check (from ref):', currentQuantity);
    
    if (product && selectedSize && selectedColor) {
      const cartItem = {
        ...product,
        selectedSize,
        selectedColor,
        quantity: currentQuantity // Use the ref value
      };
      console.log('Cart item being created:', cartItem);
      console.log('Final quantity being sent to cart:', cartItem.quantity);
      addToCart(cartItem);
    } else {
      let missingOptions = [];
      if (!selectedSize) missingOptions.push('size');
      if (!selectedColor) missingOptions.push('color');
      alert(`Please select ${missingOptions.join(' and ')} before adding to cart`);
    }
    console.log('=== END handleAddToCart DEBUG ===');
  }, [product, selectedSize, selectedColor, quantity, addToCart]); // Add quantity back to dependencies

  const handleBuyNow = useCallback(() => {
    if (product && selectedSize && selectedColor) {
      addToCart({
        ...product,
        selectedSize,
        selectedColor,
        quantity
      });
      navigate('/checkout');
    } else {
      let missingOptions = [];
      if (!selectedSize) missingOptions.push('size');
      if (!selectedColor) missingOptions.push('color');
      alert(`Please select ${missingOptions.join(' and ')} before proceeding`);
    }
  }, [product, selectedSize, selectedColor, quantity, navigate, addToCart]); // Add quantity to dependencies

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeFromWishlist(product._id);
      setIsWishlisted(false);
    } else {
      addToWishlist(product);
      setIsWishlisted(true);
    }
  };

  const handleImageClick = (index) => {
    setCurrentImageIndex(index);
    setShowImageModal(true);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const getStockStatus = () => {
    if (!product.stockQuantity || product.stockQuantity <= 0) {
      return { status: 'out-of-stock', text: 'Out of Stock' };
    } else if (product.stockQuantity <= 10) {
      return { status: 'low-stock', text: 'Low Stock' };
    } else {
      return { status: 'in-stock', text: 'In Stock' };
    }
  };

  if (loading) {
    return (
      <div className="product-detail">
        <div className="container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail">
        <div className="container">
          <motion.div 
            className="error-state"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2>Product Not Found</h2>
            <p>{error || 'The product you are looking for does not exist.'}</p>
            <button 
              onClick={() => navigate('/products')}
              className="btn-primary"
            >
              Browse Products
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  const stockStatus = getStockStatus();
  const images = product.images && Array.isArray(product.images) && product.images.length > 0 ? product.images : [product.image];
  const hasMultipleImages = images.length > 1;

  // Safety check to ensure product is properly loaded
  if (!product || typeof product !== 'object') {
    return (
      <div className="product-detail">
        <div className="container">
          <div className="error-state">
            <h2>Product Loading Error</h2>
            <p>Unable to load product details. Please try again.</p>
            <button onClick={() => window.location.reload()} className="btn-primary">
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail">
      <div className="container">
        {/* Breadcrumb Navigation */}
        <nav className="breadcrumb-nav">
          <Link to="/" className="breadcrumb-link">Home</Link>
          <span className="breadcrumb-separator">/</span>
          <Link to="/products" className="breadcrumb-link">Products</Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{product.name || 'Product'}</span>
        </nav>

        {/* Back Button */}
        <button onClick={() => navigate(-1)} className="back-btn">
          <FiArrowLeft /> Back
        </button>
        
        <div className="product-detail-content">
          {/* Product Images Section */}
          <div className="product-images">
            <div className="main-image-container">
              <div className="main-image" onClick={() => handleImageClick(currentImageIndex)}>
                <img src={images[currentImageIndex]} alt={product.name} />
                {hasMultipleImages && (
                  <div className="image-overlay">
                    <FiEye />
                    <span>Click to enlarge</span>
                  </div>
                )}
              </div>
              
              {hasMultipleImages && (
                <div className="image-navigation">
                  <button 
                    className="nav-btn prev-btn" 
                    onClick={prevImage}
                    disabled={currentImageIndex === 0}
                  >
                    <FiChevronLeft />
                  </button>
                  <button 
                    className="nav-btn next-btn" 
                    onClick={nextImage}
                    disabled={currentImageIndex === images.length - 1}
                  >
                    <FiChevronRight />
                  </button>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {hasMultipleImages && (
              <div className="thumbnail-gallery">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img src={image} alt={`${product.name} ${index + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Product Information Section - Amazon Style */}
          <div className="product-info">
            {/* Product Header Section */}
            <div className="product-header-section">
              <div className="title-stock-row">
                <h1 className="product-title">{product.name}</h1>
                <div className="stock-status-inline">
                  <span className="stock-indicator"></span>
                  {stockStatus.text}
                  {product.stockQuantity && product.stockQuantity > 0 && (
                    <span> ({product.stockQuantity} available)</span>
                  )}
                </div>
              </div>
              
              <div className="product-rating-section">
                <div className="rating-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FiStar 
                      key={star} 
                      className={star <= (product.rating || 0) ? 'filled' : ''} 
                      style={{ color: star <= (product.rating || 0) ? '#ffa41c' : '#ddd' }}
                    />
                  ))}
                  <span className="rating-text">
                    {product.rating || 0} out of 5 stars
                  </span>
                </div>
                <Link to="#reviews" className="review-count">
                  {reviews.length} ratings
                </Link>
              </div>
            </div>

            {/* Price Section */}
            <div className="price-section">
              {product.originalPrice && product.originalPrice > product.price && (
                <div style={{ marginBottom: '0.5rem' }}>
                  <span className="original-price">₹{product.originalPrice.toLocaleString()}</span>
                  <span className="discount-badge">
                    -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                  </span>
                </div>
              )}
              <div className="current-price">₹{product.price.toLocaleString()}</div>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>
                Inclusive of all taxes
              </div>
            </div>

            {/* Hero Section - Options and Actions Side by Side */}
            <div className="product-actions-section hero-actions">
              <div className="hero-layout">
                {/* Left Side - Product Options */}
                <div className="hero-options">
                  {/* Size Selection */}
                  {product.sizes && product.sizes.length > 0 && (
                    <div className="option-group">
                      <label className="option-label">Size:</label>
                      <div className="option-selection">
                        {selectedSize ? `Selected: ${selectedSize}` : 'Select a size'}
                      </div>
                      <div className="size-options">
                        {product.sizes.map(size => (
                          <button
                            key={size}
                            className={`size-option ${selectedSize === size ? 'selected' : ''}`}
                            onClick={() => setSelectedSize(size)}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Color Selection */}
                  {product.colors && Array.isArray(product.colors) && product.colors.length > 0 && (
                    <div className="option-group">
                      <label className="option-label">Colour:</label>
                      <div className="option-selection">
                        {selectedColor ? `Selected: ${selectedColor}` : 'Make a Colour selection'}
                      </div>
                      <div className="color-options">
                        {product.colors.filter(color => color).map(color => {
                          // Handle different color formats
                          let colorName, colorValue;
                          if (typeof color === 'string') {
                            colorName = color;
                            colorValue = color.toLowerCase();
                          } else if (color && typeof color === 'object') {
                            colorName = color.name || color.color || color.value || 'Unknown';
                            colorValue = color.hex || color.code || color.name || 'gray';
                          }
                          
                          return (
                            <button
                              key={colorName}
                              className={`color-option ${selectedColor === colorName ? 'selected' : ''}`}
                              onClick={() => {
                                console.log('Color selected:', colorName, 'Original color data:', color);
                                setSelectedColor(colorName);
                              }}
                              style={{ 
                                backgroundColor: colorValue,
                                border: selectedColor === colorName ? '2px solid #000' : '1px solid #ddd',
                                width: '30px',
                                height: '30px',
                                borderRadius: '50%',
                                margin: '5px',
                                cursor: 'pointer'
                              }}
                              title={colorName}
                            />
                          );
                        })}
                      </div>
                      {/* Debug info */}
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                        Available colors: {product.colors.filter(c => c).map(color => {
                          if (typeof color === 'string') return color;
                          return color.name || color.color || color.value || 'Unknown';
                        }).join(', ')}
                      </div>
                    </div>
                  )}
                  
                  {/* Quantity Selector */}
                  <div className="option-group">
                    <label className="option-label">Quantity:</label>
                    <div className="quantity-controls">
                      <button 
                        onClick={() => {
                          const newQuantity = Math.max(1, quantity - 1);
                          console.log('Decreasing quantity from', quantity, 'to', newQuantity);
                          setQuantity(newQuantity);
                        }}
                        className="quantity-btn"
                        disabled={quantity <= 1}
                      >
                        -
                      </button>
                      <input 
                        type="number" 
                        value={quantity} 
                        onChange={(e) => {
                          const newQuantity = Math.max(1, parseInt(e.target.value) || 1);
                          console.log('Input quantity changed from', quantity, 'to', newQuantity);
                          setQuantity(newQuantity);
                        }}
                        className="quantity-input"
                        min="1"
                        max={product.stockQuantity || 99}
                      />
                      <button 
                        onClick={() => {
                          const newQuantity = quantity + 1;
                          console.log('Increasing quantity from', quantity, 'to', newQuantity);
                          setQuantity(newQuantity);
                        }}
                        className="quantity-btn"
                        disabled={product.stockQuantity && quantity >= product.stockQuantity}
                      >
                        +
                      </button>
                    </div>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                      Current quantity state: {quantity}
                      <button 
                        onClick={() => {
                          console.log('Test button clicked! Current quantity:', quantity);
                          setQuantity(quantity + 1);
                          console.log('Quantity set to:', quantity + 1);
                        }}
                        style={{ 
                          marginLeft: '10px', 
                          padding: '2px 8px', 
                          fontSize: '10px',
                          background: '#007bff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer'
                        }}
                      >
                        Test +1
                      </button>
                      <button 
                        onClick={() => {
                          console.log('Force update clicked! Setting quantity to 5');
                          setQuantity(5);
                        }}
                        style={{ 
                          marginLeft: '10px', 
                          padding: '2px 8px', 
                          fontSize: '10px',
                          background: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer'
                        }}
                      >
                        Force Set to 5
                      </button>
                      <button 
                        onClick={() => {
                          console.log('Direct set test clicked!');
                          setQuantity(10);
                          console.log('setQuantity(10) called');
                        }}
                        style={{ 
                          marginLeft: '10px', 
                          padding: '2px 8px', 
                          fontSize: '10px',
                          background: '#ffc107',
                          color: 'black',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer'
                        }}
                      >
                        Direct Set 10
                      </button>
                    </div>
                    {product.stockQuantity && (
                      <div className="max-quantity">
                        Max: {product.stockQuantity}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side - Action Buttons */}
                <div className="hero-actions-right">
                  <div className="product-actions">
                    <button 
                      onClick={handleAddToCart}
                      className="add-to-cart-btn"
                      disabled={stockStatus.status === 'out-of-stock'}
                    >
                      Add to Cart
                    </button>
                    
                    <button 
                      onClick={handleBuyNow}
                      className="buy-now-btn"
                      disabled={stockStatus.status === 'out-of-stock'}
                    >
                      Buy Now
                    </button>
                    
                    <button 
                      onClick={testAddToCart}
                      style={{ 
                        background: '#dc3545', 
                        color: 'white', 
                        border: 'none', 
                        padding: '10px 20px', 
                        borderRadius: '5px', 
                        cursor: 'pointer',
                        marginTop: '10px'
                      }}
                    >
                      Test Add (Qty 5)
                    </button>
                    
                    <button 
                      onClick={() => {
                        console.log('🚨 Direct call test button clicked! 🚨');
                        handleAddToCart();
                      }}
                      style={{ 
                        background: '#6f42c1', 
                        color: 'white', 
                        border: 'none', 
                        padding: '10px 20px', 
                        borderRadius: '5px', 
                        cursor: 'pointer',
                        marginTop: '10px'
                      }}
                    >
                      Direct Call handleAddToCart
                    </button>
                  </div>
                  
                  <button 
                    onClick={handleWishlistToggle}
                    className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
                    title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <FiHeart style={{ color: isWishlisted ? '#e31b23' : 'inherit' }} />
                    {isWishlisted ? 'Added to Wish List' : 'Add to Wish List'}
                  </button>
                </div>
              </div>
            </div>

            {/* Delivery Section */}
            <div className="delivery-section">
              <div className="delivery-info">
                FREE delivery Thursday, 28 August
              </div>
              <div className="delivery-date">
                Order within 20 hrs 46 mins
              </div>
            </div>





            {/* Security and Delivery Section */}
            <div className="security-delivery-section">
              <h4>Delivery & Returns</h4>
              <div className="delivery-features">
                <div className="delivery-feature">
                  <FiTruck />
                  <span>Free delivery on orders above ₹999</span>
                </div>
                <div className="delivery-feature">
                  <FiShield />
                  <span>Secure transaction</span>
                </div>
                <div className="delivery-feature">
                  <FiRefreshCw />
                  <span>10 days Return & Exchange</span>
                </div>
                <div className="delivery-feature">
                  <FiPackage />
                  <span>Amazon Delivered</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="product-tabs">
          <div className="tab-navigation">
            <button 
              className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
            <button 
              className={`tab-btn ${activeTab === 'specifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('specifications')}
            >
              Specifications
            </button>
            <button 
              className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews ({reviews.length})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'shipping' ? 'active' : ''}`}
              onClick={() => setActiveTab('shipping')}
            >
              Shipping & Returns
            </button>
          </div>

          <div className="tab-content">
            <AnimatePresence mode="wait">
              {activeTab === 'description' && (
                <motion.div
                  key="description"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="tab-panel"
                >
                  <h3>About this item</h3>
                  <p>{product.description}</p>
                  {product.features && (
                    <div className="product-features-list">
                      <h4>Key Features:</h4>
                      <ul>
                        {product.features.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'specifications' && (
                <motion.div
                  key="specifications"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="tab-panel"
                >
                  <h3>Product Specifications</h3>
                  <div className="specifications-grid">
                    <div className="spec-item">
                      <span className="spec-label">Material:</span>
                      <span className="spec-value">{product.material || 'Not specified'}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Weight:</span>
                      <span className="spec-value">{product.weight || 'Not specified'}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Dimensions:</span>
                      <span className="spec-value">{product.dimensions || 'Not specified'}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Brand:</span>
                      <span className="spec-value">{product.brand || 'Generic'}</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'reviews' && (
                <motion.div
                  key="reviews"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="tab-panel"
                  id="reviews"
                >
                  <h3>Customer Reviews</h3>
                  {reviews.length > 0 ? (
                    <div className="reviews-list">
                      {reviews.map((review, index) => (
                        <div key={index} className="review-item">
                          <div className="review-header">
                            <div className="review-rating">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <FiStar 
                                  key={star} 
                                  className={star <= review.rating ? 'filled' : ''} 
                                  style={{ color: star <= review.rating ? '#ffa41c' : '#ddd' }}
                                />
                              ))}
                            </div>
                            <span className="review-author">{review.author}</span>
                            <span className="review-date">{new Date(review.date).toLocaleDateString()}</span>
                          </div>
                          <p className="review-text">{review.text}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No reviews yet. Be the first to review this product!</p>
                  )}
                </motion.div>
              )}

              {activeTab === 'shipping' && (
                <motion.div
                  key="shipping"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="tab-panel"
                >
                  <h3>Shipping & Returns</h3>
                  <div className="shipping-info">
                    <h4>Shipping Information</h4>
                    <ul>
                      <li>Free delivery on orders above ₹999</li>
                      <li>Standard delivery: 3-5 business days</li>
                      <li>Express delivery available for additional cost</li>
                      <li>Orders processed within 24 hours</li>
                    </ul>
                    
                    <h4>Return Policy</h4>
                    <ul>
                      <li>10 days return policy from delivery date</li>
                      <li>Full refund for unused items in original packaging</li>
                      <li>Free returns for defective items</li>
                      <li>Size exchange available within return period</li>
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>


      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div className="image-modal" onClick={() => setShowImageModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowImageModal(false)}>
              ×
            </button>
            <div className="modal-image-container">
              <img src={images[currentImageIndex]} alt={product.name} />
            </div>
            {hasMultipleImages && (
              <div className="modal-navigation">
                <button onClick={prevImage} disabled={currentImageIndex === 0}>
                  <FiChevronLeft />
                </button>
                <span>{currentImageIndex + 1} of {images.length}</span>
                <button onClick={nextImage} disabled={currentImageIndex === images.length - 1}>
                  <FiChevronRight />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
