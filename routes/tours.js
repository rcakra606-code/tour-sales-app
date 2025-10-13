const express = require("express");
const router = express.Router();
const tourController = require("../controllers/tourController");
const authMiddleware = require("../middlewares/authMiddleware");

router.use(authMiddleware);

router.get("/", tourController.getAll);
router.post("/", tourController.create);
router.put("/", tourController.update);
router.delete("/", tourController.delete);

module.exports = router;
