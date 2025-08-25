@echo off
echo 🚀 HostArmada Premium Deployment Preparation
echo ============================================

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Please run this script from the project root.
    pause
    exit /b 1
)

echo 📦 Installing dependencies...
npm install

echo 📦 Installing client dependencies...
cd client
npm install
cd ..

echo 🔨 Building React app for production...
npm run build

REM Check if build was successful
if not exist "client\build" (
    echo ❌ Build failed! Please check for errors.
    pause
    exit /b 1
)

echo ✅ Build successful!
echo 📁 Build folder created at: client\build\

echo.
echo 🎯 Files ready for HostArmada upload:
echo =====================================
echo ✅ server.js
echo ✅ package.json
echo ✅ package-lock.json
echo ✅ config.env
echo ✅ models/ (folder)
echo ✅ routes/ (folder)
echo ✅ client/build/ (entire build folder)
echo.

echo 📋 Next Steps for HostArmada:
echo =============================
echo 1. Login to HostArmada cPanel
echo 2. Enable Node.js in Software section
echo 3. Create Node.js app with server.js as startup file
echo 4. Upload all files to public_html/
echo 5. Set environment variables
echo 6. Install dependencies: npm install --production
echo 7. Start your application
echo.

echo 📖 See HOSTARMADA_DEPLOYMENT.md for detailed instructions
echo 🆘 HostArmada provides 24/7 support if you need help
echo.

echo 🎉 Your app is ready for HostArmada deployment!
pause 