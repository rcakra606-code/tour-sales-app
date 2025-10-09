const express = require('express');
const UploadValidator = require('../middleware/uploadValidator');
const productionConfig = require('../config/production');
const router = express.Router();

const uploadValidator = new UploadValidator({
  maxFileSize: productionConfig.upload.maxFileSize,
  allowedTypes: productionConfig.upload.allowedTypes,
  uploadDir: productionConfig.upload.uploadDir,
  tempDir: productionConfig.upload.tempDir,
  virusScanning: process.env.VIRUS_SCANNING === 'true'
});
const multerInstance = uploadValidator.createMulter();

router.post('/single', multerInstance.single('file'), (req, res, next) => {
  uploadValidator.validateUploadedFile(req, res, (err) => {
    if (err) return next(err);
    res.json({ message: 'File uploaded', file: { filename: req.file.filename, path: req.file.path } });
  });
});

module.exports = router;
