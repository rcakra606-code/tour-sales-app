const express = require("express");
const router = express.Router();
const regionController = require("../controllers/regionController");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.get("/", regionController.getAll);
router.post("/", regionController.create);
router.put("/:id", regionController.update);
router.delete("/:id", regionController.delete);

module.exports = router;
