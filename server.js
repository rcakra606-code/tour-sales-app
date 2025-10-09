const express = require('express');
const http = require('http');
const https = require('https');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const productionConfig = require('./config/production');
const { logger, httpLogger } = require('./config/logger');
const BackupScheduler = require('./scripts/setup-cron');

const authRoutes = require('./routes/auth');
const tourRoutes = require('./routes/tours');
const salesRoutes = require('./routes/sales');
const uploadRoutes = require('./routes/upload');

const app = express();

if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);

app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(httpLogger);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(require('cors')(productionConfig.cors));

app.use('/api/auth', authRoutes);
app.use('/api/tours', tourRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/uploads', uploadRoutes);

// Serve frontend
app.use(express.static(path.join(__dirname, 'public')));

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString(), env: process.env.NODE_ENV || 'development' });
});

// Fallback to index.html for SPA routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = parseInt(process.env.PORT || '3000', 10);
const sslPort = productionConfig.ssl.port || 443;

// start http
const httpServer = http.createServer(app);
httpServer.listen(PORT, () => logger.info('HTTP server listening on ' + PORT));

// start https if enabled
if (productionConfig.ssl.enabled) {
  try {
    const key = fs.readFileSync(productionConfig.ssl.keyPath, 'utf8');
    const cert = fs.readFileSync(productionConfig.ssl.certPath, 'utf8');
    const httpsServer = https.createServer({ key, cert }, app);
    httpsServer.listen(sslPort, () => logger.info('HTTPS server listening on ' + sslPort));
  } catch (e) {
    logger.error('HTTPS start failed', { msg: e.message });
  }
}

// scheduler
const scheduler = new BackupScheduler();
if (productionConfig.backup.enabled) {
  scheduler.scheduleBackup(productionConfig.backup.schedule);
  scheduler.scheduleHealthCheck();
}

// graceful shutdown
const graceful = (sig) => {
  logger.info('Shutdown ' + sig);
  try { scheduler.stopAll(); } catch(e){}
  httpServer.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
};

process.on('SIGINT', () => graceful('SIGINT'));
process.on('SIGTERM', () => graceful('SIGTERM'));

module.exports = app;
