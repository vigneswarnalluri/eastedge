import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './ContentDisplay.css';

const ContentDisplay = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    loadContent();
  }, []);

  // Auto-slide effect
  useEffect(() => {
    if (content && content.heroSlides && content.heroSlides.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide(prev => 
          prev === content.heroSlides.filter(slide => slide.active).length - 1 ? 0 : prev + 1
        );
      }, 3000); // Change slide every 3 seconds

      return () => clearInterval(interval);
    }
  }, [content]);

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

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const goToNextSlide = () => {
    if (content && content.heroSlides) {
      const activeSlides = content.heroSlides.filter(slide => slide.active);
      setCurrentSlide(prev => 
        prev === activeSlides.length - 1 ? 0 : prev + 1
      );
    }
  };

  const goToPrevSlide = () => {
    if (content && content.heroSlides) {
      const activeSlides = content.heroSlides.filter(slide => slide.active);
      setCurrentSlide(prev => 
        prev === 0 ? activeSlides.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return <div className="content-loading">Loading content...</div>;
  }

  if (!content) {
    return <div className="content-error">No content available</div>;
  }

  const activeSlides = content.heroSlides ? content.heroSlides.filter(slide => slide.active).sort((a, b) => a.order - b.order) : [];

  return (
    <div className="content-display">
      {/* Hero Slider */}
      {activeSlides.length > 0 && (
        <div className="hero-slider">
          {activeSlides.map((slide, index) => (
            <div 
              key={index} 
              className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
            >
              <div className="slide-content">
                <h1 className="slide-title">{slide.title}</h1>
                <p className="slide-description">{slide.description}</p>
                {slide.ctaText && slide.ctaLink && (
                  <a href={slide.ctaLink} className="slide-cta">
                    {slide.ctaText}
                  </a>
                )}
              </div>
              {slide.imagePreview && (
                <div className="slide-image">
                  <img src={slide.imagePreview} alt={slide.title} />
                </div>
              )}
            </div>
          ))}
          
          {/* Navigation Arrows */}
          {activeSlides.length > 1 && (
            <>
              <button className="slide-nav prev" onClick={goToPrevSlide}>
                ‹
              </button>
              <button className="slide-nav next" onClick={goToNextSlide}>
                ›
              </button>
            </>
          )}
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
    </div>
  );
};

export default ContentDisplay; 