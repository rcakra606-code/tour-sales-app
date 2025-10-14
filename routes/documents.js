const express = require("express");
const router = express.Router();
const documentController = require("../controllers/documentController");
const auth = require("../middleware/authMiddleware");
router.post("/", auth, documentController.create);
router.get("/", auth, documentController.list);
module.exports = router;
