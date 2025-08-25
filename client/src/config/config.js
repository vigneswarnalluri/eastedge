const config = {
  // API base URL - will be different for development vs production
  API_BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://your-backend-url.onrender.com' // Replace with your actual backend URL
    : 'http://localhost:5000',
  
  // App configuration
  APP_NAME: 'EastEdge',
  APP_VERSION: '1.0.0',
  
  // Feature flags
  ENABLE_ANALYTICS: process.env.NODE_ENV === 'production',
  ENABLE_LOGGING: process.env.NODE_ENV === 'production',
};

export default config; 