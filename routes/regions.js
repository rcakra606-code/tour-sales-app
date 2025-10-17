// routes/regions.js — Final Version
const express = require("express");
const router = express.Router();
const regionController = require("../controllers/regionController");

// Semua akses region untuk admin (super)
function adminOnly(req, res, next) {
  if (!req.user || req.user.type !== "super")
    return res.status(403).json({ error: "Hanya admin yang dapat mengakses." });
  next();
}

// Routes
router.get("/", regionController.getRegions);
router.post("/", adminOnly, regionController.createRegion);
router.put("/:id", adminOnly, regionController.updateRegion);
router.delete("/:id", adminOnly, regionController.deleteRegion);

module.exports = router;
