/**
 * ==========================================================
 * 📁 public/js/theme.js
 * Travel Dashboard Enterprise — Global Theme Controller
 * ==========================================================
 * ✅ Sinkronisasi dark/light mode di semua halaman
 * ✅ Menyimpan preferensi di localStorage
 * ✅ Memicu event global `themechange`
 * ✅ Auto-aplikasi ke dashboard, sidebar, dan komponen lain
 * ==========================================================
 */

export function initTheme() {
  const toggleBtn = document.getElementById("toggleThemeBtn");
  if (!toggleBtn) return;

  // === Load Theme Preference ===
  const savedTheme = localStorage.getItem("theme") || "light";
  document.body.setAttribute("data-theme", savedTheme);
  toggleBtn.innerText = savedTheme === "dark" ? "☀️" : "🌙";

  // === Toggle Theme ===
  toggleBtn.addEventListener("click", () => {
    const current = document.body.getAttribute("data-theme");
    const newTheme = current === "dark" ? "light" : "dark";
    document.body.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    toggleBtn.innerText = newTheme === "dark" ? "☀️" : "🌙";

    // 🔔 Trigger global event
    document.dispatchEvent(new CustomEvent("themechange"));
  });

  // === Sync Sidebar and Other Components ===
  document.addEventListener("themechange", () => {
    const theme = document.body.getAttribute("data-theme");
    const sidebar = document.getElementById("sidebar");
    if (sidebar) sidebar.setAttribute("data-theme", theme);
  });
}

// === Auto-run if imported via <script> ===
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
});