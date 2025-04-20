const multer = require("multer");

const storage = multer.diskStorage({});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // กำหนดขนาดไฟล์สูงสุด 50MB
  },
}).fields([
  { name: "video", maxCount: 1 },
  { name: "image", maxCount: 1 },
]);

module.exports = { upload };
