// routes/tours.js
const express = require("express");
const path = require("path");
const router = express.Router();

const controllerPath = path.join(__dirname, "..", "controllers", "tourController");
const authMiddleware = require("../middleware/authMiddleware");

let tourController;
try {
  tourController = require(controllerPath);
  console.log("✅ Tours route -> controller loaded:", controllerPath);
} catch (err) {
  console.error("❌ Tour controller not found:", controllerPath, err.message);
  router.get("*", (_, res) => res.status(500).json({ error: "Tour controller not found." }));
  module.exports = router;
  return;
}

// Semua endpoint tours butuh autentikasi
router.use(authMiddleware);

router.get("/", tourController.getAll);         // GET /api/tours
router.get("/:id", tourController.getById);     // GET /api/tours/:id
router.post("/", tourController.create);        // POST /api/tours
router.put("/:id", tourController.update);      // PUT /api/tours/:id
router.delete("/:id", tourController.remove);   // DELETE /api/tours/:id

module.exports = router;
