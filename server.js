// =====================
// ✅ Core modules & setup
// =====================
const express = require('express');
const http = require('http');
const path = require('path');
require('dotenv').config();

const helmet = require('helmet');
const cors = require('cors');

const productionConfig = require('./config/production');
const { logger, httpLogger } = require('./config/logger');
const BackupScheduler = require('./scripts/setup-cron');

// ✅ Tambahkan middleware auth
const authMiddleware = require('./middleware/authMiddleware');

// =====================
// ✅ Express app init
// =====================
const app = express();
if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);

// =====================
// ✅ Security headers (Helmet)
// =====================
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://cdn.tailwindcss.com",
          "https://cdn.jsdelivr.net",
          "https://cdnjs.cloudflare.com",
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://cdn.jsdelivr.net",
          "https://cdn.tailwindcss.com",
          "https://fonts.googleapis.com",
        ],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "*"],
      },
    },
  })
);

// =====================
// ✅ Middleware
// =====================
app.use(httpLogger);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors(productionConfig.cors));

// =====================
// ✅ Static frontend (JS & assets)
// =====================
app.use(
  '/js',
  express.static(path.join(__dirname, 'public', 'js'), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
      }
    },
  })
);
app.use(express.static(path.join(__dirname, 'public')));

// =====================
// ✅ API routes
// =====================
const authRoutes = require('./routes/auth');
const tourRoutes = require('./routes/tours');
const salesRoutes = require('./routes/sales');
const uploadRoutes = require('./routes/upload');

// Route login publik
app.use('/api/auth', authRoutes);

// Route lain wajib login
app.use('/api/tours', authMiddleware, tourRoutes);
app.use('/api/sales', authMiddleware, salesRoutes);
app.use('/api/uploads', authMiddleware, uploadRoutes);

// =====================
// ✅ Health check
// =====================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// =====================
// ✅ Backup scheduler (optional)
// =====================
const scheduler = new BackupScheduler();
if (productionConfig.backup.enabled) {
  scheduler.scheduleBackup(productionConfig.backup.schedule);
  scheduler.scheduleHealthCheck();
}

// =====================
// ✅ SPA fallback (must be LAST route)
// =====================
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// =====================
// ✅ Start server (Render compatible)
// =====================
const PORT = parseInt(process.env.PORT || '3000', 10);
const httpServer = http.createServer(app);

httpServer.listen(PORT, () => {
  logger.info(`✅ Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

// =====================
// ✅ Graceful shutdown
// =====================
const gracefulShutdown = (signal) => {
  logger.info(`${signal} received, shutting down gracefully`);
  try {
    scheduler.stopAll();
  } catch (e) {
    logger.error('Scheduler stop failed', { error: e.message });
  }
  httpServer.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

module.exports = app;
