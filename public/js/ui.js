// ==========================================================
// 🧭 UI Handler — Sidebar, Theme Mode, JWT Check
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const sidebar = document.getElementById("sidebar");
  const toggleSidebar = document.getElementById("toggleSidebar");
  const themeSwitch = document.getElementById("themeSwitch");

  // === SIDEBAR TOGGLE ===
  if (toggleSidebar) {
    toggleSidebar.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
    });
  }

  // === THEME SWITCH ===
  if (themeSwitch) {
    themeSwitch.addEventListener("change", (e) => {
      if (e.target.checked) {
        body.classList.add("dark-mode");
        localStorage.setItem("theme", "dark");
      } else {
        body.classList.remove("dark-mode");
        localStorage.setItem("theme", "light");
      }
    });
  }

  // === LOAD THEME STATE ===
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    body.classList.add("dark-mode");
    if (themeSwitch) themeSwitch.checked = true;
  }

  // === JWT TOKEN VALIDATION ===
  const token = localStorage.getItem("token");
  if (!token && !window.location.href.includes("login.html")) {
    window.location.href = "login.html";
  }
});