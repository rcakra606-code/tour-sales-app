// routes/regions.js
const express = require("express");
const router = express.Router();
const regionController = require("../controllers/regionController");
const authMiddleware = require("../middleware/authMiddleware");
const roleCheck = require("../middleware/roleCheck");

// Semua endpoint region butuh login
router.use(authMiddleware);

// Hanya admin (super) dan semi-admin yang boleh ubah data
router.get("/", regionController.getAll);
router.post("/", roleCheck(["super", "semi"]), regionController.create);
router.put("/:id", roleCheck(["super", "semi"]), regionController.update);
router.delete("/:id", roleCheck(["super"]), regionController.remove);

module.exports = router;
