document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const sidebar = document.getElementById("sidebar");
  const toggleSidebar = document.getElementById("toggleSidebar");
  const themeSwitch = document.getElementById("themeSwitch");

  // ===== SIDEBAR =====
  if (sidebar && toggleSidebar) {
    toggleSidebar.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
      localStorage.setItem("sidebar-collapsed", sidebar.classList.contains("collapsed"));
    });

    const sidebarState = localStorage.getItem("sidebar-collapsed");
    if (sidebarState === "true") sidebar.classList.add("collapsed");
  }

  // ===== THEME MODE =====
  function setTheme(mode) {
    if (mode === "dark") {
      body.classList.add("dark-mode");
      body.classList.remove("light-mode");
      if (themeSwitch) themeSwitch.checked = true;
    } else {
      body.classList.add("light-mode");
      body.classList.remove("dark-mode");
      if (themeSwitch) themeSwitch.checked = false;
    }
    localStorage.setItem("theme", mode);
  }

  if (themeSwitch) {
    themeSwitch.addEventListener("change", e =>
      setTheme(e.target.checked ? "dark" : "light")
    );
  }

  setTheme(localStorage.getItem("theme") || "light");

  // ===== RESPONSIVE FIX =====
  window.addEventListener("resize", () => {
    if (!sidebar) return;
    if (window.innerWidth < 900) sidebar.classList.add("collapsed");
    else if (localStorage.getItem("sidebar-collapsed") === "false")
      sidebar.classList.remove("collapsed");
  });
});