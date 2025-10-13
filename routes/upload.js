// =====================================
// ✅ Upload Routes
// =====================================
const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const upload = require("../middleware/uploadValidator");
const { authenticateToken } = require("../middleware/auth");

// =====================================
// ✅ POST /api/uploads (Upload File)
// =====================================
router.post("/", authenticateToken, upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Tidak ada file yang diunggah." });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
      success: true,
      message: "Upload berhasil.",
      file: {
        name: req.file.originalname,
        type: req.file.mimetype,
        size: req.file.size,
        path: fileUrl,
      },
    });
  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).json({ success: false, message: "Gagal mengunggah file." });
  }
});

// =====================================
// ✅ GET /api/uploads/:filename (Serve File)
// =====================================
router.get("/:filename", authenticateToken, (req, res) => {
  const filePath = path.join(__dirname, "..", "uploads", req.params.filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: "File tidak ditemukan." });
  }

  res.sendFile(filePath);
});

module.exports = router;
