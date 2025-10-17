// routes/documents.js
const express = require("express");
const router = express.Router();
const documentController = require("../controllers/documentController");

// CRUD routes
router.get("/", documentController.getDocuments);
router.post("/", documentController.createDocument);
router.delete("/:id", documentController.deleteDocument);
router.get("/summary", documentController.getDocumentSummary);

// Export routes
router.get("/export/excel", documentController.exportDocumentsExcel);
router.get("/export/csv", documentController.exportDocumentsCSV);

module.exports = router;
