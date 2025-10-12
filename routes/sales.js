const express = require("express");
const router = express.Router();
const controller = require("../controllers/salesController");

router.get("/", controller.getAllSales);
router.post("/", controller.addSale);
router.delete("/:id", controller.deleteSale);

module.exports = router;
