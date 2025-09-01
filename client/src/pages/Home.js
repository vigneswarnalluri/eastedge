import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ContentDisplay from '../components/ContentDisplay';
import ProductCard from '../components/ProductCard';
import api from '../services/api';
import { scrollToTop } from '../utils/scrollToTop';
import './Home.css';

const Home = () => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const heroSections = [
    {
      title: "TIMELESS.\nESSENTIALS.",
      subtitle: "Discover our curated selection of black & white designs.",
      cta: "Shop Now",
      link: "/products",
      image: "/accessories.jpg"
    },
    {
      title: "PURE.\nDESIGN.",
      subtitle: "Experience the beauty of simplicity and form.",
      cta: "Explore Collection",
      link: "/products",
      image: "/puredesign.jpg"
    },
    {
      title: "MEN'S\nSTYLE.",
      subtitle: "Elevate your wardrobe with premium men's clothing.",
      cta: "Shop Men's",
      link: "/products?category=Men's%20Clothing",
      image: "/MensClothing.jpg"
    }
  ];

  // Auto-advance slides
  useEffect(() => {
    console.log('Hero sections:', heroSections.length, 'slides');
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSections.length);
    }, 3000); // Change slide every 3 seconds

    return () => clearInterval(interval);
  }, [heroSections.length]);



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
      
      // Transform categories data to match our UI structure - only include specific clothing categories
      let transformedCategories = categoriesData
        .filter(category => !category.parentCategory) // Only main categories
        .filter(category => ["Men's Clothing", "Women's Clothing", "Special Clothing's"].includes(category.name)) // Only include specified categories
        .map(category => {
          // Force use of specific uploaded images regardless of database content
          let imagePath;
                     switch (category.name.toLowerCase()) {
             case "men's clothing":
               imagePath = "/MensClothing.jpg";
               break;
             case "women's clothing":
               imagePath = "/Women'sClothing.jpg";
               break;
            case "special clothing's":
              imagePath = '/accessories.jpg';
              break;
            default:
              imagePath = '/accessories.jpg'; // Default fallback
          }
          
          return {
            name: category.name,
            image: imagePath,
            link: `/products?category=${encodeURIComponent(category.name)}`,
            description: category.description
          };
        });
      
      // If we don't have the required categories from API, add them as fallbacks
      const requiredCategories = ["Men's Clothing", "Women's Clothing", "Special Clothing's"];
      const existingNames = transformedCategories.map(cat => cat.name);
      
      requiredCategories.forEach(categoryName => {
        if (!existingNames.includes(categoryName)) {
          let imagePath;
                     switch (categoryName.toLowerCase()) {
             case "men's clothing":
               imagePath = "/MensClothing.jpg";
               break;
             case "women's clothing":
               imagePath = "/Women'sClothing.jpg";
               break;
            case "special clothing's":
              imagePath = '/accessories.jpg';
              break;
            default:
              imagePath = '/accessories.jpg';
          }
          
          transformedCategories.push({
            name: categoryName,
            image: imagePath,
            link: `/products?category=${encodeURIComponent(categoryName)}`
          });
        }
      });
      
      setCategories(transformedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback to required categories if API fails
      setCategories([
                 {
           name: "Men's Clothing",
           image: "/MensClothing.jpg",
           link: "/products?category=Men%27s%20Clothing"
         },
        {
          name: "Women's Clothing",
          image: "/Women'sClothing.jpg",
          link: "/products?category=Women%27s%20Clothing"
        },
        {
          name: "Special Clothing's",
          image: "/accessories.jpg",
          link: "/products?category=Special%20Clothing%27s"
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
        <div className="hero-slider">
          {heroSections.map((slide, index) => (
            <div
              key={index}
              className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="hero-content">
                <h1 className="hero-title">
                  {slide.title}
                </h1>
                <p className="hero-subtitle">
                  {slide.subtitle}
                </p>
                {/* Hero CTA Button */}
                <div className="hero-actions">
                  <Link to={slide.link} className="btn btn-primary hero-cta">
                    {slide.cta}
                  </Link>
                  <Link to="/new-arrivals" className="btn btn-secondary hero-cta">
                    New Arrivals
                  </Link>
                </div>
              </div>
            </div>
          ))}
          

        </div>
      </section>

      {/* Content Display - Shows saved content from admin */}
      {/* <ContentDisplay /> */}

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

      {/* Featured Products */}
      <section className="section">
        <div className="container">
          <div className="section-title">
            <h2>Featured Products</h2>
          </div>
          <div className="products-grid">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product, index) => (
                <ProductCard key={product._id} product={product} />
              ))
            ) : (
              <div className="no-products">
                <p>Loading featured products...</p>
                <Link to="/products" className="btn btn-secondary">
                  View All Products
                </Link>
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
                <ProductCard key={product._id} product={product} />
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
                <ProductCard key={product._id} product={product} />
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
