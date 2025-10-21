// ==========================================================
// 🚪 Logout Script v5.3.4
// Clears session and safely redirects to login page
// ==========================================================

window.addEventListener("DOMContentLoaded", () => {
  console.log("🚪 Memulai proses logout...");

  try {
    // Hapus semua session dan local data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();

    console.log("✅ Semua sesi berhasil dibersihkan.");

    // Tambahkan delay pendek supaya browser flush storage
    setTimeout(() => {
      console.log("➡️ Mengarahkan ke login...");
      window.location.replace("/login.html");
    }, 700);
  } catch (err) {
    console.error("❌ Logout error:", err);
    window.location.replace("/login.html");
  }
});