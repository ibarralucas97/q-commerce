const uploadAdminService = require('../../services/admin/upload.admin.service');

async function uploadProductImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'image file is required'
      });
    }

    const uploadedImage = await uploadAdminService.uploadProductImage(req.file);

    return res.status(201).json({
      message: 'Image uploaded successfully',
      image_url: uploadedImage.image_url
    });
  } catch (error) {
    console.error('Error uploading product image:', error);

    if (error && error.message === 'cloudinary is not configured') {
      return res.status(500).json({
        error: 'internal server error'
      });
    }

    return res.status(500).json({
      error: 'internal server error'
    });
  }
}

module.exports = {
  uploadProductImage
};
