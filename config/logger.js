// config/logger.js
// Simple safe logger (for database & controller use)
export function logInfo(msg) {
  console.log(`[INFO] ${msg}`);
}

export function logError(err, context = "Unknown") {
  const message = typeof err === "object" ? err.message : err;
  console.error(`❌ [${context}] ${message}`);
}

export default { logInfo, logError };