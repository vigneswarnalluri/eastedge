import React, { useState, useEffect } from 'react';
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
          const validColors = response.data.colors.filter(color => color && typeof color === 'string');
          if (validColors.length > 0) {
            setSelectedColor(validColors[0]);
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

  const handleAddToCart = () => {
    if (product && selectedSize && selectedColor) {
      addToCart({
        ...product,
        selectedSize,
        selectedColor,
        quantity
      });
    } else {
      alert('Please select size and color before adding to cart');
    }
  };

  const handleBuyNow = () => {
    if (product && selectedSize && selectedColor) {
      addToCart({
        ...product,
        selectedSize,
        selectedColor,
        quantity
      });
    } else {
      alert('Please select size and color before proceeding');
    }
    navigate('/checkout');
  };

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
                        {product.colors.filter(color => color && typeof color === 'string').map(color => (
                          <button
                            key={color}
                            className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                            onClick={() => setSelectedColor(color)}
                            style={{ backgroundColor: color.toLowerCase() }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Quantity Selector */}
                  <div className="option-group">
                    <label className="option-label">Quantity:</label>
                    <div className="quantity-controls">
                      <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="quantity-btn"
                        disabled={quantity <= 1}
                      >
                        -
                      </button>
                      <input 
                        type="number" 
                        value={quantity} 
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="quantity-input"
                        min="1"
                        max={product.stockQuantity || 99}
                      />
                      <button 
                        onClick={() => setQuantity(quantity + 1)}
                        className="quantity-btn"
                        disabled={product.stockQuantity && quantity >= product.stockQuantity}
                      >
                        +
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
