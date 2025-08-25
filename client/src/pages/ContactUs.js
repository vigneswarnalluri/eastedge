import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiPhone, FiMapPin, FiClock, FiSend } from 'react-icons/fi';
import './ContactUs.css';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      
      // Reset status after 5 seconds
      setTimeout(() => setSubmitStatus(null), 5000);
    }, 2000);
  };

  const contactInfo = [
    {
      icon: <FiMail />,
      title: 'Email Us',
      details: ['info@eastedge.in'],
      action: 'mailto:info@eastedge.in'
    },
    {
      icon: <FiPhone />,
      title: 'Call Us',
      details: ['+91 6302244544'],
      action: 'tel:+916302244544'
    },
    {
      icon: <FiMapPin />,
      title: 'Visit Us',
      details: ['Malkajgiri, Hyderabad', 'Telangana, India'],
      action: 'https://maps.google.com'
    },
    {
      icon: <FiClock />,
      title: 'Business Hours',
      details: ['Mon-Fri: 9AM-6PM', 'Sat: 10AM-4PM'],
      action: null
    }
  ];

  const faqs = [
    {
      question: 'How can I track my order?',
      answer: 'You can track your order by logging into your account and visiting the order history section, or by using the tracking number sent to your email.'
    },
    {
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return policy for all unused items in their original packaging. Returns are free for orders over $50.'
    },
    {
      question: 'Do you ship internationally?',
      answer: 'Yes, we ship to most countries worldwide. Shipping costs and delivery times vary by location.'
    },
    {
      question: 'How can I change or cancel my order?',
      answer: 'Orders can be modified or cancelled within 2 hours of placement. Please contact our customer service team immediately.'
    }
  ];

  return (
    <div className="contact-us-page">
      <div className="container">
        {/* Page Header */}
        <motion.div 
          className="page-header"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>Contact Us</h1>
          <p>We'd love to hear from you. Get in touch with us for any questions, feedback, or support.</p>
        </motion.div>

        <div className="contact-content">
          {/* Contact Information */}
          <motion.div 
            className="contact-info-section"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2>Get in Touch</h2>
            <p>Choose the most convenient way to reach us. Our team is here to help you with any questions or concerns.</p>
            
            <div className="contact-cards">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={index}
                  className="contact-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="contact-icon">
                    {info.icon}
                  </div>
                  <h3>{info.title}</h3>
                  {info.details.map((detail, idx) => (
                    <p key={idx}>{detail}</p>
                  ))}
                  {info.action && (
                    <a href={info.action} className="contact-action">
                      {info.title === 'Email Us' ? 'Send Email' : 
                       info.title === 'Call Us' ? 'Call Now' : 'Get Directions'}
                    </a>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div 
            className="contact-form-section"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2>Send us a Message</h2>
            <p>Fill out the form below and we'll get back to you as soon as possible.</p>
            
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your email address"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="subject">Subject *</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  placeholder="What is this about?"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows="6"
                  placeholder="Tell us more about your inquiry..."
                />
              </div>
              
              <button 
                type="submit" 
                className="submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="loading-text">Sending...</span>
                ) : (
                  <>
                    <FiSend />
                    Send Message
                  </>
                )}
              </button>
            </form>

            {submitStatus === 'success' && (
              <motion.div 
                className="success-message"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <p>Thank you! Your message has been sent successfully. We'll get back to you soon.</p>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* FAQ Section */}
        <motion.section 
          className="faq-section"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="faq-header">
            <h2>Frequently Asked Questions</h2>
            <p>Find quick answers to common questions about our products and services.</p>
          </div>
          
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                className="faq-item"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
              >
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Map Section */}
        <motion.section 
          className="map-section"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="map-header">
            <h2>Find Us</h2>
            <p>Visit our store in Malkajgiri, Hyderabad, Telangana.</p>
          </div>
          
          <div className="map-container">
            <div className="map-placeholder">
              <FiMapPin className="map-icon" />
              <p>Interactive Map</p>
              <small>Malkajgiri, Hyderabad, Telangana, India</small>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default ContactUs;
