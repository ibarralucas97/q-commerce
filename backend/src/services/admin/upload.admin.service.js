const {
  buildUploadSignature,
  getCloudinaryConfig,
  isCloudinaryConfigured
} = require('../../config/cloudinary');

async function uploadImage(file, options) {
  if (!isCloudinaryConfigured()) {
    throw new Error('cloudinary is not configured');
  }

  const config = getCloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = options && options.folder ? options.folder : config.folder;
  const paramsToSign = {
    folder: folder,
    timestamp: timestamp
  };
  const signature = buildUploadSignature(paramsToSign, config.apiSecret);
  const uploadUrl = 'https://api.cloudinary.com/v1_1/' + config.cloudName + '/image/upload';
  const formData = new FormData();
  const blob = new Blob([file.buffer], { type: file.mimetype });

  formData.append('file', blob, file.originalname);
  formData.append('api_key', config.apiKey);
  formData.append('timestamp', String(timestamp));
  formData.append('folder', folder);
  formData.append('signature', signature);

  const response = await fetch(uploadUrl, {
    method: 'POST',
    body: formData
  });
  const responseBody = await response.json().catch(function ignoreInvalidJson() {
    return null;
  });

  if (!response.ok || !responseBody || !responseBody.secure_url) {
    const error = new Error('cloudinary upload failed');

    error.details = responseBody;
    throw error;
  }

  return {
    url: responseBody.secure_url,
    image_url: responseBody.secure_url,
    public_id: responseBody.public_id
  };
}

async function uploadProductImage(file) {
  return uploadImage(file);
}

module.exports = {
  uploadImage,
  uploadProductImage
};
