// ==========================================================
// 🧭 UI Handler — Travel Dashboard v5.5.1
// Sidebar + Theme Switch + Active Link Highlight
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const sidebar = document.querySelector(".sidebar");
  const themeSwitch = document.getElementById("themeSwitch");
  const sidebarToggles = document.querySelectorAll("[data-toggle='sidebar']");

  // ======== SIDEBAR COLLAPSE / EXPAND ==========
  sidebarToggles.forEach((btn) => {
    btn.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
    });
  });

  // Expand submenu logic
  document.querySelectorAll(".has-children > a").forEach((menu) => {
    menu.addEventListener("click", (e) => {
      e.preventDefault();
      menu.parentElement.classList.toggle("expanded");
    });
  });

  // ======== DARK / LIGHT THEME SWITCH ==========
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) body.classList.add(savedTheme);

  if (themeSwitch) {
    themeSwitch.checked = body.classList.contains("theme-dark");
    themeSwitch.addEventListener("change", () => {
      if (themeSwitch.checked) {
        body.classList.remove("theme-light");
        body.classList.add("theme-dark");
        localStorage.setItem("theme", "theme-dark");
      } else {
        body.classList.remove("theme-dark");
        body.classList.add("theme-light");
        localStorage.setItem("theme", "theme-light");
      }
    });
  }

  // ======== ACTIVE LINK HIGHLIGHT ==========
  const currentPage = location.pathname.split("/").pop();
  document.querySelectorAll(".sidebar nav a").forEach((link) => {
    if (link.getAttribute("href") === currentPage) {
      link.classList.add("active");
      const parent = link.closest(".has-children");
      if (parent) parent.classList.add("expanded");
    }
  });
});