const {
  buildUploadSignature,
  getCloudinaryConfig,
  isCloudinaryConfigured
} = require('../../config/cloudinary');

async function uploadProductImage(file) {
  if (!isCloudinaryConfigured()) {
    throw new Error('cloudinary is not configured');
  }

  const config = getCloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign = {
    folder: config.folder,
    timestamp: timestamp
  };
  const signature = buildUploadSignature(paramsToSign, config.apiSecret);
  const uploadUrl = 'https://api.cloudinary.com/v1_1/' + config.cloudName + '/image/upload';
  const formData = new FormData();
  const blob = new Blob([file.buffer], { type: file.mimetype });

  formData.append('file', blob, file.originalname);
  formData.append('api_key', config.apiKey);
  formData.append('timestamp', String(timestamp));
  formData.append('folder', config.folder);
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
    image_url: responseBody.secure_url,
    public_id: responseBody.public_id
  };
}

module.exports = {
  uploadProductImage
};
