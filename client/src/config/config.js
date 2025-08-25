const config = {
  development: {
    API_BASE_URL: 'http://localhost:5000'
  },
  production: {
    API_BASE_URL: 'https://your-app.onrender.com' // Replace with your actual Render URL
  }
};

export default config[process.env.NODE_ENV || 'development']; 