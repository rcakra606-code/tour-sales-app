const express = require("express");
const router = express.Router();
const salesController = require("../controllers/salesController");
const roleCheck = require("../middleware/roleCheck");

router.get("/", salesController.getSales);
router.post("/", roleCheck("super", "semi"), salesController.addSale);

module.exports = router;
