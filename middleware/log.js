const { getDB } = require("../db");
function logAction(user, action, target = "") {
  try {
    const db = getDB();
    db.prepare("INSERT INTO logs (username, role, action, target) VALUES (?, ?, ?, ?)")
      .run(user?.username || "anonymous", user?.type || "guest", action, target);
  } catch (err) {
    console.error("Log insert error:", err.message);
  }
}
module.exports = { logAction };
