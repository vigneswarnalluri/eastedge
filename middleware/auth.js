const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('❌ No token provided in auth middleware');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('🔍 JWT decoded:', decoded);
    
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      console.log('❌ User not found in auth middleware');
      return res.status(401).json({ message: 'Token is not valid' });
    }

    console.log('✅ User authenticated:', { id: user._id, email: user.email, isAdmin: user.isAdmin });
    
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth; 