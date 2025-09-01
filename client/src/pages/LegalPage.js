import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiArrowLeft, FiEdit, FiSave, FiX } from 'react-icons/fi';
import api from '../services/api';
import { scrollToTop } from '../utils/scrollToTop';
import './LegalPage.css';

const LegalPage = ({ pageType }) => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [legalContent, setLegalContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);

  const loadLegalContent = useCallback(async () => {
    try {
      setLoading(true);
      // Force use of default content instead of database
      setLegalContent(getDefaultContent(pageType));
      setLoading(false);
    } catch (error) {
      console.error('Error loading legal content:', error);
      setLegalContent(getDefaultContent(pageType));
      setLoading(false);
    }
  }, [pageType]);

  useEffect(() => {
    loadLegalContent();
    // Scroll to top when page loads
    scrollToTop();
  }, [loadLegalContent]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(legalContent);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await api.put('/api/content/section/legal-pages', {
        [pageType]: editContent
      });
      
      if (response.data) {
        setLegalContent(editContent);
        setIsEditing(false);
        alert('Content saved successfully!');
      }
    } catch (error) {
      console.error('Error saving legal content:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditContent(legalContent);
  };

  const getPageTitle = (pageType) => {
    const titles = {
      terms: 'Terms and Conditions',
      privacy: 'Privacy Policy',
      disclaimer: 'Product Accuracy Disclaimer',
      shipping: 'Shipping and Delivery',
      returns: 'Refund and Returns Policy',
      jurisdiction: 'Law and Jurisdiction'
    };
    return titles[pageType] || pageType;
  };

  const getDefaultContent = (pageType) => {
    const defaults = {
      terms: `Our Terms & Conditions

By using eastedge.co.in, you agree to abide by our terms and conditions. This includes using our products lawfully, respecting our intellectual property, and understanding that all content (images, text, design) belongs to EASTEDGE Clothing. Prices, policies, and collections are subject to change without notice. Misuse or fraudulent activity may lead to order cancellation or account suspension.

You agree to all Terms of Service along with the Privacy Policy on our website, which may be updated by us from time to time. Please check this page regularly to take notice of any changes we may have made to the Terms of Service.

Introduction

The domain name www.eastedge.co.in is a site operated by M/s Juket Styles, a partnership firm with the registered office at Hyderabad, Telangana, India

By accessing and using www.eastedge.co.in ("Website"), you agree to be bound by the following terms and conditions, along with our Privacy Policy. These may be updated periodically, and your continued use of the site constitutes acceptance of any changes.

1. Site Operator 
This website is operated by M/s Juket Styles, a registered partnership firm based in Hyderabad, Telangana, India.

2. Intellectual Property 
All content displayed on the Website—including but not limited to images, text, design, layout, trademarks, and logos—is the exclusive property of EASTEDGE Clothing. Unauthorised use, reproduction, or distribution is strictly prohibited.

3. Product & Pricing 
• Product images are for illustration purposes only. Actual colour, texture, or appearance may vary based on screen settings and production variations.  
• Descriptions, sizes, measurements, and prices are subject to change without prior notice.
• We do not guarantee the accuracy or completeness of product details at all times and reserve the right to correct errors or omissions as needed.

4. Order Cancellation & Refunds  
• Cancellations: You may cancel your order within 1 hour of placement. Once an order is packed or shipped, cancellations will not be accepted.  
• Refunds: Upon successful return inspection, refunds will be processed to the original payment method within 7–10 business days.

5. Return Policy 
Return requests must be initiated within 5 days of delivery and are subject to the following conditions:  
✔️ Eligible Items must be:  
• Unused, unwashed, and unworn  
• In original packaging with tags intact  
• Free from stains, fragrances, or visible damage  
❌ Non-Returnable Items include:  
• Discounted or sale items  
• Bundled sets with missing parts  
• Customised or altered products  
• Undergarments (for hygiene reasons)  
We reserve the right to reject any return that does not meet the above criteria.

6. Shipping & Delivery 
We aim for safe and timely deliveries. Delivery options and estimates are displayed during checkout. Delays may occur due to external circumstances (weather, logistics, etc.), and EASTEDGE shall not be held responsible for any such delays by third-party courier partners.

7. Communication Consent 
By ticking the consent box during sign-up, you agree to receive updates, offers, and notifications via SMS, Email, WhatsApp, RCS, or other electronic means. EASTEDGE is not liable for damages arising from fraudulent messages by third parties.

8. Third-Party Links & Content 
Links provided to platforms like Facebook or Twitter are for sharing purposes only. We disclaim responsibility for any content posted by users on third-party websites, whether linked directly or via official EASTEDGE channels.

9. Governing Law 
These terms are governed by the laws of India. Any disputes shall fall under the exclusive jurisdiction of the courts located in Hyderabad, Telangana.

10. Need Assistance?  
📩 For any questions or support, reach out to us at: support@eastedge.co.in

Address:
23-78/26/1, 14th Cross rd. , R.K.Nagar, Malkajgiri – 500047

Phone no. - +91 – 6302244544

Email – eastedge4@gmail.com`,
      
      privacy: `Privacy Policy

At EASTEDGE CLOTHING, your privacy is our priority. We collect your information solely to process orders, improve your shopping experience, and communicate with you regarding new collections or updates. Your data is securely stored and never shared with third parties, except as required to fullfill your orders. By using our site, you consent to our privacy practices. For any concerns, contact us at support@eastedge.co.in

By signing up and ticking the consent box, the User agrees to receive communications and notifications from Eastedge.co.in via SMS, Email, RCS, WhatsApp, or any other electronic medium. Eastedge shall not be responsible for any damages arising from fraudulent messages sent over the internet by third parties.

Third Party websites and Content

Our website provides links for sharing our content on Facebook, Twitter, and other such third-party websites. These are only for sharing and/or listing purposes, and we take no responsibility for the third-party websites and/or their contents listed on our website (www.eastedgeco.in) and disclaim all our liabilities arising out of any or all third-party websites.

We disclaim all liabilities and take no responsibility for the content that may be posted on such third-party websites by the users of such websites in their personal capacity on any of the above-mentioned links for sharing and/or listing purposes as well as any content and/or comments that may be posted by such users in their personal capacity on any official webpage of Eastedge.co.in on any social networking platform.

Address:
23-78/26/1, 14th Cross rd. , R.K.Nagar, Malkajgiri – 500047

Phone no. - +91 – 6302244544

Email – eastedge4@gmail.com`,
      
      disclaimer: `Product Accuracy Disclaimer

The product images displayed on this website are for illustrative purposes only and may not precisely reflect the actual product. Variations in color, texture, or appearance may occur due to differences in individual display settings, screen resolutions, or production batches.

All product sizes, dimensions, and measurements provided are approximate. While we make reasonable efforts to ensure the accuracy of all descriptions, specifications, and pricing, we do not warrant that such information is free from errors, complete, or current at all times.

We reserve the right to correct any inaccuracies, omissions, or typographical errors, and to modify or update product information at any time without prior notice.

Address:
23-78/26/1, 14th Cross rd. , R.K.Nagar, Malkajgiri – 500047

Phone no. - +91 – 6302244544

Email – eastedge4@gmail.com`,
      
      shipping: `Shipping and Delivery

At EASTEDGE, we aim to deliver your order safely and on time.

You will be presented with available delivery options during the order process, which may vary depending on your delivery location. An estimated delivery timeframe will be displayed on the order summary page at checkout.

We partner with third-party logistics and courier service providers ("Carriers") to facilitate product delivery. While we make every reasonable effort to ensure timely delivery, we rely on these third-party carriers, and as such, certain factors beyond our control (including but not limited to weather conditions, operational disruptions, customs clearance delays, or carrier errors) may affect delivery timelines.

In the event of any delay, we will endeavour to notify you promptly via email and/or SMS. However, we shall not be held liable for any delay or failure in delivery caused by such third-party carriers or by circumstances beyond our reasonable control.

Address:
23-78/26/1, 14th Cross rd. , R.K.Nagar, Malkajgiri – 500047

Phone no. - +91 – 6302244544

Email – eastedge4@gmail.com`,
      
      returns: `Refunds

The shoppers are requested to check the size guide before placing the order

You can cancel your order within 1 hr of placing it after that if order is packed or shipped Cancellations are not possible and not accepted.

Refunds are processed to the original payment method once the returned item is received and inspected. Please allow up to 7–10 business days for the refund to reflect.

Eligibility for Returns

You may initiate a return request within five (5) days of receiving your order, subject to the following conditions

Eligible Items Must Be:

1. Unworn, unwashed, and unused
2. In their original condition and packaging, with all original tags and labels intact
3. Free from stains, marks, fragrances (including perfume), or any visible damage

Returned items will undergo quality inspection. We reserve the right to reject any return that does not meet these criteria.

Non-Returnable Items Include:

1. Items purchased at a discount or on sale
2. Partial or incomplete sets from bundled orders
3. Customized, altered, or personalized products
4. Undergarments, due to hygiene considerations

We reserve the right to decline return requests that do not comply with this policy.

Need help?

Contact us at support@eastedge.co.in for questions related to refunds and returns.

Address:
23-78/26/1, 14th Cross rd. , R.K.Nagar, Malkajgiri – 500047

Phone no. - +91 – 6302244544

Email – eastedge4@gmail.com`,
      
      jurisdiction: `Law and Jurisdiction

These terms are governed by the laws of India. Any disputes shall fall under the exclusive jurisdiction of the courts located in Hyderabad, Telangana.

Address:
23-78/26/1, 14th Cross rd. , R.K.Nagar, Malkajgiri – 500047

Phone no. - +91 – 6302244544

Email – eastedge4@gmail.com`
    };
    return defaults[pageType] || 'Content not available.';
  };

  if (loading) {
    return (
      <div className="legal-page">
        <div className="container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading legal page...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="legal-page">
      <div className="container">
        {/* Back Button */}
        <button onClick={() => navigate(-1)} className="back-btn">
          <FiArrowLeft /> Back
        </button>

        {/* Page Header */}
        <div className="page-header">
          <h1>{getPageTitle(pageType)}</h1>
          {isAdmin && (
            <div className="admin-actions">
              {!isEditing ? (
                <button className="edit-btn" onClick={handleEdit}>
                  <FiEdit /> Edit Content
                </button>
              ) : (
                <div className="edit-actions">
                  <button className="save-btn" onClick={handleSave} disabled={saving}>
                    <FiSave /> {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button className="cancel-btn" onClick={handleCancel}>
                    <FiX /> Cancel
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Page Content */}
        <div className="page-content">
          {isEditing ? (
            <div className="edit-mode">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Enter content here..."
                rows="20"
                className="content-editor"
              />
            </div>
          ) : (
            <div className="view-mode">
              <pre className="content-display">{legalContent}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LegalPage; 