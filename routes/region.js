// routes/regions.js
const express = require("express");
const router = express.Router();
const regionsController = require("../controllers/regionController");
const authMiddleware = require("../middleware/authMiddleware");
const roleCheck = require("../middleware/roleCheck");

router.use(authMiddleware);

router.get("/", regionController.getAll);
router.post("/", roleCheck(["admin"]), regionController.create);
router.put("/:id", roleCheck(["admin"]), regionController.update);
router.delete("/:id", roleCheck(["admin"]), regionController.delete);

module.exports = router;
