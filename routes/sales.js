// routes/sales.js
const express = require("express");
const path = require("path");
const router = express.Router();

const controllerPath = path.join(__dirname, "..", "controllers", "salesController");
const authMiddleware = require("../middleware/authMiddleware");
let roleCheck;
try {
  roleCheck = require("../middleware/roleCheck");
} catch {
  roleCheck = null;
}

let salesController;
try {
  salesController = require(controllerPath);
  console.log("✅ Sales route -> controller loaded:", controllerPath);
} catch (err) {
  console.error("❌ Sales controller not found:", controllerPath, err.message);
  router.get("*", (_, res) => res.status(500).json({ error: "Sales controller not found." }));
  module.exports = router;
  return;
}

// Semua endpoint sales perlu autentikasi
router.use(authMiddleware);

// GET semua sales (boleh diakses user yang login)
router.get("/", salesController.getAll);
router.get("/:id", salesController.getById);

// Membuat / mengubah / menghapus sales hanya untuk admin (jika roleCheck tersedia)
if (roleCheck && typeof roleCheck.adminOnly === "function") {
  router.post("/", roleCheck.adminOnly, salesController.create);
  router.put("/:id", roleCheck.adminOnly, salesController.update);
  router.delete("/:id", roleCheck.adminOnly, salesController.remove);
} else {
  // fallback: proteksi create/update/delete hanya dengan auth (jika roleCheck tidak ada)
  router.post("/", salesController.create);
  router.put("/:id", salesController.update);
  router.delete("/:id", salesController.remove);
}

module.exports = router;
