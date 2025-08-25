# 🚀 Quick Deploy Guide

## ⚡ Fast Deployment (5 minutes)

### **Step 1: Choose Platform**
- **Render** (Recommended): [render.com](https://render.com) - Free tier available
- **Railway**: [railway.app](https://railway.app) - Free tier available

### **Step 2: Deploy Backend**
1. **Sign up** and connect your GitHub repo
2. **Create Web Service** with these settings:
   - **Build Command:** `npm run install-client && npm run build`
   - **Start Command:** `npm start`
3. **Set Environment Variables:**
   ```
   MONGO_URI=mongodb+srv://eastedge:eastedge@cluster0.ab9we9f.mongodb.net/eastedge
   JWT_SECRET=eastedge_super_secret_jwt_key_2024_secure_and_unique
   NODE_ENV=production
   RAZORPAY_KEY_ID=rzp_live_SKhuMIkNcoxTeR
   RAZORPAY_KEY_SECRET=47CPJZq4Qr8jRJO4RZmzD12c
   ```
4. **Deploy** and copy your backend URL

### **Step 3: Update Frontend Config**
Edit `client/src/config/config.js`:
```javascript
API_BASE_URL: process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-url.onrender.com' // Paste your backend URL here
  : 'http://localhost:5000',
```

### **Step 4: Deploy Frontend**
1. **Deploy to same platform** or Vercel
2. **Set environment variables**
3. **Build and deploy**

## 🎯 Your App Will Be Live At:
- **Backend API:** `https://your-app-name.onrender.com`
- **Frontend:** `https://your-frontend-url.com`

## 🔧 If You Need Help:
1. Check `DEPLOYMENT.md` for detailed instructions
2. Run `deploy.bat` (Windows) or `deploy.sh` (Mac/Linux) locally first
3. Test the build process before deploying

---

**Ready to deploy? Go to [render.com](https://render.com) and get started! 🚀** 