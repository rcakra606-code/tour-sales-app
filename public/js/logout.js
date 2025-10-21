// ==========================================================
// 🚪 Logout Script v5.3.4
// Clears session and safely redirects to login page
// ==========================================================

window.addEventListener("DOMContentLoaded", () => {
  console.log("🚪 Logging out...");

  try {
    // Bersihkan semua session data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();

    console.log("✅ Session cleared.");

    // Tunggu sedikit supaya storage flush sempurna
    setTimeout(() => {
      window.location.href = "/login.html";
    }, 700);
  } catch (err) {
    console.error("❌ Logout failed:", err);
    window.location.href = "/login.html";
  }
});