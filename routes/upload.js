const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(__dirname, '../client/public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to only allow images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Upload single image
router.post('/image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    // Return the file path relative to public directory
    const imagePath = `/uploads/${req.file.filename}`;
    
    res.json({
      success: true,
      message: 'Image uploaded successfully',
      imagePath: imagePath,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to upload image',
      error: error.message 
    });
  }
});

// Upload multiple images
router.post('/images', upload.array('images', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images uploaded' });
    }

    const imagePaths = req.files.map(file => `/uploads/${file.filename}`);
    
    res.json({
      success: true,
      message: 'Images uploaded successfully',
      imagePaths: imagePaths,
      filenames: req.files.map(file => file.filename)
    });
  } catch (error) {
    console.error('Images upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to upload images',
      error: error.message 
    });
  }
});

// Delete image
router.delete('/image/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../client/public/uploads', filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ success: true, message: 'Image deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Image not found' });
    }
  } catch (error) {
    console.error('Image deletion error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete image',
      error: error.message 
    });
  }
});

module.exports = router; 