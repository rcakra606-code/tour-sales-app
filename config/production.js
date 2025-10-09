const path = require('path');
const sslEnabled = (process.env.SSL_ENABLED === 'true' || process.env.SSL_ENABLED === true || process.env.SSL_ENABLED === '1');
module.exports = {
  ssl: {
    enabled: sslEnabled,
    port: parseInt(process.env.SSL_PORT || '443', 10),
    keyPath: process.env.SSL_KEY || path.join(__dirname, '..', 'ssl', 'private-key.pem'),
    certPath: process.env.SSL_CERT || path.join(__dirname, '..', 'ssl', 'certificate.pem')
  },
  cors: {
    origin: process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : ['http://localhost:8080'],
    credentials: true,
    optionsSuccessStatus: 200
  },
  rateLimit: { windowMs: 15*60*1000, max: process.env.NODE_ENV === 'production' ? 200 : 1000, message: { error: 'Too many requests' } },
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10),
    allowedTypes: ['image/jpeg','image/png','image/gif','application/pdf'],
    uploadDir: process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads'),
    tempDir: process.env.TEMP_DIR || path.join(__dirname, '..', 'temp')
  },
  backup: {
    enabled: process.env.BACKUP_ENABLED === 'true' || process.env.BACKUP_ENABLED === true,
    schedule: process.env.BACKUP_SCHEDULE || '0 2 * * *',
    retention: parseInt(process.env.BACKUP_RETENTION || '7', 10),
    dir: process.env.BACKUP_DIR || path.join(__dirname, '..', 'backups')
  }
};
