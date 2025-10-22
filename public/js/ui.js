// ==========================================================
// ⚙️ UI Controller — Travel Dashboard Enterprise v5.4.7
// ==========================================================
// Fitur:
// - Sidebar expand/collapse (dengan localStorage persist)
// - Dark/Light mode toggle
// - Logout universal
// - Highlight menu aktif otomatis
// - Responsive auto-collapse
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const sidebar = document.getElementById("sidebar");
  const toggleSidebar = document.getElementById("toggleSidebar");
  const themeSwitch = document.getElementById("themeSwitch");
  const logoutBtn = document.getElementById("logoutBtn");

  // ======================================================
  // 🚨 SAFE GUARD
  // ======================================================
  if (!sidebar) {
    console.warn("⚠️ Sidebar not found: skipping UI binding for this page.");
  }

  // ======================================================
  // 🧭 SIDEBAR TOGGLE
  // ======================================================
  if (toggleSidebar && sidebar) {
    toggleSidebar.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
      localStorage.setItem("sidebar-collapsed", sidebar.classList.contains("collapsed"));
    });
  }

  // Muat status sidebar dari localStorage
  if (sidebar) {
    const sidebarState = localStorage.getItem("sidebar-collapsed");
    if (sidebarState === "true") sidebar.classList.add("collapsed");
  }

  // ======================================================
  // 🌗 THEME TOGGLE
  // ======================================================
  if (themeSwitch) {
    themeSwitch.addEventListener("change", (e) => {
      const mode = e.target.checked ? "dark" : "light";
      setTheme(mode);
    });
  }

  function setTheme(mode) {
    if (mode === "dark") {
      body.classList.remove("light-mode");
      body.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
      if (themeSwitch) themeSwitch.checked = true;
    } else {
      body.classList.remove("dark-mode");
      body.classList.add("light-mode");
      localStorage.setItem("theme", "light");
      if (themeSwitch) themeSwitch.checked = false;
    }
  }

  // Muat tema dari localStorage
  const savedTheme = localStorage.getItem("theme") || "light";
  setTheme(savedTheme);

  // ======================================================
  // 🚪 LOGOUT HANDLER
  // ======================================================
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (confirm("Apakah kamu yakin ingin logout?")) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("staff_name");
        window.location.href = "login.html";
      }
    });
  }

  // ======================================================
  // 🌐 MENU ACTIVE STATE
  // ======================================================
  if (sidebar) {
    const menuLinks = document.querySelectorAll(".sidebar-menu a");
    const currentPath = window.location.pathname.split("/").pop();
    menuLinks.forEach(link => {
      if (link.getAttribute("href") === currentPath) {
        link.parentElement.classList.add("active");
      } else {
        link.parentElement.classList.remove("active");
      }
    });
  }

  // ======================================================
  // 📱 RESPONSIVE AUTO COLLAPSE (SAFE VERSION)
  // ======================================================
  function handleResize() {
    const sidebarEl = document.getElementById("sidebar");
    if (!sidebarEl) return;

    if (window.innerWidth < 900) {
      sidebarEl.classList.add("collapsed");
    } else if (localStorage.getItem("sidebar-collapsed") === "false") {
      sidebarEl.classList.remove("collapsed");
    }
  }

  window.addEventListener("resize", handleResize);
  handleResize();
});