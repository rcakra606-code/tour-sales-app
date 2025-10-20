// public/js/ui.js
// Universal UI helpers: sidebar collapse, submenu expand, theme toggle
// Works on all pages. Safe (guards missing elements), persists state in localStorage.

(function () {
  // Run after DOM ready
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(() => {
    try {
      const body = document.body;

      // Elements
      const sidebar = document.getElementById("sidebar");
      const sidebarToggle = document.getElementById("sidebarToggle");
      const themeToggle = document.getElementById("themeToggle");
      const expandToggles = Array.from(document.querySelectorAll(".expand-toggle"));

      // SAFE: functions to add/remove collapsed class
      function setSidebarCollapsed(collapsed) {
        if (!sidebar) return;
        if (collapsed) sidebar.classList.add("collapsed");
        else sidebar.classList.remove("collapsed");
      }

      // Restore saved sidebar state
      const savedSidebar = localStorage.getItem("td_sidebar_state");
      if (savedSidebar === "collapsed") setSidebarCollapsed(true);
      else if (savedSidebar === "expanded") setSidebarCollapsed(false);
      // If not set, keep default from HTML/CSS

      // Sidebar toggle click
      if (sidebar && sidebarToggle) {
        sidebarToggle.addEventListener("click", () => {
          const isCollapsed = sidebar.classList.toggle("collapsed");
          localStorage.setItem("td_sidebar_state", isCollapsed ? "collapsed" : "expanded");
          // dispatch an event for other scripts (optional)
          window.dispatchEvent(new CustomEvent("td:sidebar-toggled", { detail: { collapsed: isCollapsed } }));
        });
      }

      // Theme restore
      const savedTheme = localStorage.getItem("td_theme");
      if (savedTheme === "dark") body.classList.add("theme-dark");
      else if (savedTheme === "light") body.classList.remove("theme-dark");

      // Theme toggle click
      if (themeToggle) {
        themeToggle.addEventListener("click", () => {
          const isDark = body.classList.toggle("theme-dark");
          localStorage.setItem("td_theme", isDark ? "dark" : "light");
          window.dispatchEvent(new CustomEvent("td:theme-changed", { detail: { dark: isDark } }));
        });
      }

      // Expandable submenus: restore open state if saved per menu text (optional)
      expandToggles.forEach((btn, idx) => {
        const submenu = btn.nextElementSibling;
        // attach click
        btn.addEventListener("click", () => {
          if (!submenu) return;
          const isOpen = submenu.classList.toggle("open");
          // save a small key per index to preserve open/close (non-critical)
          try {
            const key = `td_submenu_${idx}`;
            localStorage.setItem(key, isOpen ? "open" : "closed");
          } catch (e) {
            /* ignore storage errors */
          }
        });

        // restore saved
        try {
          const key = `td_submenu_${idx}`;
          const val = localStorage.getItem(key);
          if (val === "open" && submenu) submenu.classList.add("open");
        } catch (e) {
          // ignore
        }
      });

      // Accessibility: allow keyboard toggle for sidebar (Enter / Space on toggle)
      if (sidebarToggle) {
        sidebarToggle.setAttribute("role", "button");
        sidebarToggle.setAttribute("tabindex", "0");
        sidebarToggle.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            sidebarToggle.click();
          }
        });
      }
      if (themeToggle) {
        themeToggle.setAttribute("role", "button");
        themeToggle.setAttribute("tabindex", "0");
        themeToggle.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            themeToggle.click();
          }
        });
      }

      // When sidebar is toggled, adjust main layout if necessary (for pages that watch it)
      // Some pages may have layout recalculation logic bound to custom event 'td:sidebar-toggled'

      // Small helper: close all open submenus when clicking outside (optional)
      document.addEventListener("click", (ev) => {
        // if clicked inside any .expand-toggle or its submenu, do nothing
        const clickedExpand = ev.target.closest && ev.target.closest(".expand-toggle, .submenu");
        if (clickedExpand) return;
        // otherwise collapse submenus that were opened (leave sidebar collapsed state)
        document.querySelectorAll(".submenu.open").forEach((el) => el.classList.remove("open"));
      });

      // debug helper - expose current states
      window.__td_ui_state = {
        get sidebar() {
          return localStorage.getItem("td_sidebar_state") || null;
        },
        get theme() {
          return localStorage.getItem("td_theme") || null;
        },
      };
    } catch (err) {
      // Do not break page if UI script errors
      // Log to console for debug
      console.error("ui.js init error:", err);
    }
  });
})();