// routes/regions.js
const express = require("express");
const router = express.Router();
const regionController = require("../controllers/regionController");
const authMiddleware = require("../middleware/authMiddleware");
const roleCheck = require("../middleware/roleCheck");

// semua route butuh login
router.use(authMiddleware);

router.get("/", regionController.getAll);
router.post("/", roleCheck(["super", "semi"]), regionController.create);
router.put("/:id", roleCheck(["super", "semi"]), regionController.update);
router.delete("/:id", roleCheck(["super"]), regionController.remove);

module.exports = router;
