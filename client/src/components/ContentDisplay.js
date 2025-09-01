import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './ContentDisplay.css';

const ContentDisplay = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const response = await api.get('/api/content');
      setContent(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading content:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="content-loading">Loading content...</div>;
  }

  if (!content) {
    return <div className="content-error">No content available</div>;
  }

  return (
    <div className="content-display">
      {/* Announcement Bar */}
      {content.announcement && content.announcement.enabled && content.announcement.text && (
        <div className="announcement-bar">
          <div className="announcement-content">
            <span className="announcement-text">{content.announcement.text}</span>
            {content.announcement.link && (
              <a 
                href={content.announcement.link} 
                className="announcement-link"
                target={content.announcement.linkType === 'external' ? '_blank' : '_self'}
                rel={content.announcement.linkType === 'external' ? 'noopener noreferrer' : ''}
              >
                {content.announcement.buttonText || 'Learn More'}
              </a>
            )}
          </div>
        </div>
      )}

      {/* Promotional Banner */}
      {content.promotionalBanner && content.promotionalBanner.enabled && content.promotionalBanner.title && (
        <div className="promotional-banner">
          <div className="banner-content">
            <h2 className="banner-title">{content.promotionalBanner.title}</h2>
            {content.promotionalBanner.ctaText && (
              <button className="banner-cta">
                {content.promotionalBanner.ctaText}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Site Info */}
      {content.siteSettings && (
        <div className="site-info">
          <div className="container">
            <h2>{content.siteSettings.siteName}</h2>
            <p className="site-description">{content.siteSettings.siteDescription}</p>
            <div className="contact-info">
              {content.siteSettings.contactEmail && (
                <p>Email: {content.siteSettings.contactEmail}</p>
              )}
              {content.siteSettings.phoneNumber && (
                <p>Phone: {content.siteSettings.phoneNumber}</p>
              )}
              {content.siteSettings.address && (
                <p>Address: {content.siteSettings.address}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentDisplay; 