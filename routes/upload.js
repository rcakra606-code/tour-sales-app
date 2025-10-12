// =====================================
// ✅ Upload Routes (Render-compatible)
// =====================================
const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const upload = require("../middleware/uploadValidator");
const { authenticateToken } = require("../middleware/auth");

// Pastikan folder upload ada
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ================================
// ✅ Upload file (auth protected)
// ================================
router.post("/", authenticateToken, upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "Tidak ada file diunggah." });
  }

  res.json({
    success: true,
    message: "File berhasil diunggah.",
    file: {
      name: req.file.filename,
      original: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: `/uploads/${req.file.filename}`,
    },
  });
});

// ================================
// ✅ Serve uploaded files (public)
// ================================
router.use("/", express.static(uploadDir));

module.exports = router;
