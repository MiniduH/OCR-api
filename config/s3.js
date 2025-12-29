const { S3Client } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
  region: process.env.AWS_DEFAULT_REGION || "us-east-1",
  endpoint: process.env.AWS_ENDPOINT, // MinIO endpoint: http://207.180.232.61:9002
  forcePathStyle: process.env.AWS_USE_PATH_STYLE_ENDPOINT === 'true', // Required for MinIO
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'minioadmin',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'minioadmin',
  },
});

console.log('✓ S3 Client configured:', {
  region: process.env.AWS_DEFAULT_REGION,
  endpoint: process.env.AWS_ENDPOINT,
  bucket: process.env.AWS_BUCKET,
  pathStyle: process.env.AWS_USE_PATH_STYLE_ENDPOINT,
});

module.exports = s3;
