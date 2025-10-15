const express = require("express");
const router = express.Router();
const documentsController = require("../controllers/documentsController");
const roleCheck = require("../middleware/roleCheck");

// Semua user login bisa lihat dokumen
router.get("/", roleCheck("super", "semi", "basic"), documentsController.getAllDocuments);

// Super dan Semi bisa tambah/edit
router.post("/", roleCheck("super", "semi"), documentsController.createDocument);
router.put("/:id", roleCheck("super", "semi"), documentsController.updateDocument);

// Hanya super bisa hapus
router.delete("/:id", roleCheck("super"), documentsController.deleteDocument);

module.exports = router;
