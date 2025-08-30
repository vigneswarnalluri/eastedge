import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    general: {
      storeName: 'EastEdge',
      contactEmail: 'info@eastedge.in',
      phoneNumber: '+91 6302244544',
      logo: '',
      logoPreview: ''
    },
    store: {
      businessAddress: 'Malkajgiri, Hyderabad, Telangana, India',
      taxRate: 18,
      currency: '₹',
      timezone: 'Asia/Kolkata'
    },
    shipping: {
      freeShippingThreshold: 1000,
      forcePaidShipping: false,
      defaultShippingCost: 100
    },
    payment: {
      razorpay: true,
      cod: true,
      cashfree: false
    },
    email: {
      orderConfirmation: true,
      adminNotification: true,
      shippingUpdates: true,
      smtpHost: '',
      smtpPort: '',
      smtpEmail: '',
      smtpPassword: ''
    },
    admin: {
      users: [
        { id: 'user_1', name: 'Admin User', email: 'info@eastedge.in', role: 'Super Admin' },
        { id: 'user_2', name: 'Editor User', email: 'editor@eastedge.in', role: 'Editor' }
      ]
    },
    appearance: {
      primaryColor: '#059669',
      secondaryColor: '#1a1a1a',
      themeMode: 'dark',
      fontFamily: 'Inter',
      borderRadius: '8'
    }
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/settings');
      if (response.data) {
        setSettings(response.data);
        console.log('✅ Settings loaded in context:', response.data);
      }
    } catch (error) {
      console.error('❌ Error loading settings in context:', error);
      setError(error.message);
      // Keep default settings if loading fails
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (section, data) => {
    try {
      const response = await api.put('/api/settings', { section, data });
      if (response.data.success) {
        setSettings(prev => ({
          ...prev,
          [section]: data
        }));
        console.log(`✅ Settings updated in context: ${section}`, data);
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Failed to update settings');
      }
    } catch (error) {
      console.error(`❌ Error updating settings in context: ${section}`, error);
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const value = {
    settings,
    loading,
    error,
    loadSettings,
    updateSettings
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}; 