// middleware/upload.js
const multer = require("multer");
const { storage } = require("../utils/cloudinary"); // or wherever cloudinary.js is
const upload = multer({ storage });

module.exports = upload;
