const { PutObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../config/s3");

/**
 * Upload ticket image to S3/MinIO
 * @param {Buffer} imageBuffer - Image buffer from multipart request
 * @param {String} originalName - Original filename
 * @param {String} trace_no - Ticket trace number for unique identification
 * @returns {String} S3 path of uploaded image
 */
module.exports = async function uploadTicketImage(imageBuffer, originalName, trace_no) {
  // Generate unique filename: trace_no_timestamp.ext (no 'tickets/' prefix)
  const fileExtension = originalName.split('.').pop().toLowerCase();
  const timestamp = Date.now();
  const fileName = `${trace_no}_${timestamp}.${fileExtension}`;

  // Determine MIME type
  const mimeTypeMap = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
  };
  
  const contentType = mimeTypeMap[fileExtension] || 'image/png';

  const params = {
    Bucket: process.env.AWS_BUCKET,
    Key: fileName,
    Body: imageBuffer,
    ContentType: contentType,
    // Set ACL to public-read for immediate public access
    ACL: 'public-read',
  };

  try {
    console.log('🔵 Uploading to S3/MinIO:', {
      bucket: process.env.AWS_BUCKET,
      key: fileName,
      size: imageBuffer.length,
      contentType,
      acl: 'public-read',
    });
    
    await s3.send(new PutObjectCommand(params));
    console.log(`✓ Ticket image uploaded successfully: ${fileName}`);
  } catch (error) {
    console.error('❌ S3 Upload Error:', {
      message: error.message,
      code: error.code,
      bucket: process.env.AWS_BUCKET,
      fileName,
    });
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  // Return the MinIO HTTPS viewable path
  // Format: https://minio.divisarana.org/bucket-name/filename
  const minionUrl = process.env.MINIO_URL || 'https://minio.divisarana.org';
  return `${minionUrl}/${process.env.AWS_BUCKET}/${fileName}`;
};
