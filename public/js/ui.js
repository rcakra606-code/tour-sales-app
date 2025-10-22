// ==========================================================
// 🧭 Travel Dashboard Enterprise v5.4.6
// UI Interactivity (Sidebar, Theme, Navigation)
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const sidebar = document.getElementById("sidebar");
  const toggleSidebar = document.getElementById("toggleSidebar");
  const themeSwitch = document.getElementById("themeSwitch");

  // ==========================================================
  // 🌓 THEME TOGGLE (Dark / Light Mode)
  // ==========================================================
  const currentTheme = localStorage.getItem("theme") || "light";
  body.classList.toggle("dark-mode", currentTheme === "dark");
  if (themeSwitch) themeSwitch.checked = currentTheme === "dark";

  if (themeSwitch) {
    themeSwitch.addEventListener("change", () => {
      const mode = themeSwitch.checked ? "dark" : "light";
      body.classList.toggle("dark-mode", mode === "dark");
      localStorage.setItem("theme", mode);
    });
  }

  // ==========================================================
  // 📦 SIDEBAR TOGGLE (Expand / Collapse)
  // ==========================================================
  if (toggleSidebar) {
    toggleSidebar.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
      const isCollapsed = sidebar.classList.contains("collapsed");
      localStorage.setItem("sidebarState", isCollapsed ? "collapsed" : "expanded");
    });
  }

  // Restore sidebar state
  const sidebarState = localStorage.getItem("sidebarState") || "expanded";
  sidebar.classList.toggle("collapsed", sidebarState === "collapsed");

  // ==========================================================
  // 🧭 ACTIVE MENU HIGHLIGHT
  // ==========================================================
  const currentPage = window.location.pathname.split("/").pop();
  const menuLinks = document.querySelectorAll(".sidebar-menu li a");

  menuLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (href === currentPage) {
      link.parentElement.classList.add("active");
    } else {
      link.parentElement.classList.remove("active");
    }
  });

  // ==========================================================
  // 🚪 LOGOUT HANDLER
  // ==========================================================
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.clear();
      window.location.href = "login.html";
    });
  }

  // ==========================================================
  // 📱 MOBILE SIDEBAR AUTO-CLOSE
  // ==========================================================
  if (window.innerWidth <= 768) {
    const links = document.querySelectorAll(".sidebar-menu li a");
    links.forEach(link => {
      link.addEventListener("click", () => {
        sidebar.classList.remove("expanded");
        localStorage.setItem("sidebarState", "collapsed");
      });
    });
  }

  // ==========================================================
  // 🧩 AUTO LOGIN REDIRECT HANDLING
  // ==========================================================
  const token = localStorage.getItem("token");
  const isLoginPage = window.location.pathname.includes("login.html");

  // Jika belum login & bukan di halaman login → arahkan ke login
  if (!token && !isLoginPage) {
    window.location.href = "login.html";
  }

  // Jika sudah login & berada di halaman login → arahkan ke dashboard
  if (token && isLoginPage) {
    window.location.href = "dashboard.html";
  }
});