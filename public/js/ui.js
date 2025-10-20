// ==========================================================
// 🧩 Travel Dashboard Enterprise v5.1
// Universal UI Script - Sidebar, Theme, Expand Menus
// ==========================================================

(function () {
  // Helper untuk menunggu DOM siap
  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(() => {
    try {
      const body = document.body;
      const sidebar = document.getElementById("sidebar");
      const sidebarToggle = document.getElementById("sidebarToggle");
      const themeToggle = document.getElementById("themeToggle");
      const expandToggles = Array.from(document.querySelectorAll(".expand-toggle"));

      // Sidebar State Persistence
      const savedSidebar = localStorage.getItem("td_sidebar_state");
      if (savedSidebar === "collapsed") sidebar?.classList.add("collapsed");

      // Theme Persistence
      const savedTheme = localStorage.getItem("td_theme");
      if (savedTheme === "dark") body.classList.add("theme-dark");

      // Sidebar Toggle
      if (sidebar && sidebarToggle) {
        sidebarToggle.addEventListener("click", () => {
          sidebar.classList.toggle("collapsed");
          localStorage.setItem(
            "td_sidebar_state",
            sidebar.classList.contains("collapsed") ? "collapsed" : "expanded"
          );
        });
      }

      // Theme Toggle
      if (themeToggle) {
        themeToggle.addEventListener("click", () => {
          body.classList.toggle("theme-dark");
          localStorage.setItem(
            "td_theme",
            body.classList.contains("theme-dark") ? "dark" : "light"
          );
        });
      }

      // Expandable Menus
      expandToggles.forEach((btn, index) => {
        const submenu = btn.nextElementSibling;
        if (!submenu) return;

        // Restore saved state
        const saved = localStorage.getItem(`td_submenu_${index}`);
        if (saved === "open") submenu.classList.add("open");

        // Toggle submenu
        btn.addEventListener("click", () => {
          submenu.classList.toggle("open");
          const state = submenu.classList.contains("open") ? "open" : "closed";
          localStorage.setItem(`td_submenu_${index}`, state);
        });
      });

      // Keyboard accessibility
      [sidebarToggle, themeToggle].forEach((el) => {
        if (!el) return;
        el.setAttribute("tabindex", "0");
        el.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            el.click();
          }
        });
      });

      // Click outside to close all submenus (optional)
      document.addEventListener("click", (ev) => {
        const clicked = ev.target.closest(".expand-toggle, .submenu, .sidebar");
        if (!clicked) {
          document.querySelectorAll(".submenu.open").forEach((menu) => {
            menu.classList.remove("open");
          });
        }
      });

      // Smooth transitions for UI
      body.style.transition = "background-color 0.3s ease, color 0.3s ease";
      const main = document.getElementById("main");
      if (main) main.style.transition = "margin-left 0.25s ease";

      console.log("✅ UI initialized (sidebar & theme toggle active)");
    } catch (err) {
      console.error("⚠️ UI initialization error:", err);
    }
  });
})();