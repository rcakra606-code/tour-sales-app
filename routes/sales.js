// routes/sales.js
const express = require("express");
const router = express.Router();
const salesController = require("../controllers/salesController");
const auth = require("../middleware/authMiddleware");
const roleCheck = require("../middleware/roleCheck");

router.post("/", auth, salesController.create);
router.get("/", auth, salesController.list);
router.get("/targets", auth, salesController.targets);
router.post("/targets", auth, roleCheck(["super","semi"]), salesController.setTarget);

module.exports = router;
