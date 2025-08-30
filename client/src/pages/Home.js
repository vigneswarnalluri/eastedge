import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import ContentDisplay from '../components/ContentDisplay';
import api from '../services/api';
import { scrollToTop } from '../utils/scrollToTop';
import './Home.css';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      // Fetch featured products
      const featuredResponse = await api.get('/api/products?featured=true&limit=6');
      const featuredData = featuredResponse.data.products || featuredResponse.data || [];
      setFeaturedProducts(featuredData);
      
      // Fetch new arrivals
      const newArrivalsResponse = await api.get('/api/products?newArrival=true&limit=6');
      const newArrivalsData = newArrivalsResponse.data.products || newArrivalsResponse.data || [];
      setNewArrivals(newArrivalsData);
      
      // Fetch trending products
      const trendingResponse = await api.get('/api/products?trending=true&limit=6');
      const trendingData = trendingResponse.data.products || trendingResponse.data || [];
      setTrendingProducts(trendingData);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/categories');
      const categoriesData = response.data || [];
      
      // Transform categories data to match our UI structure
      let transformedCategories = categoriesData
        .filter(category => !category.parentCategory) // Only main categories
        .filter(category => !['Beverages', 'Collectibles'].includes(category.name)) // Exclude unwanted categories
        .slice(0, 6) // Limit to 6 categories
        .map(category => {
          // Force use of specific uploaded images regardless of database content
          let imagePath;
          switch (category.name.toLowerCase()) {
            case 'apparel':
              imagePath = '/apparel.webp';
              break;
            case 'fashion and apparel':
            case 'fashion & apparel':
              imagePath = '/fashion and apparel.jpg';
              break;
            case "men's clothing":
              imagePath = '/apparel.webp';
              break;
            case 'accessories':
              imagePath = '/accessories.jpg';
              break;
            case 'furniture':
              imagePath = '/man-815795.jpg';
              break;
            case 'electronics':
              imagePath = '/electronics.jpg';
              break;
            case 'home goods':
            case 'home & living':
              imagePath = '/man-1281562.jpg';
              break;
            case 'beauty & health':
            case 'beauty and health':
              imagePath = '/beauty and health.jpg';
              break;
            case 'diy and hardware':
              imagePath = '/diy and hardware.jpg';
              break;
            default:
              imagePath = '/man-1281562.jpg'; // Default fallback
          }
          
          return {
            name: category.name,
            image: imagePath,
            link: `/products?category=${encodeURIComponent(category.name)}`,
            description: category.description
          };
        });
      
      // Ensure we have at least 3 categories for a good grid layout
      if (transformedCategories.length < 3) {
        // Add fallback categories if we don't have enough
        const fallbackCategories = [
          {
            name: "Apparel",
            image: "/apparel.webp",
            link: "/products?category=Apparel"
          },
          {
            name: "Fashion & Apparel",
            image: "/fashion and apparel.jpg",
            link: "/products?category=Fashion%20%26%20Apparel"
          },
          {
            name: "Men's Clothing",
            image: "/apparel.webp",
            link: "/products?category=Men%27s%20Clothing"
          },
          {
            name: "Accessories",
            image: "/accessories.jpg",
            link: "/products?category=Accessories"
          },
          {
            name: "Electronics",
            image: "/electronics.jpg",
            link: "/products?category=Electronics"
          },
          {
            name: "Beauty & Health",
            image: "/beauty and health.jpg",
            link: "/products?category=Beauty%20%26%20Health"
          },
          {
            name: "DIY & Hardware",
            image: "/diy and hardware.jpg",
            link: "/products?category=DIY%20%26%20Hardware"
          }
        ];
        
        // Merge API categories with fallbacks, avoiding duplicates
        const existingNames = transformedCategories.map(cat => cat.name.toLowerCase());
        fallbackCategories.forEach(fallback => {
          if (!existingNames.includes(fallback.name.toLowerCase())) {
            transformedCategories.push(fallback);
          }
        });
        
        // Ensure we have exactly 4 categories (removed beverages and collectibles)
        transformedCategories = transformedCategories.slice(0, 4);
      }
      
      setCategories(transformedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback to default categories if API fails
      setCategories([
        {
          name: "Apparel",
          image: "/apparel.webp",
          link: "/products?category=Apparel"
        },
        {
          name: "Fashion & Apparel",
          image: "/fashion and apparel.jpg",
          link: "/products?category=Fashion%20%26%20Apparel"
        },
        {
          name: "Men's Clothing",
          image: "/apparel.webp",
          link: "/products?category=Men%27s%20Clothing"
          },
        {
          name: "Accessories",
          image: "/accessories.jpg",
          link: "/products?category=Accessories"
        },
        {
          name: "Electronics",
          image: "/electronics.jpg",
          link: "/products?category=Electronics"
        },
        {
          name: "Beauty & Health",
          image: "/beauty and health.jpg",
          link: "/products?category=Beauty%20%26%20Health"
        },
        {
          name: "DIY & Hardware",
          image: "/diy and hardware.jpg",
          link: "/products?category=DIY%20%26%20Hardware"
        }
      ]);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    // Ensure page scrolls to top on load
    scrollToTop();
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
        <div className="hero-content">
          <h1 className="hero-title">
            {heroSections[0].title}
          </h1>
          <p className="hero-subtitle">
            {heroSections[0].subtitle}
          </p>
          {/* Hero CTA Button */}
          <div className="hero-actions">
            <Link to="/products" className="btn btn-primary hero-cta">
              Shop Now
            </Link>
            <Link to="/new-arrivals" className="btn btn-secondary hero-cta">
              New Arrivals
            </Link>
          </div>
        </div>
      </section>

      {/* Content Display - Shows saved content from admin */}
      <ContentDisplay />

      {/* Featured Categories */}
      <section className="section">
        <div className="container">
          <div className="section-title">
            <h2>Featured Categories</h2>
          </div>
          <div className="categories-grid">
            {categories.length > 0 ? (
              categories.map((category, index) => (
                <div
                  key={index}
                  className="category-card"
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
                </div>
              ))
            ) : (
              <div className="categories-loading">
                <p>Loading categories...</p>
              </div>
            )}
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
                <div
                  key={product._id}
                >
                  <ProductCard product={product} />
                </div>
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
          <div className="banner-content">
            <h2>THE NEW<br />BLACK & WHITE COLLECTION</h2>
            <p>Embrace sophistication with our latest arrivals.</p>
            <Link to="/products" className="btn btn-primary">
              Shop The Collection
            </Link>
          </div>
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
                <div
                  key={product._id}
                >
                  <ProductCard product={product} />
                </div>
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
