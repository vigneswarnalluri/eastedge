import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './ContentDisplay.css';

const AnnouncementBar = () => {
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
      console.error('Error loading announcement content:', error);
      setLoading(false);
    }
  };

  if (loading || !content || !content.announcement || !content.announcement.enabled || !content.announcement.text) {
    return null;
  }

  return (
    <div className="announcement-bar">
      <div className="announcement-content">
        <span className="announcement-text">{content.announcement.text}</span>
        {content.announcement.linkType !== 'none' && content.announcement.buttonText && (
          <a 
            href={content.announcement.linkType === 'internal' ? content.announcement.targetPage : content.announcement.link}
            className="announcement-link"
            target={content.announcement.linkType === 'external' ? '_blank' : '_self'}
            rel={content.announcement.linkType === 'external' ? 'noopener noreferrer' : ''}
          >
            {content.announcement.buttonText}
          </a>
        )}
      </div>
    </div>
  );
};

export default AnnouncementBar; 