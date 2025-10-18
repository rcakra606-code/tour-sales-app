/**
 * middleware/log.js
 * Utility untuk mencatat aktivitas user
 */
const { logEvent } = require("../config/logger");

async function logAction(user, action, target) {
  if (!user || !user.username) return;
  try {
    await logEvent(user.username, user.type, action, target);
  } catch (err) {
    console.error("❌ Log error:", err.message);
  }
}

module.exports = { logAction };
