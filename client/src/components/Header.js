import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { FiShoppingCart, FiUser, FiMenu, FiX, FiSearch, FiHeart } from 'react-icons/fi';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated, isAdmin, logout, loading } = useAuth();
  const { uniqueItemCount } = useCart();
  const { addRecentSearch, preferences } = useUserPreferences();
  const navigate = useNavigate();

  // Debug logging
  console.log('Auth State:', { isAuthenticated, isAdmin, loading });

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  // Close dropdown when clicking outside
  const userDropdownRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };

    if (isUserDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserDropdownOpen]);

  // Handle window resize to reposition dropdown
  useEffect(() => {
    const handleResize = () => {
      if (isUserDropdownOpen) {
        // Force re-render to reposition dropdown
        setIsUserDropdownOpen(false);
        setTimeout(() => setIsUserDropdownOpen(true), 10);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isUserDropdownOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const searchTerm = searchQuery.trim();
      addRecentSearch(searchTerm);
      navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          {/* Logo */}
          <Link to="/" className="logo">
            <img src="/logo.png" alt="EastEdge Logo" className="logo-image" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="nav-desktop">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/products" className="nav-link">Collections</Link>
            <Link to="/new-arrivals" className="nav-link">New Arrivals</Link>
            <Link to="/about" className="nav-link">About Us</Link>
            <Link to="/contact" className="nav-link">Contact</Link>
          </nav>

          {/* Header Actions - Improved Layout */}
          <div className="header-actions">
            {/* Search Button */}
            <button 
              className="action-btn search-btn" 
              onClick={toggleSearch}
              title="Search products"
            >
              <FiSearch />
            </button>

            {/* User Menu */}
            <div className="user-menu">
              {isAuthenticated ? (
                <div className="user-dropdown" ref={userDropdownRef}>
                  <button 
                    className="action-btn user-btn" 
                    onClick={toggleUserDropdown}
                    title="User menu"
                  >
                    <span className="user-icon">👤</span>
                  </button>
                  {isUserDropdownOpen && (
                    <div 
                      className="dropdown-menu"
                      style={{
                        position: 'fixed',
                        top: userDropdownRef.current ? userDropdownRef.current.getBoundingClientRect().bottom + 8 : 0,
                        right: userDropdownRef.current ? window.innerWidth - userDropdownRef.current.getBoundingClientRect().right : 0
                      }}
                    >
                      <Link to="/profile" className="dropdown-item" onClick={() => setIsUserDropdownOpen(false)}>
                        <FiUser /> Profile
                      </Link>
                      <Link to="/orders" className="dropdown-item" onClick={() => setIsUserDropdownOpen(false)}>
                        <FiShoppingCart /> Orders
                      </Link>
                      {isAdmin && (
                        <Link to="/admin" className="dropdown-item" onClick={() => setIsUserDropdownOpen(false)}>
                          <FiHeart /> Admin Panel
                        </Link>
                      )}
                      <button onClick={handleLogout} className="dropdown-item">
                        <FiX /> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="auth-buttons">
                  <Link to="/login" className="btn-login">Login</Link>
                  <Link to="/register" className="btn-signup">Sign Up</Link>
                </div>
              )}
            </div>

            {/* Cart Button */}
            <Link to="/cart" className="action-btn cart-btn" title="Shopping cart">
              <FiShoppingCart />
              {uniqueItemCount > 0 && <span className="cart-badge">{uniqueItemCount}</span>}
            </Link>

            {/* Mobile Menu Button */}
            <button className="mobile-menu-btn" onClick={toggleMenu}>
              {isMenuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="search-bar">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                autoFocus
              />
              <button type="submit" className="search-btn">
                <FiSearch />
              </button>
            </form>
          </div>
        )}

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="nav-mobile">
            <Link to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link to="/products" className="nav-link" onClick={() => setIsMenuOpen(false)}>Collections</Link>
            <Link to="/new-arrivals" className="nav-link" onClick={() => setIsMenuOpen(false)}>New Arrivals</Link>
            <Link to="/about" className="nav-link" onClick={() => setIsMenuOpen(false)}>About Us</Link>
            <Link to="/contact" className="nav-link" onClick={() => setIsMenuOpen(false)}>Contact</Link>
            {isAuthenticated && (
              <>
                <Link to="/profile" className="nav-link" onClick={() => setIsMenuOpen(false)}>Profile</Link>
                <Link to="/orders" className="nav-link" onClick={() => setIsMenuOpen(false)}>Orders</Link>
                {isAdmin && (
                  <Link to="/admin" className="nav-link" onClick={() => setIsMenuOpen(false)}>Admin Panel</Link>
                )}
                <button onClick={handleLogout} className="nav-link logout-btn">Logout</button>
              </>
            )}
            {!isAuthenticated && (
              <>
                <Link to="/login" className="nav-link" onClick={() => setIsMenuOpen(false)}>Login</Link>
                <Link to="/register" className="nav-link" onClick={() => setIsMenuOpen(false)}>Sign Up</Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
