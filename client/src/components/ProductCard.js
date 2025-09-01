import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { FiHeart, FiEye } from 'react-icons/fi';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  useEffect(() => {
    setIsWishlisted(isInWishlist(product._id));
  }, [product._id, isInWishlist]);

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishlisted) {
      removeFromWishlist(product._id);
      setIsWishlisted(false);
    } else {
      addToWishlist(product);
      setIsWishlisted(true);
    }
  };

  const handleCardClick = () => {
    navigate(`/products/${product._id}`);
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/products/${product._id}`);
  };

  const getProductImage = () => {
    if (imageError) return null;

    if (product.image && typeof product.image === 'string' && product.image.trim() !== '') {
      if (product.image.startsWith('http')) return product.image;
      if (product.image.startsWith('/')) return `${window.location.origin}${product.image}`;
      return `${window.location.origin}/${product.image}`;
    }

    if (Array.isArray(product.images) && product.images.length > 0) {
      const src = product.images[0];
      if (typeof src === 'string' && src.trim() !== '') {
        if (src.startsWith('http')) return src;
        if (src.startsWith('/')) return `${window.location.origin}${src}`;
        return `${window.location.origin}/${src}`;
      }
    }

    return null;
  };

  const handleImageError = () => setImageError(true);

  const getStockStatus = () => {
    if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
      const totalStock = product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
      if (totalStock <= 0) return { status: 'out-of-stock', text: 'Out of Stock' };
      if (totalStock <= 10) return { status: 'low-stock', text: `Only ${totalStock} left` };
      return { status: 'in-stock', text: 'In Stock' };
    }

    if (!product.stockQuantity || product.stockQuantity <= 0) return { status: 'out-of-stock', text: 'Out of Stock' };
    if (product.stockQuantity <= 10) return { status: 'low-stock', text: `Only ${product.stockQuantity} left` };
    return { status: 'in-stock', text: 'In Stock' };
  };

  const stockStatus = getStockStatus();

  return (
    <div
      className="product-card"
      onClick={handleCardClick}
      onMouseEnter={() => setShowQuickActions(true)}
      onMouseLeave={() => setShowQuickActions(false)}
    >
      <div className="product-image-container">
        {getProductImage() ? (
          <img
            src={getProductImage()}
            alt={product.name || 'Product'}
            className="product-image"
            onError={handleImageError}
          />
        ) : (
          <div className="product-image-placeholder" />
        )}

        <div className={`product-overlay ${showQuickActions ? 'show' : ''}`}>
          <button
            className="quick-action-btn wishlist-btn"
            onClick={handleWishlist}
            title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <FiHeart className={isWishlisted ? 'filled' : ''} />
          </button>
          <button
            className="quick-action-btn quick-view-btn"
            onClick={handleQuickView}
            title="Quick view"
          >
            <FiEye />
          </button>
        </div>

        <div className="product-badges">
          {product.newArrival && <span className="badge new">New</span>}
          {product.featured && <span className="badge featured">Featured</span>}
          {product.salePrice && product.salePrice < product.price && (
            <span className="badge sale">-{Math.round(((product.price - product.salePrice) / product.price) * 100)}%</span>
          )}
        </div>
      </div>

      <div className="product-content">
        <div className="category-stock-row">
          {product.categoryName && (
            <div className="product-category">{product.categoryName}</div>
          )}
          <div className={`stock-status ${stockStatus.status}`}>{stockStatus.text}</div>
        </div>

        <h3 className="product-name">{product.name || 'Product Name'}</h3>

        <div className="price-section">
          <div className="price-options-row">
            <div className="price-container">
              {product.salePrice && product.salePrice < product.price ? (
                <div className="price-with-sale">
                  <span className="current-price">₹{product.salePrice?.toLocaleString() || '0'}</span>
                  <span className="original-price">₹{product.price?.toLocaleString() || '0'}</span>
                </div>
              ) : (
                <span className="price">₹{product.price?.toLocaleString() || '0'}</span>
              )}
            </div>
            
            {/* Simple Select Options Button */}
            <button
              className={`select-options-btn ${stockStatus.status === 'out-of-stock' ? 'disabled' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate(`/products/${product._id}`);
              }}
              disabled={stockStatus.status === 'out-of-stock'}
            >
              Select Options
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
