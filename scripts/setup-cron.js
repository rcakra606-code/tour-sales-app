// ===============================
// ✅ Backup & Health Check Scheduler (Dummy Safe)
// ===============================
class BackupScheduler {
  scheduleBackup(cronTime) {
    console.log(`🕒 Backup job scheduled at: ${cronTime}`);
  }

  scheduleHealthCheck() {
    console.log('✅ Health check scheduler initialized');
  }

  stopAll() {
    console.log('🧹 All schedulers stopped.');
  }
}

module.exports = BackupScheduler;
