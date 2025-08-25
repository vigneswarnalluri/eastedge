import React, { createContext, useContext, useState, useEffect } from 'react';

const UserPreferencesContext = createContext();

export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
};

export const UserPreferencesProvider = ({ children }) => {
  const [preferences, setPreferences] = useState({
    theme: 'light',
    currency: '₹',
    language: 'en',
    notifications: {
      email: true,
      push: false,
      sms: false
    },
    display: {
      productsPerPage: 12,
      showPrices: true,
      showStock: true
    },
    search: {
      recentSearches: [],
      savedSearches: []
    }
  });

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('userPreferences');
    if (savedPreferences) {
      try {
        const parsedPreferences = JSON.parse(savedPreferences);
        setPreferences(prev => ({ ...prev, ...parsedPreferences }));
      } catch (error) {
        console.error('Error loading user preferences:', error);
      }
    }
  }, []);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
  }, [preferences]);

  // Update specific preference
  const updatePreference = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Update nested preference
  const updateNestedPreference = (category, key, value) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  // Add recent search
  const addRecentSearch = (searchTerm) => {
    if (!searchTerm.trim()) return;
    
    setPreferences(prev => ({
      ...prev,
      search: {
        ...prev.search,
        recentSearches: [
          searchTerm,
          ...prev.search.recentSearches.filter(term => term !== searchTerm)
        ].slice(0, 10) // Keep only last 10 searches
      }
    }));
  };

  // Save search
  const saveSearch = (searchTerm, searchParams = {}) => {
    if (!searchTerm.trim()) return;
    
    const newSavedSearch = {
      id: Date.now(),
      term: searchTerm,
      params: searchParams,
      savedAt: new Date().toISOString()
    };
    
    setPreferences(prev => ({
      ...prev,
      search: {
        ...prev.search,
        savedSearches: [
          newSavedSearch,
          ...prev.search.savedSearches.filter(search => search.term !== searchTerm)
        ].slice(0, 20) // Keep only last 20 saved searches
      }
    }));
  };

  // Remove saved search
  const removeSavedSearch = (searchId) => {
    setPreferences(prev => ({
      ...prev,
      search: {
        ...prev.search,
        savedSearches: prev.search.savedSearches.filter(search => search.id !== searchId)
      }
    }));
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setPreferences(prev => ({
      ...prev,
      search: {
        ...prev.search,
        recentSearches: []
      }
    }));
  };

  // Reset all preferences to default
  const resetPreferences = () => {
    const defaultPreferences = {
      theme: 'light',
      currency: '₹',
      language: 'en',
      notifications: {
        email: true,
        push: false,
        sms: false
      },
      display: {
        productsPerPage: 12,
        showPrices: true,
        showStock: true
      },
      search: {
        recentSearches: [],
        savedSearches: []
      }
    };
    setPreferences(defaultPreferences);
  };

  const value = {
    preferences,
    updatePreference,
    updateNestedPreference,
    addRecentSearch,
    saveSearch,
    removeSavedSearch,
    clearRecentSearches,
    resetPreferences
  };

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
};
