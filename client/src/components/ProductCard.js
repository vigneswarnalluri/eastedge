import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { FiHeart, FiImage } from 'react-icons/fi';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Debug: Log product data when component renders
  useEffect(() => {
    console.log(`🎯 ProductCard rendered for ${product.name}:`, {
      id: product._id,
      name: product.name,
      hasVariants: !!(product.variants && Array.isArray(product.variants)),
      variantsCount: product.variants?.length || 0,
      stockQuantity: product.stockQuantity,
      category: product.category,
      categoryName: product.categoryName,
      price: product.price,
      fullProduct: product
    });
  }, [product]);

  // Check if product is in wishlist on component mount
  useEffect(() => {
    setIsWishlisted(isInWishlist(product._id));
  }, [product._id, isInWishlist]);

  const handleWishlist = (e) => {
    e.preventDefault();
    if (isWishlisted) {
      removeFromWishlist(product._id);
      setIsWishlisted(false);
      console.log('Removed from wishlist:', product.name);
    } else {
      addToWishlist(product);
      setIsWishlisted(true);
      console.log('Added to wishlist:', product.name);
    }
  };

  // Function to truncate description
  const truncateDescription = (text, maxLength = 120) => {
    if (!text || typeof text !== 'string') return "Premium quality product with exceptional design and comfort.";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  // Function to get product image
  const getProductImage = () => {
    if (imageError) {
      console.log('Image error state, returning null for product:', product.name);
      return null;
    }
    
    // Try to get image from product.image first
    if (product.image && typeof product.image === 'string') {
      let imageUrl;
      // If it's already an absolute URL, use it as is
      if (product.image.startsWith('http')) {
        imageUrl = product.image;
      }
      // If it's a relative path, make it absolute
      else if (product.image.startsWith('/')) {
        imageUrl = `${window.location.origin}${product.image}`;
      }
      // If it's just a filename, add the public path
      else {
        imageUrl = `${window.location.origin}/${product.image}`;
      }
      console.log('Using product.image:', imageUrl);
      return imageUrl;
    }
    
    // Try to get image from product.images array
    if (Array.isArray(product.images) && product.images.length > 0) {
      const firstImage = product.images[0];
      if (typeof firstImage === 'string') {
        let imageUrl;
        if (firstImage.startsWith('http')) {
          imageUrl = firstImage;
        } else if (firstImage.startsWith('/')) {
          imageUrl = `${window.location.origin}${firstImage}`;
        } else {
          imageUrl = `${window.location.origin}/${firstImage}`;
        }
        console.log('Using product.images[0]:', imageUrl);
        return imageUrl;
      }
    }
    
    console.log('No image found for product:', product.name);
    return null;
  };

  // Function to handle image error
  const handleImageError = (e) => {
    console.error('Image failed to load for product:', product.name, 'Error:', e);
    setImageError(true);
  };

  // Function to get stock status (same logic as ProductDetail)
  const getStockStatus = () => {
    console.log(`🔍 Stock calculation for ${product.name}:`, {
      hasVariants: !!(product.variants && Array.isArray(product.variants)),
      variantsCount: product.variants?.length || 0,
      variants: product.variants,
      stockQuantity: product.stockQuantity,
      productData: product
    });

    // Check if we have variants with stock
    if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
      const totalStock = product.variants.reduce((sum, variant) => sum + (variant.stock || 0), 0);
      console.log(`📦 Variant-based stock calculation: ${totalStock} total`);
      
      if (totalStock <= 0) {
        return { status: 'out-of-stock', text: 'Out of Stock' };
      } else if (totalStock <= 10) {
        return { status: 'low-stock', text: `Low Stock (${totalStock})` };
      } else {
        return { status: 'in-stock', text: 'In Stock' };
      }
    }
    
    // Fallback to old stockQuantity if no variants
    console.log(`📦 Using stockQuantity fallback: ${product.stockQuantity}`);
    if (!product.stockQuantity || product.stockQuantity <= 0) {
      return { status: 'out-of-stock', text: 'Out of Stock' };
    } else if (product.stockQuantity <= 10) {
      return { status: 'low-stock', text: `Low Stock (${product.stockQuantity})` };
    } else {
      return { status: 'in-stock', text: 'In Stock' };
    }
  };

  // Get stock status
  const stockStatus = getStockStatus();

  return (
    <div className="product-card">
      {/* Top Section - Image Area */}
      <div className="product-image-section">
        {getProductImage() ? (
          <img 
            src={getProductImage()} 
            alt={typeof product.name === 'string' ? product.name : 'Product'}
            className="product-image"
            onError={handleImageError}
            onLoad={() => console.log('Image loaded successfully for product:', product.name)}
          />
        ) : (
          <div className="product-image-placeholder">
            <FiImage size={48} />
            <span>No Image</span>
          </div>
        )}
        
        {/* Wishlist Button */}
        <button 
          className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
          onClick={handleWishlist}
          title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          ♥
        </button>

        {/* Badges */}
        {product.newArrival && (
          <span className="badge new">New</span>
        )}
        {product.featured && (
          <span className="badge featured">Featured</span>
        )}
      </div>

      {/* Bottom Section - Product Details */}
      <div className="product-details">
        {/* Product Name */}
        <h3 className="product-name">
          <Link to={`/products/${product._id}`}>
            {typeof product.name === 'string' ? product.name : 'Product Name'}
          </Link>
        </h3>

        {/* Product Tags */}
        <div className="product-tags">
          {product.categoryName && (
            <span className="tag">{product.categoryName}</span>
          )}
          <span className={`tag stock ${stockStatus.status}`}>
            {stockStatus.text}
          </span>
        </div>

        {/* Product Description */}
        <p className="product-description">
          {truncateDescription(product.description)}
        </p>

        {/* Price Section */}
        <div className="price-section">
          <span className="price-label">PRICE</span>
          <span className="price">₹{typeof product.price === 'number' ? product.price.toLocaleString() : '0'}</span>
        </div>

        {/* Bottom Row - Buttons */}
        <div className="product-bottom">
          <Link to={`/products/${product._id}`} className="view-btn">
            <FiImage />
            View
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
