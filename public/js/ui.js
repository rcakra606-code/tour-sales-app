// public/js/ui.js
// ==========================================================
// UI Core — Sidebar (collapse/expand), Theme (light/dark), Menu
// Travel Dashboard v5.5 Corporate Edition
// ==========================================================

(function () {
  "use strict";

  const SELECTORS = {
    sidebar: ".sidebar",
    sidebarToggleBtn: "[data-toggle='sidebar']",
    themeToggle: "#themeSwitch",
    body: "body",
    submenuToggle: ".has-children > a",
    navLinks: ".sidebar nav a",
  };

  const KEYS = {
    SIDEBAR_COLLAPSED: "td_sidebar_collapsed_v5",
    THEME: "td_theme_v5",
  };

  // ---------- Utilities ----------
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) =>
    Array.from(ctx.querySelectorAll(sel || "") || []);

  function isSmallScreen() {
    return window.innerWidth <= 768;
  }

  // ---------- Sidebar ----------
  function setSidebarCollapsed(collapsed) {
    const sidebar = $(SELECTORS.sidebar);
    const body = document.querySelector(SELECTORS.body);
    if (!sidebar || !body) return;
    if (collapsed) {
      sidebar.classList.add("collapsed");
      body.classList.add("sidebar-collapsed");
    } else {
      sidebar.classList.remove("collapsed");
      body.classList.remove("sidebar-collapsed");
    }
    try {
      localStorage.setItem(KEYS.SIDEBAR_COLLAPSED, collapsed ? "1" : "0");
    } catch (e) {
      // ignore storage errors
    }
  }

  function toggleSidebar() {
    const sidebar = $(SELECTORS.sidebar);
    if (!sidebar) return;
    const collapsed = sidebar.classList.contains("collapsed");
    setSidebarCollapsed(!collapsed);
  }

  function initSidebarToggle() {
    const btns = $$(SELECTORS.sidebarToggleBtn);
    if (!btns.length) return;
    btns.forEach((btn) =>
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        toggleSidebar();
      })
    );
  }

  function restoreSidebarStateOnLoad() {
    const sidebar = $(SELECTORS.sidebar);
    if (!sidebar) return;
    let collapsed = null;
    try {
      const v = localStorage.getItem(KEYS.SIDEBAR_COLLAPSED);
      if (v === "1") collapsed = true;
      if (v === "0") collapsed = false;
    } catch (e) {
      collapsed = null;
    }

    // default: collapsed on small screens
    if (collapsed === null) {
      setSidebarCollapsed(isSmallScreen());
    } else {
      setSidebarCollapsed(collapsed);
    }
  }

  // auto collapse on resize small
  function handleResize() {
    const sidebar = $(SELECTORS.sidebar);
    if (!sidebar) return;
    if (isSmallScreen()) {
      setSidebarCollapsed(true);
    } else {
      // restore to saved value (do not override saved on larger screens)
      const v = localStorage.getItem(KEYS.SIDEBAR_COLLAPSED);
      if (v === "1") setSidebarCollapsed(true);
      else setSidebarCollapsed(false);
    }
  }

  // ---------- Submenu (expand within sidebar) ----------
  function initSubmenuToggles() {
    const toggles = $$(SELECTORS.submenuToggle);
    if (!toggles.length) return;
    toggles.forEach((a) => {
      // prevent default navigation on parent link if it only toggles submenu
      a.addEventListener("click", (e) => {
        // if link has href="#" or empty, treat as toggle
        const href = a.getAttribute("href");
        const isToggle = !href || href === "#" || href.startsWith("javascript:");
        if (isToggle) e.preventDefault();

        const parent = a.parentElement;
        if (!parent) return;
        const opened = parent.classList.contains("open");
        // close others (accordion behaviour) — optional, but cleaner
        const siblings = parent.parentElement
          ? Array.from(parent.parentElement.children).filter(
              (ch) => ch !== parent
            )
          : [];
        siblings.forEach((sib) => sib.classList.remove("open"));

        if (opened) parent.classList.remove("open");
        else parent.classList.add("open");
      });
    });
  }

  // ---------- Highlight active nav link ----------
  function setActiveNavLink() {
    const links = $$(SELECTORS.navLinks);
    if (!links.length) return;
    const currentPath = location.pathname.split("/").pop() || "index.html";
    links.forEach((a) => {
      // match by href file name or by dataset route
      const href = a.getAttribute("href") || "";
      const target = href.split("/").pop();
      if (!target) {
        a.classList.remove("active");
        return;
      }
      if (target === currentPath) {
        a.classList.add("active");
        // ensure its parent submenu (if any) is open so active is visible
        const parent = a.closest(".has-children");
        if (parent) parent.classList.add("open");
      } else {
        a.classList.remove("active");
      }
    });
  }

  // ---------- Theme (light/dark) ----------
  function applyTheme(theme) {
    const body = document.querySelector(SELECTORS.body);
    if (!body) return;
    if (theme === "dark") {
      body.classList.add("dark-mode");
    } else {
      body.classList.remove("dark-mode");
    }
    try {
      localStorage.setItem(KEYS.THEME, theme);
    } catch (e) {
      // ignore
    }
    // sync toggle checkbox if exists
    const sw = document.querySelector(SELECTORS.themeToggle);
    if (sw) sw.checked = theme === "dark";
  }

  function toggleTheme() {
    const body = document.querySelector(SELECTORS.body);
    if (!body) return;
    const isDark = body.classList.contains("dark-mode");
    applyTheme(isDark ? "light" : "dark");
  }

  function initThemeToggle() {
    const sw = document.querySelector(SELECTORS.themeToggle);
    if (sw) {
      sw.addEventListener("change", () => {
        toggleTheme();
      });
    }

    // restore saved theme
    try {
      const saved = localStorage.getItem(KEYS.THEME);
      if (saved === "dark") applyTheme("dark");
      else if (saved === "light") applyTheme("light");
      else {
        // default: follow prefers-color-scheme
        const prefersDark = window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches;
        applyTheme(prefersDark ? "dark" : "light");
      }
    } catch (e) {
      // default fallback
      applyTheme("light");
    }
  }

  // ---------- Accessibility / keyboard controls ----------
  function initKeyboardShortcuts() {
    // press 'b' to toggle sidebar, 't' to toggle theme
    document.addEventListener("keydown", (e) => {
      // ignore when typing in inputs
      const tag = document.activeElement && document.activeElement.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "b" || e.key === "B") {
        toggleSidebar();
      } else if (e.key === "t" || e.key === "T") {
        toggleTheme();
      }
    });
  }

  // ---------- Init all ----------
  function initUI() {
    restoreSidebarStateOnLoad();
    initSidebarToggle();
    initSubmenuToggles();
    setActiveNavLink();
    initThemeToggle();
    initKeyboardShortcuts();

    // responsive
    window.addEventListener("resize", () => {
      handleResize();
    });

    // ensure initial resize handling
    handleResize();
  }

  // run on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initUI);
  } else {
    initUI();
  }

  // expose for debugging (optional)
  window.__td_ui = {
    toggleSidebar,
    setSidebarCollapsed,
    applyTheme,
    toggleTheme,
  };
})();