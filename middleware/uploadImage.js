const multer = require("multer");

const storage = multer.diskStorage({});

const uploadImage = multer({ storage }).fields([
  { name: "image", maxCount: 1 },
]);


module.exports = { uploadImage };