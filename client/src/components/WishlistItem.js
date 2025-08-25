import React from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiTrash2, FiShoppingCart, FiEye } from 'react-icons/fi';
import './WishlistItem.css';

const WishlistItem = ({ item, onRemove, onMoveToCart, onView }) => {
  // Safety check - ensure item is valid
  if (!item || typeof item !== 'object') {
    console.error('WishlistItem received invalid item:', item);
    return null;
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Recently';
    }
  };

  return (
    <div className="wishlist-item">
      <div className="wishlist-item-image">
                 <img 
           src={item.image || '/placeholder-product.jpg'} 
           alt={typeof item.name === 'string' ? item.name : 'Product'}
           onError={(e) => {
             e.target.src = '/placeholder-product.jpg';
           }}
         />
                 <div className="wishlist-item-overlay">
           <Link 
             to={`/products/${item._id}`}
             className="overlay-btn view-btn"
             title="View Product"
           >
             <FiEye />
           </Link>
         </div>
      </div>

      <div className="wishlist-item-content">
        <div className="wishlist-item-info">
                     <h4 className="wishlist-item-name">
             <Link to={`/products/${item._id}`}>
               {typeof item.name === 'string' ? item.name : 'Product Name'}
             </Link>
           </h4>
                     <p className="wishlist-item-category">
             {typeof item.category === 'string' ? item.category : 'Uncategorized'}
           </p>
           <p className="wishlist-item-description">
             {typeof item.description === 'string' ? 
               (item.description.length > 100 ? 
                 `${item.description.substring(0, 100)}...` : 
                 item.description
               ) : 
               'No description available'
             }
           </p>
          <div className="wishlist-item-meta">
            <span className="added-date">
              Added: {item.addedAt ? formatDate(item.addedAt) : 'Recently'}
            </span>
            {item.price && (
              <span className="item-price">
                ₹{typeof item.price === 'number' ? item.price.toFixed(2) : '0.00'}
              </span>
            )}
          </div>
        </div>

                 <div className="wishlist-item-actions">
           <button 
             className="action-btn move-to-cart-btn"
             onClick={() => onMoveToCart && onMoveToCart(item._id)}
             title="Move to Cart"
           >
             <FiShoppingCart />
             <span>Move to Cart</span>
           </button>
           
           <button 
             className="action-btn remove-btn"
             onClick={() => onRemove && onRemove(item._id)}
             title="Remove from Wishlist"
           >
             <FiTrash2 />
             <span>Remove</span>
           </button>
         </div>
      </div>

      <div className="wishlist-item-status">
        <div className="status-indicator">
          <FiHeart className="heart-icon" />
          <span>Wishlisted</span>
        </div>
      </div>
    </div>
  );
};

export default WishlistItem;
