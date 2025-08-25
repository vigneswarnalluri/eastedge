# 🚀 HostArmada Premium Deployment Guide

## 🎯 Why HostArmada Premium is Perfect for Your App

- **Node.js Support** - Full support for Node.js applications
- **MongoDB Support** - Can host your MongoDB database
- **SSL Certificates** - Free SSL included
- **Performance** - Premium hosting with excellent uptime
- **Support** - 24/7 expert support
- **cPanel** - Easy management interface

## 📋 Pre-Deployment Checklist

- [ ] HostArmada Premium account activated
- [ ] Domain name configured
- [ ] Node.js enabled in hosting panel
- [ ] MongoDB database created (or use external MongoDB Atlas)
- [ ] Local build tested successfully

## 🔧 HostArmada Setup

### **Step 1: Enable Node.js**
1. **Login to cPanel**
2. **Find "Node.js"** in the Software section
3. **Create a new Node.js app:**
   - **Node.js version:** 18.x or 20.x (LTS)
   - **Application mode:** Production
   - **Application root:** Your domain or subdomain
   - **Application URL:** Your domain
   - **Application startup file:** `server.js`

### **Step 2: Database Setup**
**Option A: HostArmada MongoDB (if available)**
1. Create MongoDB database in cPanel
2. Note down connection details

**Option B: MongoDB Atlas (Recommended)**
1. Keep using your current MongoDB Atlas connection
2. Ensure IP whitelist includes HostArmada servers

## 🚀 Deployment Process

### **Step 1: Prepare Your Files**
```bash
# Run the deployment script locally first
deploy.bat
```

### **Step 2: Upload Files**
1. **Use File Manager** in cPanel or **FTP/SFTP**
2. **Upload these files/folders:**
   ```
   ├── server.js
   ├── package.json
   ├── package-lock.json
   ├── config.env
   ├── models/
   ├── routes/
   └── client/build/  (entire build folder)
   ```

### **Step 3: Configure Environment Variables**
Create/update `config.env` on HostArmada:
```env
NODE_ENV=production
MONGO_URI=mongodb+srv://eastedge:eastedge@cluster0.ab9we9f.mongodb.net/eastedge
JWT_SECRET=eastedge_super_secret_jwt_key_2024_secure_and_unique
RAZORPAY_KEY_ID=rzp_live_SKhuMIkNcoxTeR
RAZORPAY_KEY_SECRET=47CPJZq4Qr8jRJO4RZmzD12c
PORT=3000
```

### **Step 4: Install Dependencies**
1. **SSH into your hosting** (if available)
2. **Navigate to your app directory**
3. **Run:**
   ```bash
   npm install --production
   ```

### **Step 5: Start Your Application**
1. **In cPanel Node.js section:**
   - **Start command:** `npm start`
   - **Node.js version:** 18.x or 20.x
   - **Application URL:** Your domain
2. **Click "Create" or "Update"**

## 🌐 Domain Configuration

### **Option 1: Root Domain**
- **Application URL:** `yourdomain.com`
- **Document Root:** `/public_html/`

### **Option 2: Subdomain**
- **Application URL:** `app.yourdomain.com`
- **Document Root:** `/public_html/app/`

## 🔒 SSL Configuration
1. **HostArmada provides free SSL**
2. **Auto-install SSL certificate**
3. **Force HTTPS redirect** (recommended)

## 📁 File Structure on HostArmada
```
public_html/
├── server.js              # Main server file
├── package.json           # Dependencies
├── config.env             # Environment variables
├── models/                # Database models
├── routes/                # API routes
└── client/
    └── build/             # React production build
        ├── static/
        ├── index.html
        └── ...
```

## 🧪 Testing Your Deployment

### **Test API Endpoints:**
- `https://yourdomain.com/api/health`
- `https://yourdomain.com/api/products`
- `https://yourdomain.com/api/categories`

### **Test Frontend:**
- Visit your domain
- Check if React app loads
- Test navigation and features

## 🚨 Troubleshooting

### **Common Issues:**

1. **App Not Starting:**
   - Check Node.js version compatibility
   - Verify `server.js` is the startup file
   - Check error logs in cPanel

2. **Database Connection:**
   - Verify MongoDB connection string
   - Check if MongoDB Atlas IP whitelist includes HostArmada
   - Test connection locally first

3. **Build Issues:**
   - Ensure `client/build/` folder is uploaded
   - Check file permissions
   - Verify all dependencies are installed

4. **Port Issues:**
   - HostArmada usually uses port 3000
   - Check if port is available
   - Use environment variable `PORT`

### **Getting Help:**
1. **Check cPanel error logs**
2. **Contact HostArmada support** (24/7 available)
3. **Test locally first** to isolate issues

## 📱 Post-Deployment

- [ ] Test all features thoroughly
- [ ] Set up monitoring (if available)
- [ ] Configure backups
- [ ] Test payment integration
- [ ] Verify SSL certificate
- [ ] Test mobile responsiveness

## 🎉 Success Checklist

- [ ] Application accessible at your domain
- [ ] API endpoints responding correctly
- [ ] Frontend loading without errors
- [ ] Database connection working
- [ ] User authentication functional
- [ ] Payment system working
- [ ] SSL certificate active
- [ ] All features tested

---

## 🆘 Need Help?

**HostArmada Support:**
- **24/7 Live Chat** available
- **Ticket System** for complex issues
- **Phone Support** for premium customers

**Your App Details:**
- **Type:** MERN Stack Ecommerce
- **Backend:** Node.js + Express
- **Frontend:** React (built)
- **Database:** MongoDB Atlas
- **Payment:** Razorpay integration

---

**Ready to deploy on HostArmada? Your premium hosting will give you excellent performance! 🚀** 