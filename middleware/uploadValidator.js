const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { exec } = require('child_process');
const { logger } = require('../config/logger');

const fileSignatures = {
  'image/jpeg': [[0xFF,0xD8,0xFF]],
  'image/png': [[0x89,0x50,0x4E,0x47]],
  'application/pdf': [[0x25,0x50,0x44,0x46]]
};

const dangerousExt = ['.exe','.bat','.sh','.php','.js','.py'];

class UploadValidator {
  constructor(opts = {}) {
    this.maxFileSize = opts.maxFileSize || 5*1024*1024;
    this.allowedTypes = opts.allowedTypes || ['image/jpeg','image/png','application/pdf'];
    this.uploadDir = opts.uploadDir || path.join(__dirname,'..','uploads');
    this.tempDir = opts.tempDir || path.join(__dirname,'..','temp');
    this.virusScanning = opts.virusScanning || false;
    if (!fs.existsSync(this.uploadDir)) fs.mkdirSync(this.uploadDir, { recursive: true });
    if (!fs.existsSync(this.tempDir)) fs.mkdirSync(this.tempDir, { recursive: true });
  }

  generateName(original) {
    const ext = path.extname(original);
    return Date.now() + '-' + crypto.randomBytes(6).toString('hex') + ext;
  }

  validateSignature(buffer, mime) {
    const s = fileSignatures[mime];
    if (!s || s.length === 0) return true;
    return s.some(sig => sig.every((b,i)=> buffer[i] === b));
  }

  createStorage() {
    return multer.diskStorage({
      destination: (req,file,cb) => cb(null, this.tempDir),
      filename: (req,file,cb) => cb(null, this.generateName(file.originalname))
    });
  }

  fileFilter() {
    return (req,file,cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      if (dangerousExt.includes(ext)) return cb(new Error('Forbidden extension'), false);
      if (!this.allowedTypes.includes(file.mimetype)) return cb(new Error('Invalid mime'), false);
      cb(null, true);
    };
  }

  createMulter() {
    return multer({ storage:this.createStorage(), limits:{ fileSize:this.maxFileSize }, fileFilter:this.fileFilter() });
  }

  async validateUploadedFile(req,res,next) {
    try {
      if (!req.file) return next();
      const buf = fs.readFileSync(req.file.path);
      if (!this.validateSignature(buf, req.file.mimetype)) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ error:'File signature mismatch' });
      }
      // move to final
      const final = path.join(this.uploadDir, req.file.filename);
      fs.renameSync(req.file.path, final);
      req.file.path = final;
      logger.info('Uploaded', { file: req.file.filename, size: req.file.size });
      next();
    } catch (e) {
      console.error('Upload validation error', e);
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      res.status(500).json({ error:'Upload validation failed' });
    }
  }
}

module.exports = UploadValidator;
