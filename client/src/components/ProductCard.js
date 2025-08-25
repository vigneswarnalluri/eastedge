import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { FiHeart, FiEye, FiShoppingCart } from 'react-icons/fi';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [isWishlisted, setIsWishlisted] = useState(false);

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



  return (
    <div className="product-card">
      {/* Top Section - Image Area */}
      <div className="product-image-section">
        <img 
          src={product.image || (Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : '/placeholder-image.jpg')} 
          alt={typeof product.name === 'string' ? product.name : 'Product'}
          className="product-image"
        />
        
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
          {typeof product.description === 'string' ? product.description : "Premium quality product with exceptional design and comfort."}
        </p>

        {/* Price Section - Moved to top */}
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
