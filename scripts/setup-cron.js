const cron = require('node-cron');
const Backup = require('./backup-database');

class BackupScheduler {
  constructor() {
    this.backup = require('./backup-database');
    this.jobs = new Map();
  }

  scheduleBackup(expr = process.env.BACKUP_SCHEDULE || '0 2 * * *') {
    if (this.jobs.has('backup')) this.jobs.get('backup').stop();
    const job = cron.schedule(expr, async () => {
      try {
        console.log('Scheduled backup:', new Date().toISOString());
        await this.backup.createBackup();
        console.log('Scheduled backup done');
      } catch(e) { console.error('Scheduled backup error', e.message); }
    }, { scheduled: true, timezone: process.env.TZ || 'Asia/Jakarta' });
    this.jobs.set('backup', job);
    return job;
  }

  scheduleHealthCheck() {
    if (this.jobs.has('health')) this.jobs.get('health').stop();
    const job = cron.schedule('*/30 * * * *', () => {
      console.log('Backup health check job tick:', new Date().toISOString());
    }, { scheduled: true, timezone: process.env.TZ || 'Asia/Jakarta' });
    this.jobs.set('health', job);
    return job;
  }

  stopAll() {
    for (const j of this.jobs.values()) j.stop();
    this.jobs.clear();
  }

  getStatus() {
    const status = {};
    for (const [k, j] of this.jobs) status[k] = { running: j.running };
    return status;
  }
}

module.exports = BackupScheduler;
