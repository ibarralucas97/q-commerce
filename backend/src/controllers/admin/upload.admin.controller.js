const uploadAdminService = require('../../services/admin/upload.admin.service');

function sendUploadResponse(res, uploadedImage) {
  return res.status(201).json({
    message: 'Image uploaded successfully',
    url: uploadedImage.url || uploadedImage.image_url,
    image_url: uploadedImage.image_url || uploadedImage.url
  });
}

function handleUploadError(res, error, context) {
  console.error('Error uploading ' + context + ' image:', error);

  if (error && error.message === 'cloudinary is not configured') {
    return res.status(500).json({
      error: 'Cloudinary no está configurado.'
    });
  }

  return res.status(500).json({
    error: 'No se pudo subir la imagen. Intentá nuevamente.'
  });
}

async function uploadImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'image file is required'
      });
    }

    const uploadedImage = await uploadAdminService.uploadImage(req.file);

    return sendUploadResponse(res, uploadedImage);
  } catch (error) {
    return handleUploadError(res, error, 'generic');
  }
}

async function uploadProductImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'image file is required'
      });
    }

    const uploadedImage = await uploadAdminService.uploadProductImage(req.file);

    return sendUploadResponse(res, uploadedImage);
  } catch (error) {
    return handleUploadError(res, error, 'product');
  }
}

module.exports = {
  uploadImage,
  uploadProductImage
};
