// routes/upload.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const { getUploadMiddleware, hasMulter } = require('../middleware/uploadValidator');
const authMiddleware = require('../middleware/authMiddleware'); // ⬅️ Tambahan baru

// pastikan folder uploads ada
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// jika multer tidak terpasang, getUploadMiddleware() akan mengembalikan middleware yang menolak request
const uploadMiddleware = getUploadMiddleware();

// ==========================
// ✅ Upload Route (JWT Protected)
// ==========================
router.post('/', authMiddleware, uploadMiddleware, (req, res) => {
  // Jika multer tidak ada, middleware di atas sudah mengembalikan respons 501 dan route handler tidak dieksekusi.
  // Jika multer ada dan sukses, file info berada di req.file
  if (!hasMulter) return; // safety: seharusnya sudah dikirim 501

  if (!req.file) {
    return res.status(400).json({ success: false, message: 'File tidak dikirim. Gunakan field "file".' });
  }

  const publicPath = `/uploads/${path.basename(req.file.path)}`;
  res.json({ 
    success: true, 
    file: { 
      path: publicPath, 
      originalname: req.file.originalname 
    } 
  });
});

module.exports = router;
