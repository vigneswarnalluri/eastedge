import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import './Home.css';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      // Add timeout to prevent hanging
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 5000)
      );
      
      const [featured, newArr, trending] = await Promise.race([
        Promise.all([
          axios.get('/api/products?featured=true&limit=4'),
          axios.get('/api/products?newArrival=true&limit=3'),
          axios.get('/api/products?trending=true&limit=5')
        ]),
        timeout
      ]);

      // Handle API response format - products endpoint returns { products: [...], pagination: {...} }
      const featuredData = featured.data.products ? featured.data.products : 
                         (Array.isArray(featured.data) ? featured.data : []);
      const newArrData = newArr.data.products ? newArr.data.products : 
                        (Array.isArray(newArr.data) ? newArr.data : []);
      const trendingData = trending.data.products ? trending.data.products : 
                         (Array.isArray(trending.data) ? trending.data : []);

      setFeaturedProducts(featuredData);
      setNewArrivals(newArrData);
      setTrendingProducts(trendingData);
    } catch (error) {
      console.error('Error fetching products:', error);
      // Set empty arrays on error to prevent crashes
      setFeaturedProducts([]);
      setNewArrivals([]);
      setTrendingProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Make fetchProducts available globally for admin panel to call
  useEffect(() => {
    window.refreshHomeProducts = fetchProducts;
    return () => {
      delete window.refreshHomeProducts;
    };
  }, []);

  const heroSections = [
    {
      title: "TIMELESS.\nESSENTIALS.",
      subtitle: "Discover our curated selection of black & white designs.",
      cta: "Shop Now",
      link: "/products",
      image: "/man-1281562.jpg"
    },
    {
      title: "PURE.\nDESIGN.",
      subtitle: "Experience the beauty of simplicity and form.",
      cta: "Explore Collection",
      link: "/products",
      image: "/man-1281562.jpg"
    },
    {
      title: "ARTISANAL.\nCRAFTSMANSHIP.",
      subtitle: "Hand-picked items that speak volumes.",
      cta: "View Details",
      link: "/products",
      image: "/man-1281562.jpg"
    }
  ];

  const categories = [
    {
      name: "Apparel",
      image: "/apparel.webp",
      link: "/products?category=Apparel"
    },
    {
      name: "Accessories",
      image: "/accessories.png",
      link: "/products?category=Accessories"
    },
    {
      name: "Home Goods",
      image: "/homegoods.png",
      link: "/products?category=Home%20Goods"
    }
  ];

  // Show content even if API fails, but with loading state for products
  if (loading && (featuredProducts.length === 0 && newArrivals.length === 0 && trendingProducts.length === 0)) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-image">
          <img src={heroSections[0].image} alt={heroSections[0].title} />
        </div>
        <motion.div 
          className="hero-content"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <motion.h1 
            className="hero-title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7 }}
          >
            {heroSections[0].title}
          </motion.h1>
          <motion.p 
            className="hero-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            {heroSections[0].subtitle}
          </motion.p>
          {/* Hero actions removed - no buttons */}
        </motion.div>
      </section>

              {/* Featured Categories */}
        <section className="section">
          <div className="container">
            <div className="section-title">
              <h2>Featured Categories</h2>
            </div>
            <div className="categories-grid">
              {categories.map((category, index) => (
                <motion.div
                  key={index}
                  className="category-card"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                >
                  <Link to={category.link}>
                    <div className="category-image">
                      <img src={category.image} alt={category.name} />
                    </div>
                    <div className="category-content">
                      <h3>{category.name}</h3>
                      <span className="category-link">Shop {category.name} →</span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* New Arrivals */}
        <section className="section new-arrivals">
          <div className="container">
            <div className="section-title">
              <h2>New Arrivals</h2>
            </div>
            <div className="products-grid">
              {newArrivals.length > 0 ? (
                newArrivals.map((product, index) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))
              ) : (
                <div className="no-products">
                  <p>Loading new arrivals...</p>
                  <Link to="/new-arrivals" className="btn btn-secondary">
                    View All New Arrivals
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Exclusive Collection Banner */}
        <section className="exclusive-banner">
          <div className="container">
            <motion.div
              className="banner-content"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <h2>THE NEW<br />BLACK & WHITE COLLECTION</h2>
              <p>Embrace sophistication with our latest arrivals.</p>
              <Link to="/products" className="btn btn-primary">
                Shop The Collection
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Trending Products */}
        <section className="section">
          <div className="container">
            <div className="section-title">
              <h2>Trending Products</h2>
            </div>
            <div className="products-grid">
              {trendingProducts.length > 0 ? (
                trendingProducts.map((product, index) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))
              ) : (
                <div className="no-products">
                  <p>Loading trending products...</p>
                  <Link to="/products" className="btn btn-secondary">
                    View All Products
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="section newsletter">
          <div className="container">
            <div className="newsletter-content">
              <h2>Stay Updated</h2>
              <p>Sign up for our newsletter to receive exclusive offers and news on the latest arrivals.</p>
              <form className="newsletter-form">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="newsletter-input"
                />
                <button type="submit" className="btn btn-primary">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </section>
    </div>
  );
};

export default Home;
