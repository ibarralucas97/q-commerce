const crypto = require('crypto');

const DEFAULT_FOLDER = 'q-commerce/products';

function getCloudinaryConfig() {
  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    folder: process.env.CLOUDINARY_FOLDER || DEFAULT_FOLDER
  };
}

function isCloudinaryConfigured() {
  const config = getCloudinaryConfig();

  return Boolean(config.cloudName && config.apiKey && config.apiSecret);
}

function buildUploadSignature(paramsToSign, apiSecret) {
  const signatureBase = Object.keys(paramsToSign)
    .sort()
    .map(function toPair(key) {
      return key + '=' + paramsToSign[key];
    })
    .join('&');

  return crypto
    .createHash('sha1')
    .update(signatureBase + apiSecret)
    .digest('hex');
}

module.exports = {
  DEFAULT_FOLDER,
  getCloudinaryConfig,
  isCloudinaryConfigured,
  buildUploadSignature
};
