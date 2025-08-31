import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRedirect = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect if not loading and user is authenticated and is admin
    if (!loading && isAuthenticated && isAdmin) {
      navigate('/admin');
    }
  }, [isAuthenticated, isAdmin, loading, navigate]);

  // Don't render children if user is admin (they will be redirected)
  if (!loading && isAuthenticated && isAdmin) {
    return null;
  }

  // Render children for non-admin users or unauthenticated users
  return children;
};

export default AdminRedirect; 