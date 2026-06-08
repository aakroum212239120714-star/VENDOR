const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('Cloudinary:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '❌ مفقود',
  api_key:    process.env.CLOUDINARY_API_KEY    ? '✅ موجود' : '❌ مفقود',
  api_secret: process.env.CLOUDINARY_API_SECRET ? '✅ موجود' : '❌ مفقود',
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'saase',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1000, quality: 'auto' }],
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('فقط صور JPG / PNG / WEBP مسموح بها'), false);
  }
};

// ✅ عرّف upload أولاً
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
});

// ✅ ثم استخدمه في uploadWithLog
const uploadWithLog = {
  single: (field) => (req, res, next) => {
    upload.single(field)(req, res, (err) => {
      if (err) {
        console.error('Upload error:', err);
        return next(err);
      }
      console.log('req.file keys:', req.file ? Object.keys(req.file) : 'NO FILE');
      console.log('req.file:', JSON.stringify(req.file));
      next();
    });
  },
  fields: (fields) => (req, res, next) => {
    upload.fields(fields)(req, res, (err) => {
      if (err) {
        console.error('Upload error:', err);
        return next(err);
      }
      console.log('req.files keys:', req.files ? Object.keys(req.files) : 'NO FILES');
      console.log('req.files:', JSON.stringify(req.files));
      next();
    });
  },
};

module.exports = uploadWithLog;