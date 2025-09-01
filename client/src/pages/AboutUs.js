import React, { useEffect } from 'react';
import './AboutUs.css';
import { Link } from 'react-router-dom';
import { scrollToTop } from '../utils/scrollToTop';

const AboutUs = () => {
  useEffect(() => {
    // Scroll to top when page loads
    scrollToTop();
  }, []);

  return (
    <div className="about-us-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-image">
          <img src="/photo-1523381294911-8d3cead13475.jpg" alt="EastEdge Fashion and Apparel" />
        </div>
        <div className="hero-content">
          <h1>About EastEdge</h1>
          <p className="hero-subtitle">
            From Thread to Trend: The Art of Apparel
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="story-section">
        <div className="container">
          <h2>Our Story</h2>
          <div className="story-content">
            <p>
              Founded on the principles of quality craftsmanship and timeless design, EastEdge began its journey not in a boutique, but on the factory floor. With decades of experience in manufacturing premium apparel, we mastered the art of creating garments that stand the test of time. Our expertise in production led us to become a trusted wholesaler for brands across the nation.
            </p>
            <p>
              Today, we bring our passion directly to you. By controlling every step of the process—from sourcing the finest materials to the final stitch—we cut out the middleman to offer exceptional quality at an honest price. EastEdge is more than a brand; it's a promise of quality, born from a legacy of making things the right way.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="mission-vision-section">
        <div className="container">
          <div className="mission-vision-grid">
            <div className="mission-card">
              <h3>Our Mission</h3>
              <p>
                To deliver superior quality apparel with timeless style, making premium craftsmanship accessible to everyone, from our factory floor directly to your wardrobe.
              </p>
            </div>
            <div className="vision-card">
              <h3>Our Vision</h3>
              <p>
                To be the leading name in apparel, recognized for our vertical integration, unwavering commitment to quality, and our ability to set trends from the source.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="what-we-do-section">
        <div className="container">
          <h2>What We Do</h2>
          <div className="services-grid">
            <div className="service-card">
              <h3>Manufacturing</h3>
              <p>
                Our state-of-the-art facilities ensure every garment is produced with precision, quality control, and sustainable practices at its core.
              </p>
            </div>
            <div className="service-card">
              <h3>Wholesale</h3>
              <p>
                We are a trusted partner for businesses, providing high-volume, quality apparel with reliable supply chain management and competitive pricing.
              </p>
            </div>
            <div className="service-card">
              <h3>Retail</h3>
              <p>
                Through our online store, we bring our curated collections directly to you, offering premium apparel without the premium markup.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Experience EastEdge Quality</h2>
          <p>Discover our curated collections and experience the difference that decades of manufacturing expertise makes.</p>
          <div className="cta-buttons">
            <Link to="/products" className="btn-primary">Shop Now</Link>
            <Link to="/contact" className="btn-secondary">Contact Us</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
