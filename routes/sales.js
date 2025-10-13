const express = require("express");
const router = express.Router();
const salesController = require("../controllers/salesController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleCheck = require("../middlewares/roleCheck");

router.use(authMiddleware);

router.get("/", salesController.getAll);
router.post("/", roleCheck("admin"), salesController.create);
router.put("/", roleCheck("admin"), salesController.update);
router.delete("/", roleCheck("admin"), salesController.delete);

module.exports = router;
