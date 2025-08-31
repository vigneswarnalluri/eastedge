import React from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import './Footer.css';

const Footer = () => {
  const { settings, loading } = useSettings();

  if (loading) {
    return (
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <p>Loading settings...</p>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* Company Info */}
          <div className="footer-section">
            <div className="footer-logo">
              <img src="/logo-footer.png" alt={`${settings.general.storeName} Logo`} className="footer-logo-image" />
            </div>
            <p className="footer-tagline">
              Curated essentials for the modern minimalist.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/shipping">Shipping & Returns</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="footer-section">
            <h4>Our Legal Pages</h4>
            <ul className="footer-links">
              <li><Link to="/terms">Terms and Conditions</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/disclaimer">Product Accuracy Disclaimer</Link></li>
              <li><Link to="/shipping">Shipping and Delivery</Link></li>
              <li><Link to="/returns">Refund and Returns Policy</Link></li>
              <li><Link to="/jurisdiction">Law and Jurisdiction</Link></li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="footer-section">
            <h4>Contact Info</h4>
            <div className="footer-contact">
              <p><strong>Email:</strong> {settings.general.contactEmail}</p>
              <p><strong>Phone:</strong> {settings.general.phoneNumber}</p>
              <p><strong>Address:</strong> {settings.store.businessAddress}</p>
            </div>
          </div>


        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p>&copy; 2025 {settings.general.storeName}. All rights reserved.</p>
            <p className="footer-credit">
              Designed by: <a href="https://kitek.agency" target="_blank" rel="noopener noreferrer">KiTek Group</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
