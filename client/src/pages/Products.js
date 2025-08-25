import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import { useUserPreferences } from '../context/UserPreferencesContext';
import './Products.css';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    featured: searchParams.get('featured') || '',
    newArrival: searchParams.get('newArrival') || '',
    trending: searchParams.get('trending') || ''
  });
  
  const { addRecentSearch, preferences } = useUserPreferences();

  // Debounced search function
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId;
      return (searchValue) => {
        console.log('Debounced search called with:', searchValue);
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          console.log('Executing debounced search for:', searchValue);
          setSearchLoading(true);
          fetchProducts(searchValue);
        }, 500); // Wait 500ms after user stops typing
      };
    })(),
    []
  );

  useEffect(() => {
    console.log('Component mounted, initial searchTerm:', searchTerm, 'initial filters:', filters);
    fetchProducts();
  }, [filters]);

  // Handle search input changes
  useEffect(() => {
    console.log('Search term changed:', searchTerm, 'URL param:', searchParams.get('search'));
    
    // Skip initial load
    if (searchTerm === searchParams.get('search')) {
      return;
    }
    
    // If search term is empty, clear results and fetch all products
    if (!searchTerm.trim()) {
      console.log('Search term is empty, fetching all products');
      fetchProducts('');
      return;
    }
    
    // Debounce the search
    console.log('Debouncing search for:', searchTerm);
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch, searchParams]);

  const fetchProducts = async (searchValue = null) => {
    try {
      if (searchValue !== null) {
        setSearchLoading(true);
      } else {
        setLoading(true);
      }
      
      const params = new URLSearchParams();
      
      // Add search term if provided
      const searchToUse = searchValue !== null ? searchValue : searchTerm;
      if (searchToUse && searchToUse.trim()) {
        params.append('search', searchToUse.trim());
      }
      
      // Add other filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      console.log('Fetching products with params:', params.toString());
      const response = await axios.get(`/api/products?${params.toString()}`);
      
      // Handle API response format - products endpoint returns { products: [...], pagination: {...} }
      const productsData = response.data.products ? response.data.products : 
                         (Array.isArray(response.data) ? response.data : []);
      
      setProducts(productsData);
      console.log('Products fetched successfully:', productsData.length, 'Search term:', searchToUse);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  // Make fetchProducts available globally for admin panel to call
  useEffect(() => {
    window.refreshProducts = () => fetchProducts();
    return () => {
      delete window.refreshProducts;
    };
  }, []);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Update URL params
    const newSearchParams = new URLSearchParams(searchParams);
    if (value) {
      newSearchParams.set(key, value);
    } else {
      newSearchParams.delete(key);
    }
    setSearchParams(newSearchParams);
  };

  // Update URL params when search term changes
  useEffect(() => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (searchTerm) {
      newSearchParams.set('search', searchTerm);
    } else {
      newSearchParams.delete('search');
    }
    setSearchParams(newSearchParams);
  }, [searchTerm, searchParams, setSearchParams]);

  const clearFilters = () => {
    setFilters({
      category: '',
      featured: '',
      newArrival: '',
      trending: ''
    });
    setSearchTerm('');
    setSearchParams({});
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="container">
        {/* Page Header */}
        <div className="page-header">
          <h1>Our Products</h1>
          <p>Discover our curated collection of timeless essentials</p>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filters-grid">
            <div className="filter-group">
              <label>Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="Apparel">Apparel</option>
                <option value="Accessories">Accessories</option>
                <option value="Home Goods">Home Goods</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Search</label>
              <div className="search-input-container">
                                 <input
                   type="text"
                   placeholder="Search products..."
                   value={searchTerm}
                   onChange={(e) => {
                     console.log('Search input changed to:', e.target.value);
                     setSearchTerm(e.target.value);
                   }}
                 />
                {searchLoading && <div className="search-spinner"></div>}
              </div>
            </div>

            <div className="filter-group">
              <label>Sort By</label>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
              >
                <option value="">Default</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="newest">Newest First</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Special</label>
              <select
                value={filters.special}
                onChange={(e) => handleFilterChange('special', e.target.value)}
              >
                <option value="">All Products</option>
                <option value="featured">Featured</option>
                <option value="newArrival">New Arrivals</option>
                <option value="trending">Trending</option>
              </select>
            </div>
          </div>

          <div className="filter-actions">
            <button onClick={clearFilters} className="btn btn-outline clear-filters">
              Clear Filters
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="results-info">
          <p>
            {searchLoading ? 'Searching...' : `${products.length} product${products.length !== 1 ? 's' : ''} found`}
            {searchTerm && searchTerm.trim() && (
              <span> for "{searchTerm}"</span>
            )}
          </p>

        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <motion.div
            className="products-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
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
          </motion.div>
        ) : (
          <div className="no-products">
            <h3>No products found</h3>
            <p>Try adjusting your filters or search terms</p>
            <button onClick={clearFilters} className="btn btn-primary">
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
