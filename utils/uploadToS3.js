const { PutObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../config/s3");

/**
 * Upload file to S3 with organized folder structure
 * @param {Object} file - File object from multer
 * @param {String} module - Module name (hero, testimonials, etc)
 * @param {String} type - File type (images, videos)
 * @returns {String} Public URL of uploaded file
 */
module.exports = async function uploadToS3(file, module = "cms", type = "images") {
  // Determine file extension to validate type
  const fileExtension = file.originalname.split('.').pop().toLowerCase();
  
  // Video extensions
  const videoExtensions = ['mp4', 'avi', 'mov', 'mkv', 'webm', 'flv', 'wmv', 'mpeg', 'mpg', 'm4v'];
  // Image extensions
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'];
  
  // Auto-detect type based on file extension if not explicitly provided
  let fileType = type;
  if (videoExtensions.includes(fileExtension)) {
    fileType = 'videos';
  } else if (imageExtensions.includes(fileExtension)) {
    fileType = 'images';
  }

  // Organized S3 path structure: cms/module/type/timestamp-filename
  const fileName = `cms/${module}/${fileType}/${Date.now()}-${file.originalname}`;

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    await s3.send(new PutObjectCommand(params));
    console.log(`File uploaded successfully: ${fileName}`);
  } catch (error) {
    console.error('S3 Upload Error:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  // Generate the correct Contabo public URL structure
  const publicUrl = `${process.env.CONTABO_S3_BASE_URL}/${process.env.CONTABO_TENANTID}:${process.env.AWS_BUCKET_NAME}/${fileName}`;
  
  return publicUrl;
};
