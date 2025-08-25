import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch wishlist items from localStorage or API
  useEffect(() => {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      try {
        setWishlistItems(JSON.parse(savedWishlist));
      } catch (err) {
        console.error('Error parsing wishlist from localStorage:', err);
        setWishlistItems([]);
      }
    }
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  // Add item to wishlist
  const addToWishlist = (product) => {
    setWishlistItems(prev => {
      const exists = prev.find(item => item._id === product._id);
      if (exists) {
        return prev; // Already in wishlist
      }
      return [...prev, { ...product, addedAt: new Date().toISOString() }];
    });
  };

  // Remove item from wishlist
  const removeFromWishlist = (productId) => {
    setWishlistItems(prev => prev.filter(item => item._id !== productId));
  };

  // Check if item is in wishlist
  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item._id === productId);
  };

  // Clear entire wishlist
  const clearWishlist = () => {
    setWishlistItems([]);
  };

  // Get wishlist count
  const getWishlistCount = () => {
    return wishlistItems.length;
  };

  // Move item to cart (remove from wishlist and add to cart)
  const moveToCart = (productId, addToCartFunction) => {
    const item = wishlistItems.find(item => item._id === productId);
    if (item && addToCartFunction) {
      removeFromWishlist(productId);
      // Add the item to cart
      addToCartFunction(item, 1);
      return item;
    }
    return null;
  };

  // Sync with backend (if you have a backend API)
  const syncWishlist = async (userId) => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Send wishlist to backend
      await api.post('/api/wishlist/sync', {
        userId,
        items: wishlistItems
      });
    } catch (err) {
      setError('Failed to sync wishlist with server');
      console.error('Error syncing wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    wishlistItems,
    loading,
    error,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    getWishlistCount,
    moveToCart,
    syncWishlist
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
