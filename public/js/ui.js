// ==========================================================
// 🎨 UI Controller — Travel Dashboard Enterprise v5.4.5
// ==========================================================
// Fitur:
// - Sidebar toggle (expand/collapse)
// - Mode terang/gelap sinkron di semua halaman
// - Transisi animasi smooth antar halaman
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const sidebar = document.getElementById("sidebar");
  const toggleSidebarBtn = document.getElementById("toggleSidebar");
  const themeSwitch = document.getElementById("themeSwitch");

  // ======================================================
  // ☀️🌙 THEME MODE HANDLER
  // ======================================================
  const currentTheme = localStorage.getItem("theme") || "light";
  if (currentTheme === "dark") {
    body.classList.remove("light-mode");
    body.classList.add("dark-mode");
    if (themeSwitch) themeSwitch.checked = true;
  }

  if (themeSwitch) {
    themeSwitch.addEventListener("change", () => {
      if (themeSwitch.checked) {
        body.classList.add("dark-mode");
        body.classList.remove("light-mode");
        localStorage.setItem("theme", "dark");
      } else {
        body.classList.add("light-mode");
        body.classList.remove("dark-mode");
        localStorage.setItem("theme", "light");
      }
    });
  }

  // ======================================================
  // 🧭 SIDEBAR COLLAPSE
  // ======================================================
  if (toggleSidebarBtn && sidebar) {
    toggleSidebarBtn.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
      body.classList.toggle("sidebar-collapsed");

      // Simpan status sidebar di localStorage
      const collapsed = sidebar.classList.contains("collapsed");
      localStorage.setItem("sidebarCollapsed", collapsed ? "true" : "false");
    });

    // Pulihkan status sidebar dari localStorage
    const isCollapsed = localStorage.getItem("sidebarCollapsed") === "true";
    if (isCollapsed) {
      sidebar.classList.add("collapsed");
      body.classList.add("sidebar-collapsed");
    }
  }

  // ======================================================
  // 💫 PAGE TRANSITION ANIMATION
  // ======================================================
  document.querySelectorAll('a[href$=".html"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (!href.startsWith("#") && href.endsWith(".html")) {
        e.preventDefault();
        body.classList.add("fade-out");
        setTimeout(() => {
          window.location.href = href;
        }, 200);
      }
    });
  });

  // Tambahkan efek fade-in setiap kali halaman dimuat
  body.classList.add("fade-in");
});

// ==========================================================
// ✨ CSS class tambahan (light/dark)
// ==========================================================
// Gunakan di file CSS (style.css):
//
// body.light-mode { background: #f4f6f9; color: #222; }
// body.dark-mode { background: #181a1b; color: #eee; }
//
// .sidebar.collapsed { width: 80px; }
// .sidebar-collapsed main { margin-left: 90px; transition: all 0.3s ease; }
//
// .fade-in { opacity: 0; animation: fadeIn 0.3s forwards; }
// .fade-out { opacity: 1; animation: fadeOut 0.2s forwards; }
//
// @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
// @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }