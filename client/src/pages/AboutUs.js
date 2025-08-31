import React from 'react';
import { motion } from 'framer-motion';
import { FiAward, FiUsers, FiGlobe, FiHeart, FiTrendingUp, FiShield } from 'react-icons/fi';
import './AboutUs.css';
import { Link } from 'react-router-dom'; // Added Link import

const AboutUs = () => {
  const values = [
    {
      icon: <FiHeart />,
      title: 'Passion for Quality',
      description: 'We believe in creating products that not only look good but feel good and last long.'
    },
    {
      icon: <FiShield />,
      title: 'Sustainability',
      description: 'Committed to eco-friendly practices and responsible sourcing of materials.'
    },
    {
      icon: <FiUsers />,
      title: 'Community First',
      description: 'Building relationships with our customers and supporting local artisans.'
    },
    {
      icon: <FiTrendingUp />,
      title: 'Innovation',
      description: 'Constantly evolving our designs and processes to meet modern needs.'
    }
  ];

  const milestones = [
    {
      year: '2018',
      title: 'Founded',
      description: 'Started as a small boutique in Hyderabad with a vision for timeless fashion.'
    },
    {
      year: '2020',
      title: 'Online Launch',
      description: 'Expanded to e-commerce, reaching customers across India.'
    },
    {
      year: '2022',
      title: 'First Store',
      description: 'Opened our first store in Malkajgiri, Hyderabad.'
    },
    {
      year: '2024',
      title: 'National Expansion',
      description: 'Expanding across major cities in India with sustainable growth.'
    }
  ];

  const team = [
    {
      name: 'Sarah Johnson',
      position: 'Founder & CEO',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      bio: 'Former fashion editor with 15+ years in the industry. Passionate about sustainable luxury.'
    },
    {
      name: 'Michael Chen',
      position: 'Creative Director',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      bio: 'Award-winning designer known for minimalist aesthetics and innovative materials.'
    },
    {
      name: 'Emma Rodriguez',
      position: 'Head of Sustainability',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      bio: 'Environmental scientist leading our commitment to sustainable practices.'
    },
    {
      name: 'David Kim',
      position: 'Operations Manager',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      bio: 'Supply chain expert ensuring quality and ethical sourcing across all operations.'
    }
  ];

  const stats = [
    { number: '50K+', label: 'Happy Customers' },
    { number: '25+', label: 'Cities Served' },
    { number: '100%', label: 'Sustainable Materials' },
    { number: '24/7', label: 'Customer Support' }
  ];

  return (
    <div className="about-us-page">
      {/* Hero Section with New Background */}
      <section className="hero-section geometric-bg geometric-bg-dark geometric-bg-xl">
        <div className="hero-image">
          <img src="/man-815795.jpg" alt="Our Story" />
        </div>
        <div className="hero-content">
          <h1>Our Story</h1>
          <p className="hero-subtitle">
            We believe in creating timeless pieces that speak to the soul. 
            Every design tells a story of craftsmanship, passion, and purpose.
          </p>
        </div>
      </section>

      {/* Mission Section with Space Shuttle Background */}
      <section className="mission-section space-shuttle-bg">
        <div className="container">
          <div className="section-header">
            <h2>Our Mission & Vision</h2>
            <p>Driving innovation through sustainable design</p>
          </div>
          <div className="mission-content">
            <div className="mission-item">
              <h2>Mission</h2>
              <p>
                To create exceptional products that inspire and empower individuals 
                to express their unique style while maintaining the highest standards 
                of quality and sustainability.
              </p>
            </div>
            <div className="mission-item">
              <h2>Vision</h2>
              <p>
                To become the leading brand in sustainable luxury, setting new 
                standards for ethical production and innovative design in the fashion industry.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section with Space Shuttle Background */}
      <section className="values-section space-shuttle-bg">
        <div className="container">
          <div className="section-header">
            <h2>Our Core Values</h2>
            <p>The principles that guide everything we do</p>
          </div>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">🎨</div>
              <h3>Creativity</h3>
              <p>We push boundaries and explore new possibilities in design</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🌱</div>
              <h3>Sustainability</h3>
              <p>Committed to environmental responsibility and ethical practices</p>
            </div>
            <div className="value-card">
              <div className="value-icon">✨</div>
              <h3>Quality</h3>
              <p>Every product meets our exacting standards of excellence</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🤝</div>
              <h3>Community</h3>
              <p>Building meaningful connections with our customers and partners</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section with Space Shuttle Background */}
      <section className="stats-section space-shuttle-bg">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">10+</div>
              <div className="stat-label">Years of Excellence</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">50K+</div>
              <div className="stat-label">Happy Customers</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">100%</div>
              <div className="stat-label">Sustainable Materials</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Customer Support</div>
            </div>
          </div>
        </div>
      </section>





      {/* Sustainability Section with Space Shuttle Background */}
      <section className="sustainability-section space-shuttle-bg">
        <div className="container">
          <div className="section-header">
            <h2>Our Commitment to Sustainability</h2>
            <p>Protecting the planet, one product at a time</p>
          </div>
          <div className="sustainability-content">
            <div className="sustainability-text">
              <h2>Eco-Friendly Practices</h2>
              <p>
                We're committed to reducing our environmental impact through 
                innovative practices and responsible sourcing.
              </p>
              <ul className="sustainability-list">
                <li>100% organic and recycled materials</li>
                <li>Carbon-neutral production processes</li>
                <li>Zero-waste packaging solutions</li>
                <li>Fair trade partnerships</li>
                <li>Renewable energy usage</li>
              </ul>
            </div>
            <div className="sustainability-image">
              <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Sustainability" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section with Space Shuttle Background */}
      <section className="cta-section space-shuttle-bg">
        <div className="container">
          <div className="cta-content">
            <h2>Join Our Journey</h2>
            <p>
              Be part of a movement that values quality, sustainability, and 
              timeless design. Discover what makes us different.
            </p>
            <div className="cta-buttons">
              <Link to="/products" className="btn btn-primary">
                Shop the Collection
              </Link>
              <Link to="/contact" className="btn btn-secondary">
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
