// ==========================================================
// 🚀 Travel Dashboard Loader Redirect v5.3.3
// Handles initial redirect to login or dashboard
// ==========================================================

window.addEventListener("DOMContentLoaded", () => {
  console.log("🔄 Checking authentication...");
  try {
    const token = localStorage.getItem("token");
    if (token && token !== "undefined") {
      console.log("✅ Token found, redirecting to dashboard...");
      window.location.replace("/dashboard.html");
    } else {
      console.log("➡️ No token found, redirecting to login...");
      window.location.replace("/login.html");
    }
  } catch (e) {
    console.error("❌ Redirect failed:", e);
    window.location.replace("/login.html");
  }
});