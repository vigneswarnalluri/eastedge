import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const initialState = {
  items: [],
  total: 0,
  itemCount: 0
};

console.log('CartContext: Initial state created:', initialState);

const cartReducer = (state, action) => {
  console.log('Cart reducer called with action:', action.type, 'payload:', action.payload);
  console.log('Current state:', state);
  
  let newState;
  
  switch (action.type) {
    case 'ADD_ITEM':
      const existingItem = state.items.find(item => item._id === action.payload._id);
      if (existingItem) {
        newState = {
          ...state,
          items: state.items.map(item =>
            item._id === action.payload._id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
          total: state.total + (action.payload.price * action.payload.quantity),
          itemCount: state.itemCount + action.payload.quantity
        };
      } else {
        newState = {
          ...state,
          items: [...state.items, action.payload],
          total: state.total + (action.payload.price * action.payload.quantity),
          itemCount: state.itemCount + action.payload.quantity
        };
      }
      console.log('New state after ADD_ITEM:', newState);
      return newState;

    case 'REMOVE_ITEM':
      const itemToRemove = state.items.find(item => item._id === action.payload);
      newState = {
        ...state,
        items: state.items.filter(item => item._id !== action.payload),
        total: state.total - (itemToRemove.price * itemToRemove.quantity),
        itemCount: state.itemCount - itemToRemove.quantity
      };
      console.log('New state after REMOVE_ITEM:', newState);
      return newState;

    case 'UPDATE_QUANTITY':
      const updatedItems = state.items.map(item => {
        if (item._id === action.payload.id) {
          return { ...item, quantity: action.payload.quantity };
        }
        return item;
      });
      
      const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const newItemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      
      newState = {
        ...state,
        items: updatedItems,
        total: newTotal,
        itemCount: newItemCount
      };
      console.log('New state after UPDATE_QUANTITY:', newState);
      return newState;

    case 'CLEAR_CART':
      newState = {
        ...state,
        items: [],
        total: 0,
        itemCount: 0
      };
      console.log('New state after CLEAR_CART:', newState);
      return newState;

    case 'LOAD_CART':
      console.log('LOAD_CART reducer case - payload:', action.payload);
      console.log('LOAD_CART reducer case - current state:', state);
      console.log('Payload items:', action.payload.items);
      console.log('Payload total:', action.payload.total);
      console.log('Payload itemCount:', action.payload.itemCount);
      newState = {
        ...state,
        items: action.payload.items || [],
        total: action.payload.total || 0,
        itemCount: action.payload.itemCount || 0
      };
      console.log('New state after LOAD_CART:', newState);
      console.log('New state items length:', newState.items.length);
      console.log('New state total:', newState.total);
      console.log('New state itemCount:', newState.itemCount);
      return newState;

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [isInitialized, setIsInitialized] = useState(false);
  const { isAuthenticated, user } = useAuth();
  
  // Get user-specific cart key
  const getCartKey = () => {
    if (isAuthenticated && user?._id) {
      return `cart_${user._id}`;
    }
    return 'cart_guest';
  };
  
  // Debug logging for state changes
  useEffect(() => {
    console.log('Cart state changed:', state);
    console.log('Cart state items length:', state.items.length);
    console.log('Cart state total:', state.total);
    console.log('Cart state itemCount:', state.itemCount);
  }, [state]);

  // Load cart from localStorage on mount
  useEffect(() => {
    console.log('CartContext: useEffect for loading cart triggered');
    console.log('Current user state - isAuthenticated:', isAuthenticated, 'user ID:', user?._id);
    const cartKey = getCartKey();
    console.log('Loading cart with key:', cartKey);
    
    // Check all localStorage keys to debug
    console.log('All localStorage keys:', Object.keys(localStorage));
    
    const savedCart = localStorage.getItem(cartKey);
    console.log('Loading cart from localStorage:', savedCart);
    
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        console.log('Parsed cart data:', parsedCart);
        // Validate the parsed data before loading
        if (parsedCart && Array.isArray(parsedCart.items)) {
          console.log('Dispatching LOAD_CART action with payload:', parsedCart);
          dispatch({ type: 'LOAD_CART', payload: parsedCart });
          setIsInitialized(true);
        } else {
          console.warn('Invalid cart data structure, resetting cart');
          console.log('Parsed cart structure:', parsedCart);
          console.log('Items array check:', Array.isArray(parsedCart?.items));
          localStorage.removeItem(cartKey);
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        localStorage.removeItem(cartKey);
      }
    } else {
      console.log('No saved cart found in localStorage');
      // SMART FIX: Auto-detect and load any cart with items
      const allKeys = Object.keys(localStorage);
      const cartKeys = allKeys.filter(key => key.startsWith('cart_'));
      console.log('Found cart keys in localStorage:', cartKeys);
      
      if (cartKeys.length > 0) {
        // Find the first cart that has items
        let cartWithItems = null;
        let cartWithItemsKey = null;
        
        for (const key of cartKeys) {
          try {
            const data = localStorage.getItem(key);
            const parsedData = JSON.parse(data);
            console.log(`Cart key ${key} contains:`, parsedData);
            
            if (parsedData && Array.isArray(parsedData.items) && parsedData.items.length > 0) {
              cartWithItems = parsedData;
              cartWithItemsKey = key;
              console.log('Found cart with items:', key, parsedData);
              break;
            }
          } catch (error) {
            console.error(`Error parsing cart data from ${key}:`, error);
          }
        }
        
        // If we found a cart with items, load it and copy to current user's cart
        if (cartWithItems && cartWithItemsKey) {
          console.log('Auto-loading cart with items from:', cartWithItemsKey);
          dispatch({ type: 'LOAD_CART', payload: cartWithItems });
          
          // Copy the cart data to current user's cart key for future use
          const currentCartKey = getCartKey();
          if (currentCartKey !== cartWithItemsKey) {
            localStorage.setItem(currentCartKey, JSON.stringify(cartWithItems));
            console.log('Copied cart data to current user key:', currentCartKey);
          }
          
          setIsInitialized(true);
        } else {
          console.log('No cart with items found, initializing empty cart');
          setIsInitialized(true);
        }
      } else {
        setIsInitialized(true);
      }
    }
  }, [isAuthenticated, user?._id]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isInitialized) {
      console.log('Skipping save - cart not yet initialized');
      return;
    }
    
    const cartData = {
      items: state.items,
      total: state.total,
      itemCount: state.itemCount
    };
    const cartKey = getCartKey();
    console.log('Saving cart to localStorage with key:', cartKey, 'data:', cartData);
    
    try {
      localStorage.setItem(cartKey, JSON.stringify(cartData));
      console.log('Cart saved successfully to localStorage');
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
      // Try to clear localStorage if it's full
      try {
        localStorage.clear();
        localStorage.setItem(cartKey, JSON.stringify(cartData));
        console.log('Cart saved after clearing localStorage');
      } catch (clearError) {
        console.error('Failed to save cart even after clearing localStorage:', clearError);
      }
    }
  }, [state.items, state.total, state.itemCount, isInitialized, isAuthenticated, user?._id]);

  // Migrate guest cart to user cart when logging in
  useEffect(() => {
    if (isAuthenticated && user?._id && isInitialized) {
      console.log('User logged in, checking for guest cart migration');
      migrateGuestCart();
    }
  }, [isAuthenticated, user?._id, isInitialized]);

  const addToCart = (product, quantity = 1) => {
    console.log('Adding to cart:', product, 'quantity:', quantity);
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.image || product.images?.[0],
        quantity
      }
    });
  };

  const removeFromCart = (productId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity } });
    }
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getCartItem = (productId) => {
    return state.items.find(item => item._id === productId);
  };

  const getTotalPrice = () => {
    return state.total;
  };

  const saveCartToStorage = () => {
    const cartData = {
      items: state.items,
      total: state.total,
      itemCount: state.itemCount
    };
    const cartKey = getCartKey();
    try {
      localStorage.setItem(cartKey, JSON.stringify(cartData));
      console.log('Cart manually saved to localStorage with key:', cartKey, 'data:', cartData);
      return true;
    } catch (error) {
      console.error('Error manually saving cart:', error);
      return false;
    }
  };

  const loadCartFromStorage = () => {
    const cartKey = getCartKey();
    const savedCart = localStorage.getItem(cartKey);
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        if (parsedCart && Array.isArray(parsedCart.items)) {
          dispatch({ type: 'LOAD_CART', payload: parsedCart });
          console.log('Cart manually loaded from localStorage with key:', cartKey, 'data:', parsedCart);
          return true;
        }
      } catch (error) {
        console.error('Error manually loading cart:', error);
      }
    }
    return false;
  };

  const debugCartStorage = () => {
    const cartKey = getCartKey();
    console.log('Current cart key:', cartKey);
    const savedCart = localStorage.getItem(cartKey);
    console.log('Raw localStorage cart data for key', cartKey, ':', savedCart);
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        console.log('Parsed localStorage cart data:', parsedCart);
        console.log('Current cart state:', state);
        console.log('Items array type:', Array.isArray(parsedCart.items));
        console.log('Items length:', parsedCart.items?.length);
        console.log('Is initialized:', isInitialized);
        console.log('Is authenticated:', isAuthenticated);
        console.log('User ID:', user?._id);
      } catch (error) {
        console.error('Error parsing localStorage cart:', error);
      }
    } else {
      console.log('No cart data in localStorage for key:', cartKey);
    }
  };

  const testCartPersistence = () => {
    console.log('=== CART PERSISTENCE TEST ===');
    console.log('Current state:', state);
    console.log('Is initialized:', isInitialized);
    
    // Test adding an item
    const testProduct = {
      _id: 'test123',
      name: 'Test Product',
      price: 100,
      image: '/test.jpg',
      quantity: 1
    };
    
    console.log('Adding test product:', testProduct);
    addToCart(testProduct);
    
    // Wait a bit and check state
    setTimeout(() => {
      console.log('State after adding test product:', state);
      const cartKey = getCartKey();
      console.log('localStorage after adding for key', cartKey, ':', localStorage.getItem(cartKey));
    }, 100);
  };

  // Migrate guest cart to user cart when logging in
  const migrateGuestCart = () => {
    if (isAuthenticated && user?._id) {
      const guestCart = localStorage.getItem('cart_guest');
      const userCartKey = `cart_${user._id}`;
      
      if (guestCart) {
        try {
          const parsedGuestCart = JSON.parse(guestCart);
          if (parsedGuestCart && Array.isArray(parsedGuestCart.items) && parsedGuestCart.items.length > 0) {
            console.log('Migrating guest cart to user cart:', parsedGuestCart);
            localStorage.setItem(userCartKey, guestCart);
            localStorage.removeItem('cart_guest');
            dispatch({ type: 'LOAD_CART', payload: parsedGuestCart });
            console.log('Guest cart migrated successfully');
          }
        } catch (error) {
          console.error('Error migrating guest cart:', error);
        }
      }
    }
  };

  // Clear cart when logging out
  const clearCartOnLogout = () => {
    console.log('Clearing cart on logout');
    dispatch({ type: 'CLEAR_CART' });
    // Don't clear localStorage here as it will be handled by the save effect
  };

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        total: state.total,
        itemCount: state.itemCount,
        isInitialized,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartItem,
        getTotalPrice,
        saveCartToStorage,
        loadCartFromStorage,
        debugCartStorage,
        testCartPersistence,
        migrateGuestCart,
        clearCartOnLogout
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
