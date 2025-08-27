import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
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
  const { isAuthenticated } = useAuth();
  
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
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: ''
  });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
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

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/products/${id}`);
      console.log('Product data received:', response.data);
      console.log('Product sizes:', response.data.sizes);
      console.log('Product colors:', response.data.colors);
      console.log('Product images:', response.data.images);
      console.log('Product variants:', response.data.variants);
      setProduct(response.data);
        
        // Set default selections
      if (response.data.sizes && Array.isArray(response.data.sizes) && response.data.sizes.length > 0) {
        console.log('Setting default size to:', response.data.sizes[0]);
        setSelectedSize(response.data.sizes[0]);
      } else if (response.data.sizes && typeof response.data.sizes === 'string') {
        // Handle case where sizes might be a string
        const sizeArray = response.data.sizes.split(',').map(s => s.trim()).filter(s => s);
        console.log('Sizes is a string, converted to array:', sizeArray);
        if (sizeArray.length > 0) {
          setSelectedSize(sizeArray[0]);
        }
      } else {
        console.log('No valid sizes found in response');
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

  useEffect(() => {
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
      const response = await api.get(`/api/products/${productId}`);
      if (response.data && response.data.reviews) {
        setReviews(response.data.reviews);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  // Submit review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      alert('Please login to submit a review');
      return;
    }
    
    if (!reviewForm.comment.trim()) {
      alert('Please enter a review comment');
      return;
    }
    
    try {
      setSubmittingReview(true);
      const response = await api.post(`/api/products/${product._id}/reviews`, {
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim()
      });
      
      if (response.data.message === 'Review added successfully') {
        alert('Review submitted successfully!');
        setReviewForm({ rating: 5, comment: '' });
        setShowReviewForm(false);
        // Refresh reviews and product data
        fetchReviews(product._id);
        fetchProduct();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
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
      // Find the specific variant to get detailed information
      let variantInfo = null;
      if (product.variants && Array.isArray(product.variants)) {
        variantInfo = product.variants.find(v => 
          v.size === selectedSize && v.color === selectedColor
        );
      }
      
      const cartItem = {
        ...product,
        selectedSize,
        selectedColor,
        quantity: currentQuantity, // Use the ref value
        // Add variant-specific information
        variantPrice: variantInfo?.price || product.price,
        variantStock: variantInfo?.stock || 0,
        // Add category information
        category: product.category || product.categoryName,
        categoryName: product.categoryName || product.category
      };
      console.log('Cart item being created:', cartItem);
      console.log('Final quantity being sent to cart:', cartItem.quantity);
      console.log('Variant info found:', variantInfo);
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
      // Find the specific variant to get detailed information
      let variantInfo = null;
      if (product.variants && Array.isArray(product.variants)) {
        variantInfo = product.variants.find(v => 
          v.size === selectedSize && v.color === selectedColor
        );
      }
      
      addToCart({
        ...product,
        selectedSize,
        selectedColor,
        quantity,
        // Add variant-specific information
        variantPrice: variantInfo?.price || product.price,
        variantStock: variantInfo?.stock || 0,
        // Add category information
        category: product.category || product.categoryName,
        categoryName: product.categoryName || product.category
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
    // Check if we have variants with stock
    if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
      const totalStock = product.variants.reduce((sum, variant) => sum + (variant.stock || 0), 0);
      if (totalStock <= 0) {
        return { status: 'out-of-stock', text: 'Out of Stock' };
      } else if (totalStock <= 10) {
        return { status: 'low-stock', text: `Low Stock (${totalStock} available)` };
      } else {
        return { status: 'in-stock', text: `In Stock (${totalStock} available)` };
      }
    }
    
    // Fallback to old stockQuantity if no variants
    if (!product.stockQuantity || product.stockQuantity <= 0) {
      return { status: 'out-of-stock', text: 'Out of Stock' };
    } else if (product.stockQuantity <= 10) {
      return { status: 'low-stock', text: `Low Stock (${product.stockQuantity} available)` };
    } else {
      return { status: 'in-stock', text: `In Stock (${product.stockQuantity} available)` };
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
  const images = (() => {
    // First check if we have multiple images
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images;
    }
    // If no images array, check if we have a main image
    if (product.image) {
      return [product.image];
    }
    // Fallback to empty array
    return [];
  })();
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
                  {(() => {
                    console.log('Rendering sizes section. Product sizes:', product.sizes);
                    console.log('Product variants:', product.variants);
                    
                    // Only show sizes that have variants with stock
                    let sizesToRender = [];
                    if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
                      // Get unique sizes from variants that have stock
                      const sizesWithStock = [...new Set(
                        product.variants
                          .filter(variant => variant.stock > 0 && variant.size)
                          .map(variant => variant.size)
                      )];
                      sizesToRender = sizesWithStock;
                    } else if (product.sizes && Array.isArray(product.sizes)) {
                      // Fallback to sizes array if no variants
                      sizesToRender = product.sizes.filter(size => size && size.trim() !== '');
                    } else if (product.sizes && typeof product.sizes === 'string') {
                      // If sizes is a string, split by comma
                      sizesToRender = product.sizes.split(',').map(s => s.trim()).filter(s => s);
                    }
                    
                    console.log('Sizes to render (with stock):', sizesToRender);
                    
                    if (sizesToRender.length > 0) {
                      return (
                        <div className="option-group">
                          <label className="option-label">Size:</label>
                          <div className="option-selection">
                            {selectedSize ? `Selected: ${selectedSize}` : 'Select a size'}
                          </div>
                          <div className="size-options">
                            {sizesToRender.map(size => (
                              <button
                                key={size}
                                className={`size-option ${selectedSize === size ? 'selected' : ''}`}
                                onClick={() => {
                                  console.log('Size selected:', size);
                                  setSelectedSize(size);
                                }}
                                style={{
                                  padding: '12px 20px',
                                  fontSize: '16px',
                                  fontWeight: '600',
                                  border: selectedSize === size ? '2px solid #059669' : '2px solid #ddd',
                                  backgroundColor: selectedSize === size ? '#059669' : 'white',
                                  color: selectedSize === size ? 'white' : '#333',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  transition: 'all 0.3s ease',
                                  minWidth: '50px',
                                  textAlign: 'center'
                                }}
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                          {/* Debug info */}
                          <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                            Available sizes with stock: {sizesToRender.join(', ')}
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div className="option-group">
                          <label className="option-label">Size:</label>
                          <div className="option-selection">
                            No sizes available
                          </div>
                          <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                            Debug: product.sizes = {JSON.stringify(product.sizes)}, variants = {JSON.stringify(product.variants)}
                          </div>
                        </div>
                      );
                    }
                  })()}

                  {/* Color Selection */}
                  {(() => {
                    console.log('Rendering colors section. Product colors:', product.colors);
                    console.log('Product variants:', product.variants);
                    
                    // Only show colors that have variants with stock
                    let colorsToRender = [];
                    if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
                      // Get unique colors from variants that have stock
                      const colorsWithStock = [...new Set(
                        product.variants
                          .filter(variant => variant.stock > 0 && variant.color)
                          .map(variant => variant.color)
                      )];
                      colorsToRender = colorsWithStock;
                    } else if (product.colors && Array.isArray(product.colors)) {
                      // Fallback to colors array if no variants
                      colorsToRender = product.colors.filter(color => color && color !== '');
                    } else if (product.colors && typeof product.colors === 'string') {
                      // If colors is a string, split by comma
                      colorsToRender = product.colors.split(',').map(c => c.trim()).filter(c => c);
                    }
                    
                    console.log('Colors to render (with stock):', colorsToRender);
                    
                    if (colorsToRender.length > 0) {
                      return (
                        <div className="option-group">
                          <label className="option-label">Colour:</label>
                          <div className="option-selection">
                            {selectedColor ? `Selected: ${selectedColor}` : 'Make a Colour selection'}
                          </div>
                          <div className="color-options">
                            {colorsToRender.map(color => {
                              // Handle different color formats
                              let colorName, colorValue;
                              if (typeof color === 'string') {
                                colorName = color;
                                colorValue = color.toLowerCase();
                              } else if (color && typeof color === 'object') {
                                colorName = color.name || color.color || color.value || 'Unknown';
                                colorValue = color.hex || color.code || color.name || 'gray';
                              }
                              
                              // Ensure colorValue is a valid CSS color
                              if (!colorValue || colorValue === 'gray') {
                                colorValue = '#808080'; // Default gray
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
                                    border: selectedColor === colorName ? '3px solid #059669' : '2px solid #ddd',
                                    width: '35px',
                                    height: '35px',
                                    borderRadius: '50%',
                                    margin: '5px',
                                    cursor: 'pointer',
                                    position: 'relative'
                                  }}
                                  title={colorName}
                              >
                                {selectedColor === colorName && (
                                  <FiCheck 
                                    style={{ 
                                      position: 'absolute', 
                                      top: '50%', 
                                      left: '50%', 
                                      transform: 'translate(-50%, -50%)',
                                      color: 'white',
                                      fontSize: '16px',
                                      filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.8))'
                                    }} 
                                  />
                                )}
                              </button>
                              );
                            })}
                          </div>
                          {/* Debug info */}
                          <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                            Available colors with stock: {colorsToRender.map(color => {
                              if (typeof color === 'string') return color;
                              return color.name || color.color || color.value || 'Unknown';
                            }).join(', ')}
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div className="option-group">
                          <label className="option-label">Colour:</label>
                          <div className="option-selection">
                            No colors available
                          </div>
                          <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                            Debug: product.colors = {JSON.stringify(product.colors)}, variants = {JSON.stringify(product.variants)}
                          </div>
                        </div>
                      );
                    }
                  })()}
                  
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
                        max={(() => {
                          if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
                            const totalStock = product.variants.reduce((sum, variant) => sum + (variant.stock || 0), 0);
                            return totalStock || 99;
                          }
                          return product.stockQuantity || 99;
                        })()}
                      />
                      <button 
                        onClick={() => {
                          const newQuantity = quantity + 1;
                          console.log('Increasing quantity from', quantity, 'to', newQuantity);
                          setQuantity(newQuantity);
                        }}
                        className="quantity-btn"
                        disabled={(() => {
                          if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
                            const totalStock = product.variants.reduce((sum, variant) => sum + (variant.stock || 0), 0);
                            return totalStock && quantity >= totalStock;
                          }
                          return product.stockQuantity && quantity >= product.stockQuantity;
                        })()}
                      >
                        +
                      </button>
                    </div>

                    {(() => {
                      if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
                        const totalStock = product.variants.reduce((sum, variant) => sum + (variant.stock || 0), 0);
                        return totalStock > 0 ? (
                          <div className="max-quantity">
                            Max: {totalStock}
                          </div>
                        ) : null;
                      }
                      return product.stockQuantity ? (
                        <div className="max-quantity">
                          Max: {product.stockQuantity}
                        </div>
                      ) : null;
                    })()}
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
                  <div className="reviews-section">
                    <div className="reviews-header">
                      <h3>Customer Reviews</h3>
                      {isAuthenticated && (
                        <button 
                          className="write-review-btn"
                          onClick={() => setShowReviewForm(!showReviewForm)}
                        >
                          {showReviewForm ? 'Cancel' : 'Write a Review'}
                        </button>
                      )}
                    </div>

                    {/* Review Submission Form */}
                    {showReviewForm && isAuthenticated && (
                      <motion.div 
                        className="review-form-container"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <form onSubmit={handleSubmitReview} className="review-form">
                          <div className="form-group">
                            <label>Rating:</label>
                            <div className="rating-input">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  className={`star-btn ${star <= reviewForm.rating ? 'filled' : ''}`}
                                  onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                >
                                  ★
                                </button>
                              ))}
                              <span className="rating-text">({reviewForm.rating} stars)</span>
                            </div>
                          </div>
                          
                          <div className="form-group">
                            <label htmlFor="review-comment">Your Review:</label>
                            <textarea
                              id="review-comment"
                              value={reviewForm.comment}
                              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                              placeholder="Share your thoughts about this product..."
                              rows="4"
                              required
                            />
                          </div>
                          
                          <button 
                            type="submit" 
                            className="submit-review-btn"
                            disabled={submittingReview}
                          >
                            {submittingReview ? 'Submitting...' : 'Submit Review'}
                          </button>
                        </form>
                      </motion.div>
                    )}

                    {/* Reviews List */}
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
                              <span className="review-author">{review.name}</span>
                              <span className="review-date">
                                {new Date(review.createdAt || review.date).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="review-text">{review.comment}</p>
                            
                            {/* Admin Reply */}
                            {review.adminReply && (
                              <div className="admin-reply">
                                <div className="admin-reply-header">
                                  <strong>Admin Response:</strong>
                                  <span className="reply-date">
                                    {new Date(review.adminReplyDate).toLocaleDateString()}
                                  </span>
                                </div>
                                <p>{review.adminReply}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-reviews">
                        <p>No reviews yet. Be the first to review this product!</p>
                        {!isAuthenticated && (
                          <p className="login-prompt">
                            <Link to="/login">Login</Link> to write a review
                          </p>
                        )}
                      </div>
                    )}
                  </div>
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
