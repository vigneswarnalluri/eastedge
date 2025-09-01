import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiStar, 
  FiArrowLeft,
  FiCheck
} from 'react-icons/fi';
import './ProductDetail.css';
import api from '../services/api';
import { scrollToTop } from '../utils/scrollToTop';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const { isAuthenticated } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showImageModal, setShowImageModal] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: ''
  });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  // Use ref to track current quantity (bypasses React Strict Mode issues)
  const quantityRef = useRef(1);

  // Update ref whenever quantity state changes
  useEffect(() => {
    quantityRef.current = quantity;
  }, [quantity]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/products/${id}`);
      

      
      setProduct(response.data);
        
        // Set default selections
      if (response.data.sizes && Array.isArray(response.data.sizes) && response.data.sizes.length > 0) {
        setSelectedSize(response.data.sizes[0]);
      } else if (response.data.sizes && typeof response.data.sizes === 'string') {
        // Handle case where sizes might be a string
        const sizeArray = response.data.sizes.split(',').map(s => s.trim()).filter(s => s);
        if (sizeArray.length > 0) {
          setSelectedSize(sizeArray[0]);
        }
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
    // Ensure page scrolls to top when component mounts
    scrollToTop();
  }, [id]);

  useEffect(() => {
    if (product) {
      // Fetch reviews for this product
      fetchReviews(product._id);
      
      // Fetch related products
      console.log('🔍 Product data for related products:', {
        category: product.category,
        categoryId: product.categoryId,
        categoryName: product.categoryName,
        _id: product._id
      });
      
      // Try multiple category field names
      let categoryToUse = null;
      if (product.category) categoryToUse = product.category;
      else if (product.categoryId) categoryToUse = product.categoryId;
      else if (product.categoryName) categoryToUse = product.categoryName;
      
      if (categoryToUse) {
        console.log('✅ Found category:', categoryToUse);
        // Try category-based search first with timeout fallback
        fetchRelatedProducts(categoryToUse, product._id);
        
        // Set a timeout to fall back to random products if category search takes too long
        setTimeout(() => {
          if (relatedProducts.length === 0 && !loadingRelated) {
            console.log('⏰ Category search timeout, falling back to random products');
            fetchRandomProducts(product._id);
          }
        }, 3000); // 3 second timeout
      } else {
        console.log('❌ No category found for product');
        // Fetch random products as fallback
        fetchRandomProducts(product._id);
      }
      
      // Reset currentImageIndex when product changes
      if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        setCurrentImageIndex(0);
      } else if (product.image) {
        setCurrentImageIndex(0);
      }
    }
  }, [product]);



  const fetchReviews = async (productId) => {
    try {
      const response = await api.get(`/api/reviews/product/${productId}`);
      if (response.data && response.data.success && response.data.reviews) {
        setReviews(response.data.reviews);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchRelatedProducts = async (categoryId, currentProductId) => {
    try {
      setLoadingRelated(true);
      console.log('🔍 Fetching related products for category:', categoryId);
      
      const response = await api.get(`/api/products?category=${categoryId}&limit=8`);
      console.log('📦 Related products API response:', response.data);
      
      if (response.data && response.data.products) {
        // Filter out the current product and limit to 6 products
        const filtered = response.data.products
          .filter(product => product._id !== currentProductId)
          .slice(0, 6);
        
        console.log('✅ Filtered related products:', filtered);
        setRelatedProducts(filtered);
      } else {
        console.log('❌ No products found in response');
        setRelatedProducts([]);
      }
    } catch (error) {
      console.error('❌ Error fetching related products:', error);
      setRelatedProducts([]);
    } finally {
      setLoadingRelated(false);
    }
  };

  const fetchRandomProducts = async (currentProductId) => {
    try {
      setLoadingRelated(true);
      console.log('🎲 Fetching random products as fallback');
      
      // Try different API endpoints to get products
      let response;
      try {
        response = await api.get('/api/products?limit=20');
      } catch (error) {
        console.log('❌ First API call failed, trying without limit');
        response = await api.get('/api/products');
      }
      
      console.log('📦 Random products API response:', response.data);
      
      if (response.data && response.data.products) {
        // Filter out the current product and limit to 6 products
        const filtered = response.data.products
          .filter(product => product._id !== currentProductId)
          .slice(0, 6);
        
        console.log('✅ Filtered random products:', filtered);
        setRelatedProducts(filtered);
      } else {
        console.log('❌ No random products found');
        setRelatedProducts([]);
      }
    } catch (error) {
      console.error('❌ Error fetching random products:', error);
      setRelatedProducts([]);
    } finally {
      setLoadingRelated(false);
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
      const response = await api.post(`/api/reviews`, {
        productId: product._id,
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim()
      });
      
      if (response.data.success && response.data.message === 'Review submitted successfully') {
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
    if (product && selectedSize && selectedColor) {
      // Find the specific variant to get detailed information
      let variantInfo = null;
      if (product.variants && Array.isArray(product.variants)) {
        variantInfo = product.variants.find(v => 
          v.size === selectedSize && v.color === selectedColor
        );
      }
      
      const pricing = getCurrentPricing();
      
             const cartItem = {
         ...product,
         selectedSize,
         selectedColor,
         quantity: quantityRef.current, // Use the ref value
         // Use only the current price for cart display
         price: pricing.currentPrice,
         // Store original price for reference only
         originalPrice: pricing.originalPrice,
         variantStock: variantInfo?.stock || 0,
         // Add category information
         category: product.category || product.categoryName,
         categoryName: product.categoryName || product.category
       };
      addToCart(cartItem);
    } else {
      let missingOptions = [];
      if (!selectedSize) missingOptions.push('size');
      if (!selectedColor) missingOptions.push('color');
      alert(`Please select ${missingOptions.join(' and ')} before adding to cart`);
    }
  }, [product, selectedSize, selectedColor, quantity, addToCart]); // Remove getCurrentPricing from dependencies

  const handleBuyNow = useCallback(() => {
    if (product && selectedSize && selectedColor) {
      // Find the specific variant to get detailed information
      let variantInfo = null;
      if (product.variants && Array.isArray(product.variants)) {
        variantInfo = product.variants.find(v => 
          v.size === selectedSize && v.color === selectedColor
        );
      }
      
      const pricing = getCurrentPricing();
      
             addToCart({
         ...product,
         selectedSize,
         selectedColor,
         quantity,
         // Use only the current price for cart display
         price: pricing.currentPrice,
         // Store original price for reference only
         originalPrice: pricing.originalPrice,
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
  }, [product, selectedSize, selectedColor, quantity, navigate, addToCart]); // Remove getCurrentPricing from dependencies



  const handleThumbnailHover = (index) => {
    setCurrentImageIndex(index);
  };

  const handleImageClick = (index) => {
    setCurrentImageIndex(index);
    setShowImageModal(true);
  };

  // Get current pricing based on selected variant
  const getCurrentPricing = () => {
    // If we have variants and both size and color are selected, find the specific variant
    if (product.variants && Array.isArray(product.variants) && product.variants.length > 0 && selectedSize && selectedColor) {
      const selectedVariant = product.variants.find(v => 
        v.size === selectedSize && v.color === selectedColor
      );
      
      if (selectedVariant && selectedVariant.price) {
        // Use variant price as current price
        const variantPrice = selectedVariant.price;
        const basePrice = product.price;
        const productSalePrice = product.salePrice;
        
        // Determine if this variant price is a discount
        let originalPrice = null;
        let hasDiscount = false;
        
        // Compare variant price with both base price and product sale price
        if (productSalePrice && variantPrice < productSalePrice) {
          // Variant is cheaper than product sale price
          originalPrice = productSalePrice;
          hasDiscount = true;
        } else if (variantPrice < basePrice) {
          // Variant is cheaper than base price
          originalPrice = basePrice;
          hasDiscount = true;
        }
        
        return {
          currentPrice: variantPrice,
          originalPrice: originalPrice,
          salePrice: hasDiscount ? variantPrice : null,
          hasDiscount: hasDiscount
        };
      }
    }
    
    // If only size is selected, try to find any variant with that size
    if (product.variants && Array.isArray(product.variants) && product.variants.length > 0 && selectedSize && !selectedColor) {
      const sizeVariants = product.variants.filter(v => v.size === selectedSize);
      if (sizeVariants.length > 0) {
        // Use the first variant price for this size
        const variantPrice = sizeVariants[0].price;
        const basePrice = product.price;
        const productSalePrice = product.salePrice;
        
        // Compare with both base price and product sale price
        let originalPrice = null;
        let hasDiscount = false;
        
        if (productSalePrice && variantPrice < productSalePrice) {
          originalPrice = productSalePrice;
          hasDiscount = true;
        } else if (variantPrice < basePrice) {
          originalPrice = basePrice;
          hasDiscount = true;
        }
        
        return {
          currentPrice: variantPrice,
          originalPrice: originalPrice,
          salePrice: hasDiscount ? variantPrice : null,
          hasDiscount: hasDiscount
        };
      }
    }
    
    // Fallback to product-level pricing - check if there's a sale price
    const hasProductSale = product.salePrice && product.salePrice < product.price;
    
    return {
      currentPrice: hasProductSale ? product.salePrice : product.price,
      originalPrice: hasProductSale ? product.price : null,
      salePrice: hasProductSale ? product.salePrice : null,
      hasDiscount: hasProductSale
    };
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
    if (product?.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images;
    }
    // If no images array, check if we have a main image
    if (product?.image) {
      return [product.image];
    }
    // Fallback to empty array
    return [];
  })();
  const hasMultipleImages = images.length > 1;
  
  // Safety check for currentImageIndex
  const safeCurrentImageIndex = Math.min(currentImageIndex, Math.max(0, images.length - 1));

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
            {/* Thumbnail Gallery - Left Side */}
            {hasMultipleImages && (
              <div className="thumbnail-gallery-left">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className={`thumbnail ${index === safeCurrentImageIndex ? 'active' : ''}`}
                    onMouseEnter={() => handleThumbnailHover(index)}
                  >
                    <img 
                      src={image} 
                      alt={`${product.name} ${index + 1}`}
                      onError={(e) => {
                        e.target.src = '/placeholder-product.png';
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Main Image Container - Right Side */}
            <div className="main-image-container">
              <div className="main-image" onClick={() => handleImageClick(safeCurrentImageIndex)}>
                <img 
                  src={images[safeCurrentImageIndex] || images[0] || '/placeholder-product.png'} 
                  alt={product.name}
                  onError={(e) => {
                    e.target.src = '/placeholder-product.png';
                  }}
                />
              </div>
            </div>
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
                  <span className="rating-stars">
                    {product.rating || 0} out of 5 stars
                  </span>
                </div>
                <Link to="#reviews" className="review-count">
                  {reviews.length} ratings
                </Link>
              </div>
            </div>

            {/* Hero Section - Options and Actions Side by Side - MOVED UP */}
            <div className="product-actions-section hero-actions">
              <div className="hero-layout">
                {/* Left Side - Product Options */}
                <div className="hero-options">
                  {/* Size Selection */}
                  {(() => {
                    
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

                        </div>
                      );
                    } else {
                      return (
                        <div className="option-group">
                          <label className="option-label">Size:</label>
                          <div className="option-selection">
                            No sizes available
                          </div>

                        </div>
                      );
                    }
                  })()}

                  {/* Color Selection */}
                  {(() => {
                    
                    // Only show colors that have variants with stock for the selected size
                    let colorsToRender = [];
                    if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
                      // If a size is selected, only show colors available for that size
                      let variantsToCheck = product.variants;
                      if (selectedSize) {
                        variantsToCheck = product.variants.filter(variant => variant.size === selectedSize);
                      }
                      
                      // Get unique colors from filtered variants that have stock
                      const colorsWithStock = [...new Set(
                        variantsToCheck
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

                        </div>
                      );
                    } else {
                      return (
                        <div className="option-group">
                          <label className="option-label">Colour:</label>
                          <div className="option-selection">
                            No colors available
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

                {/* Right Side - Price and Action Buttons */}
                <div className="hero-actions-right">
                  {/* Price Section - DYNAMIC PRICING */}
                  <div className="price-section-inline">
                    {(() => {
                      const pricing = getCurrentPricing();
                      

                      
                      return (
                        <>
                          {pricing.hasDiscount && pricing.originalPrice && (
                            <div style={{ marginBottom: '0.5rem' }}>
                              <span className="original-price-striked">₹{pricing.originalPrice.toLocaleString()}</span>
                              <span className="discount-badge">
                                -{Math.round(((pricing.originalPrice - pricing.currentPrice) / pricing.originalPrice) * 100)}%
                              </span>
                            </div>
                          )}
                          <div className={`current-price ${pricing.hasDiscount ? 'sale-price' : ''}`}>
                            ₹{pricing.currentPrice.toLocaleString()}
                          </div>
                          <div style={{ fontSize: '0.9rem', color: '#666' }}>
                            Inclusive of all taxes
                          </div>
                          {selectedSize && selectedColor && (
                            <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.25rem' }}>
                              Price for {selectedSize}, {selectedColor}
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>

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
                </div>
              </div>
            </div>









            {/* Security and Delivery Section */}
            {/* Removed Delivery & Returns section as requested */}
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
              className={`tab-btn ${activeTab === 'wash-details' ? 'active' : ''}`}
              onClick={() => setActiveTab('wash-details')}
            >
              Wash Details
            </button>
            <button 
              className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews ({reviews.length})
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



              {activeTab === 'wash-details' && (
                <motion.div
                  key="wash-details"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="tab-panel"
                >
                  <h3>Wash & Care Instructions</h3>
                  
                  {product.washDetails ? (
                    <div className="wash-details-content">
                      {product.washDetails.washing && (
                        <div className="wash-section">
                          <h4>Washing Instructions</h4>
                          <p>{product.washDetails.washing}</p>
                        </div>
                      )}
                      
                      {product.washDetails.drying && (
                        <div className="wash-section">
                          <h4>Drying Instructions</h4>
                          <p>{product.washDetails.drying}</p>
                        </div>
                      )}
                      
                      {product.washDetails.ironing && (
                        <div className="wash-section">
                          <h4>Ironing Instructions</h4>
                          <p>{product.washDetails.ironing}</p>
                        </div>
                      )}
                      
                      {product.washDetails.bleaching && (
                        <div className="wash-section">
                          <h4>Bleaching Instructions</h4>
                          <p>{product.washDetails.bleaching}</p>
                        </div>
                      )}
                      
                      {product.washDetails.dryCleaning && (
                        <div className="wash-section">
                          <h4>Dry Cleaning Instructions</h4>
                          <p>{product.washDetails.dryCleaning}</p>
                        </div>
                      )}
                      
                      {product.washDetails.additionalCare && (
                        <div className="wash-section">
                          <h4>Additional Care Tips</h4>
                          <p>{product.washDetails.additionalCare}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="no-wash-details">
                      <p>Wash and care instructions not available for this product.</p>
                      <p>Please refer to the product label or contact customer support for care instructions.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Related Products Section */}
        <div className="related-products-section">
          <div className="section-header">
            <h2>Related Products</h2>
            <p>You might also like these products</p>
          </div>
          

          
          {relatedProducts.length > 0 ? (
            <div className="related-products-grid">
              {relatedProducts.map((relatedProduct) => (
                <div key={relatedProduct._id} className="related-product-card">
                  <div className="product-image">
                    <img 
                      src={relatedProduct.image || relatedProduct.images?.[0] || '/placeholder-product.png'} 
                      alt={relatedProduct.name}
                      onError={(e) => {
                        e.target.src = '/placeholder-product.png';
                      }}
                    />
                  </div>
                  
                  <div className="product-info">
                    <h3 className="product-name">{relatedProduct.name}</h3>
                    <div className="product-price">
                      {relatedProduct.originalPrice && relatedProduct.originalPrice > relatedProduct.price ? (
                        <>
                          <span className="current-price">₹{relatedProduct.price.toLocaleString()}</span>
                          <span className="original-price">₹{relatedProduct.originalPrice.toLocaleString()}</span>
                        </>
                      ) : (
                        <span className="current-price">₹{relatedProduct.price.toLocaleString()}</span>
                      )}
                    </div>
                    
                    <div className="product-rating">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FiStar 
                          key={star} 
                          className={star <= (relatedProduct.rating || 0) ? 'filled' : ''} 
                          style={{ color: star <= (relatedProduct.rating || 0) ? '#ffa41c' : '#ddd' }}
                        />
                      ))}
                      <span className="rating-text">({relatedProduct.rating || 0})</span>
                    </div>
                    
                    <button 
                      className="view-product-btn"
                      onClick={() => navigate(`/products/${relatedProduct._id}`)}
                    >
                      View Product
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '2rem', 
              color: '#666',
              fontSize: '16px'
            }}>
              {loadingRelated ? 'Loading related products...' : 'No related products found'}
            </div>
          )}
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
              <img 
                src={images[safeCurrentImageIndex] || images[0] || '/placeholder-product.png'} 
                alt={product.name}
                onError={(e) => {
                  e.target.src = '/placeholder-product.png';
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
