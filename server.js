// =====================
// ✅ Core modules & setup
// =====================
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();

const productionConfig = require('./config/production');
const { logger, httpLogger } = require('./config/logger');
const BackupScheduler = require('./scripts/setup-cron');

// =====================
// ✅ Express app init
// =====================
const app = express();

// Render membutuhkan trust proxy agar bisa membaca port & IP dengan benar
if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);

// =====================
// ✅ Security headers (Helmet CSP friendly)
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
// ✅ Static frontend
// =====================

// Pastikan semua file JS di-serve dengan benar (Render butuh header MIME)
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

// Serve semua static file (HTML, CSS, images, dll)
app.use(express.static(path.join(__dirname, 'public')));

// =====================
// ✅ API routes
// =====================
const authRoutes = require('./routes/auth');
const tourRoutes = require('./routes/tours');
const salesRoutes = require('./routes/sales');
const uploadRoutes = require('./routes/upload');

app.use('/api/auth', authRoutes);
app.use('/api/tours', tourRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/uploads', uploadRoutes);

// =====================
// ✅ Health check (Render auto-detects port here)
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
try {
  const scheduler = new BackupScheduler();
  if (productionConfig.backup?.enabled) {
    scheduler.scheduleBackup(productionConfig.backup.schedule);
    scheduler.scheduleHealthCheck();
  }
} catch (err) {
  console.warn('⚠️ Backup scheduler not initialized:', err.message);
}

// =====================
// ✅ SPA fallback (React/Vue style routing support)
// =====================
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// =====================
// ✅ Start server (Render compatible)
// =====================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
