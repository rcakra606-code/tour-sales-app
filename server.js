// =====================
// ✅ Core modules & setup
// =====================
const express = require('express');
const http = require('http');
const path = require('path');
require('dotenv').config();

const helmet = require('helmet');
const cors = require('cors');
const { logger, httpLogger } = require('./config/logger');
const productionConfig = require('./config/production');
const BackupScheduler = require('./scripts/setup-cron');

// =====================
// ✅ Express app init
// =====================
const app = express();
if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);

// =====================
// ✅ Security Headers (Helmet)
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
        formAction: ["'self'"], // ✅ izinkan form
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
app.use(cors(productionConfig.cors || { origin: '*' }));

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
// ✅ API ROUTES
// =====================
const authRoutes = require('./routes/auth');
const tourRoutes = require('./routes/tours');
const salesRoutes = require('./routes/sales');
const uploadRoutes = require('./routes/upload');
const dashboardRoutes = require('./routes/dashboard');

app.use('/api/auth', authRoutes);
app.use('/api/tours', tourRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/dashboard', dashboardRoutes);

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
// ✅ 404 handler for API
// =====================
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// =====================
// ✅ SPA fallback
// =====================
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// =====================
// ✅ Backup scheduler (optional)
// =====================
try {
  const scheduler = new BackupScheduler();
  if (productionConfig.backup?.enabled) {
    scheduler.scheduleBackup(productionConfig.backup.schedule);
    scheduler.scheduleHealthCheck();
  }
} catch (err) {
  console.warn('⚠️ Backup scheduler disabled or misconfigured:', err.message);
}

// =====================
// ✅ Start server (Render-compatible)
// =====================
const PORT = process.env.PORT || 3000;
const httpServer = http.createServer(app);

httpServer.listen(PORT, () => {
  logger.info(`✅ Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

// =====================
// ✅ Graceful shutdown
// =====================
const gracefulShutdown = (signal) => {
  logger.info(`${signal} received, shutting down gracefully`);
  httpServer.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

module.exports = app;
