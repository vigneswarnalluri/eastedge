# 🚀 HostArmada Quick Reference

## ⚡ 5-Minute Deployment

### **Step 1: Prepare Files**
```bash
# Run this script
hostarmada-deploy.bat
```

### **Step 2: cPanel Setup**
1. **Login to HostArmada cPanel**
2. **Software → Node.js**
3. **Create App:**
   - **Version:** 18.x or 20.x
   - **Startup:** `server.js`
   - **URL:** Your domain

### **Step 3: Upload Files**
**Upload to public_html/:**
- ✅ `server.js`
- ✅ `package.json`
- ✅ `config.env`
- ✅ `models/` folder
- ✅ `routes/` folder
- ✅ `client/build/` folder

### **Step 4: Environment Variables**
**Create config.env:**
```env
NODE_ENV=production
MONGO_URI=mongodb+srv://eastedge:eastedge@cluster0.ab9we9f.mongodb.net/eastedge
JWT_SECRET=eastedge_super_secret_jwt_key_2024_secure_and_unique
RAZORPAY_KEY_ID=rzp_live_SKhuMIkNcoxTeR
RAZORPAY_KEY_SECRET=47CPJZq4Qr8jRJO4RZmzD12c
PORT=3000
```

### **Step 5: Install & Start**
```bash
npm install --production
npm start
```

## 🎯 Your App Will Be Live At:
- **Domain:** `yourdomain.com`
- **API:** `https://yourdomain.com/api/*`
- **Frontend:** `https://yourdomain.com`

## 🔧 If Something Goes Wrong:
1. **Check cPanel error logs**
2. **Contact HostArmada 24/7 support**
3. **Verify Node.js version compatibility**
4. **Check file permissions**

## 📞 HostArmada Support:
- **Live Chat:** 24/7 available
- **Ticket System:** For complex issues
- **Phone:** Premium customer support

---

**Ready to deploy? Run `hostarmada-deploy.bat` and follow the steps! 🚀** 