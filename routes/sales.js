const express = require("express");
const router = express.Router();
const salesController = require("../controllers/salesController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, salesController.listSales);
router.get("/:id", authMiddleware, salesController.getSaleById);
router.post("/", authMiddleware, salesController.createSale);
router.put("/:id", authMiddleware, salesController.updateSale);
router.delete("/:id", authMiddleware, salesController.deleteSale);

module.exports = router;
