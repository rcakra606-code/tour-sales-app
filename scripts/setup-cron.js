// scripts/setup-cron.js
const cron = require("node-cron");
const { exec } = require("child_process");

console.log("⏰ Starting daily backup scheduler...");

// Jalankan setiap jam 2 pagi
cron.schedule("0 2 * * *", () => {
  console.log("🗄️ Running daily backup...");
  exec("npm run backup-db", (err, stdout, stderr) => {
    if (err) console.error("❌ Cron backup error:", err);
    else console.log(stdout || "✅ Backup complete");
  });
});
