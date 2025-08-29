import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { FiFilter, FiSortAsc, FiSortDesc } from 'react-icons/fi';
import './NewArrivals.css';
import { scrollToTop } from '../utils/scrollToTop';

const NewArrivals = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    priceRange: '',
    rating: ''
  });

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  useEffect(() => {
    fetchNewArrivals();
    fetchCategories();
    // Ensure page scrolls to top when component mounts
    scrollToTop();
  }, [sortBy, filters]);

  // Make fetchNewArrivals available globally for admin panel to call
  useEffect(() => {
    window.refreshNewArrivals = fetchNewArrivals;
    return () => {
      delete window.refreshNewArrivals;
    };
  }, [sortBy, filters]);

  const fetchNewArrivals = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        newArrival: 'true'
      });

      // Add filters
      if (filters.category) params.append('category', filters.category);
      if (filters.priceRange) {
        const [min, max] = filters.priceRange.split('-');
        if (min) params.append('minPrice', min);
        if (max) params.append('maxPrice', max);
      }

      const response = await api.get(`/api/products?${params.toString()}`);
      
      // Handle API response format - products endpoint returns { products: [...], pagination: {...} }
      let filteredProducts = response.data.products ? response.data.products : 
                           (Array.isArray(response.data) ? response.data : []);

      // Apply rating filter
      if (filters.rating) {
        filteredProducts = filteredProducts.filter(p => p.rating >= parseInt(filters.rating));
      }

      // Apply sorting
      filteredProducts.sort((a, b) => {
        switch (sortBy) {
          case 'price-low':
            return a.price - b.price;
          case 'price-high':
            return b.price - a.price;
          case 'rating':
            return b.rating - a.rating;
          case 'newest':
          default:
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
      });

      setProducts(filteredProducts);
    } catch (error) {
      console.error('Error fetching new arrivals:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      priceRange: '',
      rating: ''
    });
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="new-arrivals-page">
      <div className="container">
        {/* Page Header */}
        <motion.div 
          className="page-header"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>New Arrivals</h1>
          <p>Discover our latest products and fresh additions to the collection</p>
        </motion.div>

        {/* Controls Section */}
        <div className="controls-section">
          <div className="controls-left">
            <button 
              className="filter-toggle"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FiFilter />
              Filters
            </button>
            <span className="results-count">
              {products.length} product{products.length !== 1 ? 's' : ''} found
            </span>
          </div>

          <div className="sort-controls">
            <label>Sort by:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <motion.div 
            className="filters-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="filters-grid">
              <div className="filter-group">
                <label>Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category._id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Price Range</label>
                <select
                  value={filters.priceRange}
                  onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                >
                  <option value="">All Prices</option>
                  <option value="0-50">Under $50</option>
                  <option value="50-100">$50 - $100</option>
                  <option value="100-200">$100 - $200</option>
                  <option value="200-">$200+</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Minimum Rating</label>
                <select
                  value={filters.rating}
                  onChange={(e) => handleFilterChange('rating', e.target.value)}
                >
                  <option value="">All Ratings</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="2">2+ Stars</option>
                </select>
              </div>
            </div>

            <div className="filter-actions">
              <button className="btn btn-secondary" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          </motion.div>
        )}

        {/* Products Grid */}
        <div className="products-section">
          {products.length > 0 ? (
            <div className="products-grid">
              {products.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="no-products">
              <h3>No new arrivals found</h3>
              <p>Check back soon for the latest products!</p>
            </div>
          )}
        </div>

        {/* Newsletter Signup */}
        <motion.section 
          className="newsletter-section"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="newsletter-content">
            <h2>Stay Updated</h2>
            <p>Be the first to know about new arrivals and exclusive offers</p>
            <form className="newsletter-form">
              <input
                type="email"
                placeholder="Enter your email address"
                className="newsletter-input"
                required
              />
              <button type="submit" className="btn btn-primary">
                Subscribe
              </button>
            </form>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default NewArrivals;
