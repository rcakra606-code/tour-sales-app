// =====================================
// ✅ Upload Middleware (Validator)
// =====================================
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Pastikan folder upload tersedia
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("📂 Created upload directory:", uploadDir);
}

// =====================================
// ✅ Storage Configuration
// =====================================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// =====================================
// ✅ File Filter
// =====================================
const allowedTypes = [".png", ".jpg", ".jpeg", ".pdf", ".docx"];
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedTypes.includes(ext)) {
    return cb(new Error("Tipe file tidak diizinkan."), false);
  }
  cb(null, true);
};

// =====================================
// ✅ Upload Middleware Export
// =====================================
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Maks 5MB
  fileFilter,
});

module.exports = upload;
