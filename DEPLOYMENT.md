# 🚀 Deployment Guide for EastEdge Ecommerce

## 📋 Pre-Deployment Checklist

- [ ] Remove proxy from client/package.json ✅
- [ ] Create config files for API URLs ✅
- [ ] Update server.js for production builds ✅
- [ ] Test build process locally
- [ ] Set up environment variables
- [ ] Choose deployment platform

## 🌐 Deployment Options

### **Option 1: Render (Recommended - Free)**

1. **Sign up at [render.com](https://render.com)**
2. **Connect your GitHub repository**
3. **Create a new Web Service**
4. **Configure the service:**

   **Build Command:**
   ```bash
   npm run install-client && npm run build
   ```

   **Start Command:**
   ```bash
   npm start
   ```

   **Environment Variables:**
   ```
   MONGO_URI=mongodb+srv://eastedge:eastedge@cluster0.ab9we9f.mongodb.net/eastedge
   JWT_SECRET=eastedge_super_secret_jwt_key_2024_secure_and_unique
   NODE_ENV=production
   RAZORPAY_KEY_ID=rzp_live_SKhuMIkNcoxTeR
   RAZORPAY_KEY_SECRET=47CPJZq4Qr8jRJO4RZmzD12c
   ```

5. **Deploy and get your backend URL**
6. **Update the config file with your backend URL**

### **Option 2: Railway (Free Tier)**

1. **Sign up at [railway.app](https://railway.app)**
2. **Connect your GitHub repo**
3. **Set environment variables**
4. **Deploy automatically**

### **Option 3: Vercel + Railway (Frontend + Backend)**

**Backend (Railway):**
- Deploy Node.js server
- Set environment variables
- Get backend URL

**Frontend (Vercel):**
- Deploy React app
- Update API base URL in config
- Set environment variables

## 🔧 Local Build Test

Before deploying, test the build process locally:

```bash
# Install dependencies
npm install
cd client && npm install
cd ..

# Build the React app
npm run build

# Test production build
NODE_ENV=production npm start
```

## 📁 File Structure for Production

```
ecommerce/
├── client/
│   ├── build/          # Production build (generated)
│   ├── src/
│   │   ├── config/     # API configuration
│   │   └── services/   # API service
│   └── package.json
├── server.js           # Main server file
├── package.json        # Backend dependencies
└── config.env          # Environment variables
```

## 🔑 Environment Variables

Create a `.env` file for production:

```env
NODE_ENV=production
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

## 🚀 Deployment Steps

### **Step 1: Prepare Repository**
```bash
# Ensure all changes are committed
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### **Step 2: Deploy Backend**
1. Choose your deployment platform
2. Connect your repository
3. Set environment variables
4. Deploy and get your backend URL

### **Step 3: Update Frontend Config**
Update `client/src/config/config.js`:
```javascript
API_BASE_URL: process.env.NODE_ENV === 'production' 
  ? 'https://your-actual-backend-url.com' // Your deployed backend URL
  : 'http://localhost:5000',
```

### **Step 4: Deploy Frontend**
1. Deploy to your chosen platform
2. Set environment variables
3. Build and deploy

## 🧪 Testing Deployment

1. **Test API endpoints** using Postman or similar
2. **Test frontend functionality**
3. **Test payment integration**
4. **Test user authentication**
5. **Test product management**

## 📱 Post-Deployment

- [ ] Set up custom domain (optional)
- [ ] Configure SSL certificates
- [ ] Set up monitoring and logging
- [ ] Test all features thoroughly
- [ ] Set up backup and recovery

## 🆘 Troubleshooting

### **Common Issues:**

1. **Build Failures:**
   - Check Node.js version compatibility
   - Ensure all dependencies are installed
   - Check for syntax errors

2. **API Connection Issues:**
   - Verify backend URL in config
   - Check CORS settings
   - Verify environment variables

3. **Database Connection:**
   - Check MongoDB connection string
   - Verify network access
   - Check authentication credentials

## 📞 Support

If you encounter issues during deployment:
1. Check the platform's documentation
2. Review error logs
3. Test locally first
4. Check environment variables

---

**Happy Deploying! 🎉** 