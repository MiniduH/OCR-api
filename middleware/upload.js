const multer = require("multer");

const storage = multer.memoryStorage(); // store file in memory buffer

const upload = multer({
  storage,
  limits: { fileSize: 12 * 1024 * 1024 }, // 12MB
});

module.exports = upload;
