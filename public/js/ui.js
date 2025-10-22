// ==========================================================
// ⚙️ UI Controller — Travel Dashboard Enterprise v5.4.6
// ==========================================================
// Mengatur:
// - Sidebar expand/collapse
// - Mode siang/malam (dark/light)
// - Logout universal
// - Responsive sidebar
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const sidebar = document.getElementById("sidebar");
  const toggleSidebar = document.getElementById("toggleSidebar");
  const themeSwitch = document.getElementById("themeSwitch");
  const logoutBtn = document.getElementById("logoutBtn");

  // ======================================================
  // 🧭 SIDEBAR TOGGLE
  // ======================================================
  if (toggleSidebar) {
    toggleSidebar.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
      localStorage.setItem("sidebar-collapsed", sidebar.classList.contains("collapsed"));
    });
  }

  // Muat status sidebar dari localStorage
  const sidebarState = localStorage.getItem("sidebar-collapsed");
  if (sidebarState === "true") {
    sidebar.classList.add("collapsed");
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
  const menuLinks = document.querySelectorAll(".sidebar-menu a");
  menuLinks.forEach(link => {
    if (window.location.pathname.includes(link.getAttribute("href"))) {
      link.parentElement.classList.add("active");
    } else {
      link.parentElement.classList.remove("active");
    }
  });

  // ======================================================
  // 📱 RESPONSIVE AUTO COLLAPSE
  // ======================================================
  function handleResize() {
    if (window.innerWidth < 900) {
      sidebar.classList.add("collapsed");
    } else if (localStorage.getItem("sidebar-collapsed") === "false") {
      sidebar.classList.remove("collapsed");
    }
  }
  window.addEventListener("resize", handleResize);
  handleResize();
});