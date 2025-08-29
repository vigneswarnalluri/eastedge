import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { scrollToTop } from '../utils/scrollToTop';
import './Products.css';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    sort: searchParams.get('sort') || '',
    special: searchParams.get('special') || ''
  });
  
  // Update filters when URL params change
  useEffect(() => {
    const newFilters = {
      category: searchParams.get('category') || '',
      sort: searchParams.get('sort') || '',
      special: searchParams.get('special') || ''
    };
    setFilters(newFilters);
  }, [searchParams]);
  
  const [categories, setCategories] = useState([]);
  const { addRecentSearch, preferences } = useUserPreferences();

  // Debounced search function
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId;
      return (searchValue) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          setSearchLoading(true);
          fetchProducts(searchValue);
        }, 500); // Wait 500ms after user stops typing
      };
    })(),
    []
  );

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    // Ensure page scrolls to top when component mounts
    scrollToTop();
  }, []); // Empty dependency array since we only want to run this once on mount

  // Handle search input changes
  useEffect(() => {
    // Skip initial load
    if (searchTerm === searchParams.get('search')) {
      return;
    }
    
    // If search term is empty, clear results and fetch all products
    if (!searchTerm.trim()) {
      fetchProducts('');
      return;
    }
    
    // Debounce the search
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch, searchParams]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  const fetchProducts = useCallback(async (searchValue = null) => {
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
      
      // Add category filter
      if (filters.category) {
        params.append('category', filters.category);
      }
      
      // Add special filters
      if (filters.special) {
        switch (filters.special) {
          case 'featured':
            params.append('featured', 'true');
            break;
          case 'newArrival':
            params.append('newArrival', 'true');
            break;
          case 'trending':
            params.append('trending', 'true');
            break;
          default:
            break;
        }
      }

      // Add sorting parameter
      if (filters.sort) {
        let sortParam = '';
        switch (filters.sort) {
          case 'price_asc':
            sortParam = 'price';
            break;
          case 'price_desc':
            sortParam = 'price-desc';
            break;
          case 'newest':
            sortParam = 'createdAt';
            break;
          case 'rating':
            sortParam = 'rating';
            break;
          default:
            sortParam = 'createdAt';
            break;
        }
        params.append('sort', sortParam);
      }

      const response = await api.get(`/api/products?${params.toString()}`);
      
      // Handle API response format - products endpoint returns { products: [...], pagination: {...} }
      let productsData = response.data.products ? response.data.products : 
                         (Array.isArray(response.data) ? response.data : []);
      
      setProducts(productsData);
      console.log('Products fetched successfully:', productsData.length, 'Search term:', searchToUse);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  }, [searchTerm, filters]);

  // Refetch products when filters change
  useEffect(() => {
    if (filters.category || filters.sort || filters.special) {
      fetchProducts();
    }
  }, [filters, fetchProducts]);

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
      sort: '',
      special: ''
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
                {categories.map(category => (
                  <option key={category._id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Search</label>
              <div className="search-input-container">
                                 <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
