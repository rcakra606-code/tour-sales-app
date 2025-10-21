// ==========================================================
// 🌙 UI Handler - Sidebar + Theme + Role UI v5.3
// ==========================================================
document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar");
  const sidebarToggle = document.getElementById("sidebarToggle");
  const themeToggle = document.getElementById("themeToggle");

  // === Sidebar Toggle ===
  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
      localStorage.setItem("sidebarCollapsed", sidebar.classList.contains("collapsed"));
    });
  }

  // === Remember Sidebar State ===
  const isCollapsed = localStorage.getItem("sidebarCollapsed") === "true";
  if (isCollapsed) sidebar.classList.add("collapsed");
  else sidebar.classList.remove("collapsed");

  // === Expandable Menus ===
  document.querySelectorAll(".expandable").forEach((item) => {
    const toggle = item.querySelector(".expand-toggle");
    const submenu = item.querySelector(".submenu");
    if (!toggle || !submenu) return;

    toggle.addEventListener("click", () => {
      submenu.classList.toggle("open");
      item.classList.toggle("open");
    });
  });

  // === Theme Mode ===
  const theme = localStorage.getItem("theme") || "light";
  document.body.className = theme === "dark" ? "theme-dark" : "theme-light";

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const isDark = document.body.classList.toggle("theme-dark");
      document.body.classList.toggle("theme-light", !isDark);
      localStorage.setItem("theme", isDark ? "dark" : "light");
    });
  }

  // === Role-Based Visibility ===
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user.role || "staff";

  document.querySelectorAll(".admin-only").forEach((el) => {
    if (role !== "admin") el.style.display = "none";
  });
  document.querySelectorAll(".semiadmin-only").forEach((el) => {
    if (role === "staff") el.style.display = "none";
  });

  // === Active User Display ===
  const activeUserEl = document.getElementById("activeUser");
  if (activeUserEl && user.username) {
    activeUserEl.textContent = `${user.staff_name || user.username} (${role})`;
  }
});