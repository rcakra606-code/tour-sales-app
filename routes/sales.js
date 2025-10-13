// routes/sales.js
const express = require("express");
const router = express.Router();
const salesController = require("../controllers/salesController");
const authMiddleware = require("../middleware/authMiddleware");

// Admin-only
router.get("/", authMiddleware, salesController.getAll);
router.post("/", authMiddleware, salesController.create);
router.put("/:id", authMiddleware, salesController.update);
router.delete("/:id", authMiddleware, salesController.remove);

module.exports = router;
