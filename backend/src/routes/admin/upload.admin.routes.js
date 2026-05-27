const express = require('express');
const multer = require('multer');

const uploadAdminController = require('../../controllers/admin/upload.admin.controller');

const router = express.Router();
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
]);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 3 * 1024 * 1024
  },
  fileFilter(req, file, cb) {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      const invalidTypeError = new Error('invalid file type');

      invalidTypeError.code = 'INVALID_FILE_TYPE';
      return cb(invalidTypeError);
    }

    return cb(null, true);
  }
});

function parseImageUpload(req, res, next) {
  upload.single('image')(req, res, function onUploadComplete(error) {
    if (error) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error: 'image exceeds maximum size of 3MB'
        });
      }

      if (error.code === 'INVALID_FILE_TYPE') {
        return res.status(400).json({
          error: 'El archivo debe ser una imagen JPG, PNG o WebP.'
        });
      }

      console.error('Error parsing image upload:', error);

      return res.status(500).json({
        error: 'No se pudo procesar la imagen.'
      });
    }

    return next();
  });
}

router.post('/image', parseImageUpload, uploadAdminController.uploadImage);
router.post('/product-image', parseImageUpload, uploadAdminController.uploadProductImage);

module.exports = router;
