// routes/upload.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const { getUploadMiddleware, hasMulter } = require("../middleware/uploadValidator");
const authMiddleware = require("../middleware/authMiddleware");

const UPLOAD_DIR = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const uploadMiddleware = getUploadMiddleware();

router.post("/", authMiddleware, uploadMiddleware, (req, res) => {
  if (!hasMulter) return;

  if (!req.file) {
    return res.status(400).json({ success: false, message: "File tidak dikirim. Gunakan field 'file'." });
  }

  const publicPath = `/uploads/${path.basename(req.file.path)}`;
  res.json({
    success: true,
    file: { path: publicPath, originalname: req.file.originalname },
  });
});

module.exports = router;
