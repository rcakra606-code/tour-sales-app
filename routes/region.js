// routes/regions.js
const express = require("express");
const router = express.Router();
const regionsController = require("../controllers/regionsController");
const authMiddleware = require("../middleware/authMiddleware");
const roleCheck = require("../middleware/roleCheck");

router.use(authMiddleware);

router.get("/", regionsController.getAll);
router.post("/", roleCheck(["admin"]), regionsController.create);
router.put("/:id", roleCheck(["admin"]), regionsController.update);
router.delete("/:id", roleCheck(["admin"]), regionsController.delete);

module.exports = router;
