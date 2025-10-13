// middleware/uploadValidator.js
'use strict';

let multer;
try {
  multer = require('multer');
} catch (e) {
  // multer not installed
  multer = null;
}

/**
 * getUploadMiddleware()
 * - jika multer tersedia: return middleware multer untuk single file 'file'
 * - jika tidak: return middleware yang menolak dengan pesan instruktif
 */
function getUploadMiddleware() {
  if (!multer) {
    return (req, res, next) => {
      res.status(501).json({
        success: false,
        message: 'Upload disabled: dependency "multer" belum terpasang. Jalankan `npm install multer` dan deploy ulang.'
      });
    };
  }

  // konfigurasi sederhana: simpan ke folder uploads/
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      // bersihkan nama file dan tambahkan timestamp
      const safeName = file.originalname.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_.-]/g, '');
      cb(null, `${Date.now()}_${safeName}`);
    }
  });

  const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  });

  return upload.single('file');
}

module.exports = { getUploadMiddleware, hasMulter: !!multer };
