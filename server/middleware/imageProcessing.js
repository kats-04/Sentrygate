// import sharp from 'sharp';

// Middleware to process and validate uploaded images
export async function processAvatar(req, res, next) {
  if (!req.file) return next();
  try {
    // Validate file type (accept only images)
    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ error: 'Only image files are allowed.' });
    }
    // Optionally, limit file size (handled by multer config)
    // You can add more validation here if needed
    next();
  } catch (err) {
    next(err);
  }
}
