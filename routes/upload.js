const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const uploadDir = path.join(__dirname, "..", "uploads");
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

router.post("/", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: "File tidak dikirim" });
  const publicPath = `/uploads/${req.file.filename}`;
  res.json({ success: true, file: { path: publicPath, originalname: req.file.originalname } });
});

module.exports = router;
