const config = {
  development: {
    API_BASE_URL: 'http://localhost:5000'
  },
  production: {
    API_BASE_URL: 'https://eastedge.onrender.com' // Your actual Render backend URL
  }
};

export default config[process.env.NODE_ENV || 'development']; 