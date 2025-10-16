// routes/regions.js
const express = require("express");
const router = express.Router();
const regionController = require("../controllers/regionController");
const authMiddleware = require("../middleware/authMiddleware");
const roleCheck = require("../middleware/roleCheck");

// require auth for every region route
router.use(authMiddleware);

// public GET for regions (any authenticated user)
router.get("/", regionController.getAll);

// create/update/delete require roles
router.post("/", roleCheck("semi") /* allow semi or super? see note below */, regionController.create);
// Note: roleCheck helper as earlier expects a single role string, if you want multiple roles, either call roleCheck twice or adapt roleCheck to accept array.
// For simplicity, if your roleCheck supports arrays, pass ["super","semi"]. If not, change to roleCheck("super") and roleCheck("semi") logic.

router.put("/:id", roleCheck("semi"), regionController.update);
router.delete("/:id", roleCheck("super"), regionController.remove);

module.exports = router;
