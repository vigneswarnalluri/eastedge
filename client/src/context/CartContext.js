import React, { createContext, useContext, useReducer, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { calculateCartGST, calculateGSTBreakdown } from '../utils/gstCalculator';

const CartContext = createContext();

const initialState = {
  items: [],
  total: 0,
  itemCount: 0,
  uniqueItemCount: 0
};

console.log('CartContext: Initial state created:', initialState);

const cartReducer = (state, action) => {
  console.log('Cart reducer called with action:', action.type, 'payload:', action.payload);
  console.log('Current state:', state);
  
  // Validate and sanitize state to prevent negative prices
  const sanitizeState = (state) => {
    if (state.total < 0 || state.itemCount < 0 || !Array.isArray(state.items)) {
      console.warn('Cart state corrupted, resetting to initial state');
      return initialState;
    }
    return state;
  };
  
  // Sanitize current state before processing
  const sanitizedState = sanitizeState(state);
  
  // Create a unique key that includes product ID, size, and color
  const createItemKey = (item) => {
    const size = (item.selectedSize || '').toString().trim();
    const color = (item.selectedColor || '').toString().trim();
    const key = `${item._id}_${size}_${color}`;
    console.log('Creating key for item:', { id: item._id, size, color, key });
    return key;
  };
  
  let newState;
  
  switch (action.type) {
    case 'ADD_ITEM':
      const payloadKey = createItemKey(action.payload);
      console.log('=== ADD_ITEM DEBUG ===');
      console.log('Payload key:', payloadKey);
      console.log('Payload selectedSize:', action.payload.selectedSize);
      console.log('Payload selectedColor:', action.payload.selectedColor);
      console.log('Payload quantity:', action.payload.quantity);
      console.log('Current cart items before adding:', sanitizedState.items);
      
      const existingItem = sanitizedState.items.find(item => {
        const itemKey = createItemKey(item);
        console.log('Comparing with existing item:', itemKey, 'vs', payloadKey);
        return itemKey === payloadKey;
      });
      
      console.log('Existing item found:', existingItem);
      
      if (existingItem) {
        console.log('Updating existing item quantity from', existingItem.quantity, 'to', existingItem.quantity + action.payload.quantity);
        newState = {
          ...sanitizedState,
          items: sanitizedState.items.map(item =>
            createItemKey(item) === payloadKey
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
          total: sanitizedState.total + (action.payload.price * action.payload.quantity),
          itemCount: sanitizedState.itemCount + action.payload.quantity,
          uniqueItemCount: sanitizedState.items.length // Same number of unique items
        };
      } else {
        console.log('Adding new item to cart');
        newState = {
          ...sanitizedState,
          items: [...sanitizedState.items, action.payload],
          total: sanitizedState.total + (action.payload.price * action.payload.quantity),
          itemCount: sanitizedState.itemCount + action.payload.quantity,
          uniqueItemCount: sanitizedState.items.length + 1 // One more unique item
        };
      }
      
      // Validate new state
      if (newState.total < 0) {
        console.error('Negative total detected, recalculating from items');
        newState.total = newState.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      }
      
      console.log('New state after ADD_ITEM:', newState);
      console.log('New cart items:', newState.items);
      console.log('=== END ADD_ITEM DEBUG ===');
      return newState;

    case 'REMOVE_ITEM':
      // createItemKey function should be available here
      const itemToRemove = sanitizedState.items.find(item => createItemKey(item) === action.payload);
      newState = {
        ...sanitizedState,
        items: sanitizedState.items.filter(item => createItemKey(item) !== action.payload),
        total: sanitizedState.total - ((itemToRemove?.price || 0) * (itemToRemove?.quantity || 0)),
        itemCount: sanitizedState.itemCount - (itemToRemove?.quantity || 0),
        uniqueItemCount: sanitizedState.items.length - 1
      };
      
      // Validate new state
      if (newState.total < 0) {
        console.error('Negative total detected after removal, recalculating from items');
        newState.total = newState.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      }
      
      console.log('New state after REMOVE_ITEM:', newState);
      return newState;

    case 'UPDATE_QUANTITY':
      const updatedItems = sanitizedState.items.map(item => {
        if (createItemKey(item) === action.payload.id) {
          return { ...item, quantity: action.payload.quantity };
        }
        return item;
      });
      
      const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const newItemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      
      newState = {
        ...sanitizedState,
        items: updatedItems,
        total: newTotal,
        itemCount: newItemCount,
        uniqueItemCount: updatedItems.length
      };
      
      // Validate new state
      if (newState.total < 0) {
        console.error('Negative total detected after quantity update, recalculating from items');
        newState.total = newState.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      }
      
      console.log('New state after UPDATE_QUANTITY:', newState);
      return newState;

    case 'CLEAR_CART':
      newState = {
        ...state,
        items: [],
        total: 0,
        itemCount: 0,
        uniqueItemCount: 0
      };
      console.log('New state after CLEAR_CART:', newState);
      return newState;

    case 'LOAD_CART':
      console.log('LOAD_CART reducer case - payload:', action.payload);
      console.log('LOAD_CART reducer case - current state:', sanitizedState);
      console.log('Payload items:', action.payload.items);
      console.log('Payload total:', action.payload.total);
      console.log('Payload itemCount:', action.payload.itemCount);
      
      // Validate loaded data
      const loadedItems = Array.isArray(action.payload.items) ? action.payload.items : [];
      const loadedTotal = typeof action.payload.total === 'number' && action.payload.total >= 0 ? action.payload.total : 0;
      const loadedItemCount = typeof action.payload.itemCount === 'number' && action.payload.itemCount >= 0 ? action.payload.itemCount : 0;
      
      // Recalculate total from items if loaded total is invalid
      const calculatedTotal = loadedItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
      const calculatedItemCount = loadedItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
      
      newState = {
        ...sanitizedState,
        items: loadedItems,
        total: loadedTotal > 0 ? loadedTotal : calculatedTotal,
        itemCount: loadedItemCount > 0 ? loadedItemCount : calculatedItemCount,
        uniqueItemCount: loadedItems.length
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
  const [hasLoadedFromStorage, setHasLoadedFromStorage] = useState(false);
  const { isAuthenticated, user } = useAuth();
  
  // Get user-specific cart key
  const getCartKey = useCallback(() => {
    if (isAuthenticated && user?._id) {
      return `cart_${user._id}`;
    }
    return 'cart_guest';
  }, [isAuthenticated, user?._id]);
  
  // Debug logging for state changes
  useEffect(() => {
    console.log('Cart state changed:', state);
    console.log('Cart state items length:', state.items.length);
    console.log('Cart state total:', state.total);
    console.log('Cart state itemCount:', state.itemCount);
  }, [state]);

  // Reset corrupted cart data
  const resetCorruptedCart = () => {
    console.warn('Resetting corrupted cart data');
    localStorage.removeItem(getCartKey());
    dispatch({ type: 'CLEAR_CART' });
  };

  // Load cart from localStorage
  useEffect(() => {
    console.log('🛒 Cart loading effect triggered - isInitialized:', isInitialized, 'cartKey:', getCartKey());
    
    const loadCartFromStorage = () => {
      try {
        const cartKey = getCartKey();
        console.log('🔑 Loading cart with key:', cartKey);
        const savedCart = localStorage.getItem(cartKey);
        console.log('📦 Raw saved cart data:', savedCart);
        
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          console.log('✅ Parsed cart data:', parsedCart);
          
          // Validate loaded data - be more lenient with validation
          if (parsedCart && 
              Array.isArray(parsedCart.items)) {
            
            // Ensure total and itemCount are numbers, calculate if missing
            const validatedCart = {
              items: parsedCart.items,
              total: typeof parsedCart.total === 'number' ? parsedCart.total : 
                     parsedCart.items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0),
              itemCount: typeof parsedCart.itemCount === 'number' ? parsedCart.itemCount : 
                        parsedCart.items.reduce((sum, item) => sum + (item.quantity || 1), 0)
            };
            
            console.log('🎯 Dispatching LOAD_CART action with validated payload:', validatedCart);
            dispatch({ type: 'LOAD_CART', payload: validatedCart });
            setHasLoadedFromStorage(true);
          } else {
            console.error('❌ Invalid cart data structure, resetting');
            resetCorruptedCart();
          }
        } else {
          console.log('📭 No saved cart found for key:', cartKey);
          // Don't clear cart if no saved data - this is normal for new users
          setHasLoadedFromStorage(true);
        }
      } catch (error) {
        console.error('❌ Error loading cart from storage:', error);
        // Only reset if it's a JSON parsing error, not if the cart is empty
        if (localStorage.getItem(getCartKey())) {
          resetCorruptedCart();
        }
        setHasLoadedFromStorage(true);
      }
    };

    if (isInitialized) {
      console.log('🚀 Cart is initialized, loading from storage...');
      loadCartFromStorage();
    } else {
      console.log('⏳ Cart not yet initialized, waiting...');
    }
  }, [isInitialized, getCartKey]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isInitialized || !hasLoadedFromStorage) {
      console.log('⏸️ Skipping save - cart not yet initialized or not loaded from storage');
      return;
    }
    
    const cartData = {
      items: state.items,
      total: state.total,
      itemCount: state.itemCount
    };
    const cartKey = getCartKey();
    console.log('💾 Saving cart to localStorage with key:', cartKey, 'data:', cartData);
    
    try {
      localStorage.setItem(cartKey, JSON.stringify(cartData));
      console.log('✅ Cart saved successfully to localStorage');
    } catch (error) {
      console.error('❌ Error saving cart to localStorage:', error);
      // Try to clear localStorage if it's full
      try {
        localStorage.clear();
        localStorage.setItem(cartKey, JSON.stringify(cartData));
        console.log('🔄 Cart saved after clearing localStorage');
      } catch (clearError) {
        console.error('❌ Failed to save cart even after clearing localStorage:', clearError);
      }
    }
  }, [state.items, state.total, state.itemCount, isInitialized, hasLoadedFromStorage, getCartKey]);

  // Migrate guest cart to user cart when logging in
  useEffect(() => {
    if (isAuthenticated && user?._id && isInitialized) {
      console.log('User logged in, checking for guest cart migration');
      migrateGuestCart();
    }
  }, [isAuthenticated, user?._id, isInitialized]);

  // Initialize cart and set isInitialized to true
  useEffect(() => {
    console.log('🔧 Cart initialization effect - isAuthenticated:', isAuthenticated, 'user:', user?._id);
    
    // Set initialized to true immediately for guest users, or after auth check for authenticated users
    if (!isAuthenticated) {
      // Guest user - initialize immediately
      console.log('👤 Guest user detected, initializing immediately');
      setIsInitialized(true);
      console.log('✅ Cart context initialized for guest user');
    } else {
      // Authenticated user - initialize after auth check
      console.log('🔐 Authenticated user detected, initializing after auth check');
      const timer = setTimeout(() => {
        setIsInitialized(true);
        console.log('✅ Cart context initialized for authenticated user');
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user?._id]);

  const addToCart = (product, quantity = 1) => {
    console.log('Adding to cart:', product, 'quantity:', quantity);
    
    // Check if this is a variant-based product with size/color selection
    if (product.selectedSize || product.selectedColor) {
      // This is a variant product, preserve all variant information
      dispatch({
        type: 'ADD_ITEM',
        payload: {
          _id: product._id,
          name: product.name,
          price: product.price,
          image: product.image || product.images?.[0],
          quantity: product.quantity || quantity,
          selectedSize: product.selectedSize,
          selectedColor: product.selectedColor,
          sku: product.sku,
          category: product.category,
          categoryName: product.categoryName,
          // Add variant-specific information
          variantStock: product.variantStock,
          stockQuantity: product.variantStock || product.stockQuantity || 0, // Store stock for validation
          // Preserve any other variant details
          ...product
        }
      });
    } else if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
      // This product has variants but no selection - set default variants
      const defaultVariant = product.variants[0]; // Use first variant as default
      console.log('Product has variants but no selection, using default variant:', defaultVariant);
      
      dispatch({
        type: 'ADD_ITEM',
        payload: {
          _id: product._id,
          name: product.name,
          price: defaultVariant.price || product.price,
          image: product.image || product.images?.[0],
          quantity: product.quantity || quantity,
          selectedSize: defaultVariant.size,
          selectedColor: defaultVariant.color,
          sku: defaultVariant.sku || product.sku,
          category: product.category,
          categoryName: product.categoryName,
          // Add variant-specific information
          variantStock: defaultVariant.stock || 0,
          stockQuantity: defaultVariant.stock || 0, // Store stock for validation
          // Preserve any other variant details
          ...product
        }
      });
    } else {
      // This is a simple product without variants
      dispatch({
        type: 'ADD_ITEM',
        payload: {
          _id: product._id,
          name: product.name,
          price: product.price,
          image: product.image || product.images?.[0],
          quantity: product.quantity || quantity,
          sku: product.sku,
          category: product.category,
          categoryName: product.categoryName,
          stockQuantity: product.stockQuantity || 0 // Store stock for validation
        }
      });
    }
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

  // GST calculation methods
  const getGSTBreakdown = () => {
    return calculateCartGST(state.items);
  };

  const getTotalWithGST = () => {
    const gstBreakdown = getGSTBreakdown();
    return gstBreakdown.totalAmount;
  };

  const getBaseAmount = () => {
    const gstBreakdown = getGSTBreakdown();
    return gstBreakdown.baseAmount;
  };

  const getGSTAmount = () => {
    const gstBreakdown = getGSTBreakdown();
    return gstBreakdown.gstAmount;
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
        uniqueItemCount: state.uniqueItemCount,
        isInitialized,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartItem,
        getTotalPrice,
        getGSTBreakdown,
        getTotalWithGST,
        getBaseAmount,
        getGSTAmount,
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
