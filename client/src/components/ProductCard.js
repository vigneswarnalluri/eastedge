import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { FiHeart, FiEye, FiShoppingCart, FiImage } from 'react-icons/fi';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Check if product is in wishlist on component mount
  useEffect(() => {
    setIsWishlisted(isInWishlist(product._id));
  }, [product._id, isInWishlist]);

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product, 1);
  };

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
          {product.stockQuantity !== undefined && (
            <span className={`tag stock ${product.stockQuantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
              {product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
          )}
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
          <button className="add-to-cart-btn" onClick={handleAddToCart}>
            <FiShoppingCart />
            Add to cart
          </button>
          
          <Link to={`/products/${product._id}`} className="view-btn">
            <FiEye />
            View
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
