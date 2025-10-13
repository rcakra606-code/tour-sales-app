// routes/upload.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const uploadValidator = require("../middleware/uploadValidator");
const authMiddleware = require("../middleware/authMiddleware");

const UPLOAD_DIR = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const getUploadMiddleware = uploadValidator.getUploadMiddleware ? uploadValidator.getUploadMiddleware : () => (req, res, next) => {
  // jika uploadValidator tidak sesuai, kembalikan middleware yang menolak
  return (req, res) => res.status(501).json({ success: false, message: "Upload middleware tidak tersedia." });
};
const hasMulter = !!uploadValidator.hasMulter;

const uploadMiddleware = getUploadMiddleware();

// proteksi upload dengan JWT
router.post("/", authMiddleware, uploadMiddleware, (req, res) => {
  if (!hasMulter) {
    // seharusnya middleware sudah menolak sebelumnya; safety net
    return res.status(501).json({ success: false, message: "Multer tidak tersedia di server." });
  }

  if (!req.file) {
    return res.status(400).json({ success: false, message: 'File tidak dikirim. Gunakan field "file".' });
  }

  const publicPath = `/uploads/${path.basename(req.file.path)}`;
  res.json({ success: true, file: { path: publicPath, originalname: req.file.originalname } });
});

module.exports = router;
