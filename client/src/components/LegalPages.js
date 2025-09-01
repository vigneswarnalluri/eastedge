import React from 'react';
import { Link } from 'react-router-dom';
import './LegalPages.css';

const LegalPages = () => {
  return (
    <div className="legal-pages-links">
      <h4>Our Legal Pages</h4>
      <ul className="footer-links">
        <li>
          <Link to="/legal/terms">
            Terms and Conditions
          </Link>
        </li>
        <li>
          <Link to="/legal/privacy">
            Privacy Policy
          </Link>
        </li>
        <li>
          <Link to="/legal/disclaimer">
            Product Accuracy Disclaimer
          </Link>
        </li>
        <li>
          <Link to="/legal/shipping">
            Shipping and Delivery
          </Link>
        </li>
        <li>
          <Link to="/legal/returns">
            Refund and Returns Policy
          </Link>
        </li>
        <li>
          <Link to="/legal/jurisdiction">
            Law and Jurisdiction
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default LegalPages; 