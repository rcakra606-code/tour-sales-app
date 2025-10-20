/* ==========================================================
   🧭 Travel Dashboard Enterprise v5.3
   Universal UI Controller (Sidebar + Theme + Role-based UI)
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const sidebar = document.getElementById("sidebar");
  const sidebarToggle = document.getElementById("sidebarToggle");
  const themeToggle = document.getElementById("themeToggle");
  const expandables = document.querySelectorAll(".expandable");
  const currentPath = window.location.pathname.split("/").pop();

  // ==========================================================
  // 🧭 1️⃣ SIDEBAR COLLAPSE / EXPAND
  // ==========================================================
  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
      localStorage.setItem("sidebarCollapsed", sidebar.classList.contains("collapsed"));
    });

    const isCollapsed = localStorage.getItem("sidebarCollapsed") === "true";
    if (isCollapsed) sidebar.classList.add("collapsed");
  }

  // ==========================================================
  // 📂 2️⃣ EXPANDABLE MENUS
  // ==========================================================
  expandables.forEach((item) => {
    const button = item.querySelector(".expand-toggle");
    if (button) {
      button.addEventListener("click", () => {
        const isOpen = item.classList.contains("open");
        document.querySelectorAll(".expandable").forEach((e) => e.classList.remove("open"));
        if (!isOpen) item.classList.add("open");
      });
    }
  });

  // ==========================================================
  // 🌗 3️⃣ THEME TOGGLE (Dark/Light Mode)
  // ==========================================================
  if (themeToggle) {
    const savedTheme = localStorage.getItem("theme") || "light";
    if (savedTheme === "dark") body.classList.add("theme-dark");

    themeToggle.addEventListener("click", () => {
      body.classList.toggle("theme-dark");
      const currentTheme = body.classList.contains("theme-dark") ? "dark" : "light";
      localStorage.setItem("theme", currentTheme);
    });
  }

  // ==========================================================
  // 🧩 4️⃣ ACTIVE LINK HIGHLIGHT
  // ==========================================================
  document.querySelectorAll(".sidebar-nav a").forEach((link) => {
    const linkPath = link.getAttribute("href").split("/").pop();
    if (linkPath === currentPath) {
      link.classList.add("active");
      const expandable = link.closest(".expandable");
      if (expandable) expandable.classList.add("open");
    }
  });

  // ==========================================================
  // 👤 5️⃣ USER INFO DISPLAY (from localStorage)
  // ==========================================================
  const userBadge = document.getElementById("userBadge");
  const userInfo = document.querySelector(".user-info");
  const userData = JSON.parse(localStorage.getItem("user") || "{}");

  if (userData && userData.username) {
    const displayName = userData.staff_name || userData.username;
    const displayRole = userData.role || "staff";

    if (userBadge) userBadge.textContent = displayRole;
    if (userInfo) userInfo.textContent = `${displayName} (${displayRole})`;
  }

  // ==========================================================
  // 🔒 6️⃣ ROLE-BASED UI VISIBILITY
  // ==========================================================
  if (userData.role) {
    const role = userData.role.toLowerCase();

    // Hide buttons & sections based on role
    if (role === "staff") {
      hideElements([".btn-delete", ".btn-edit", ".admin-only", ".semiadmin-only"]);
    } else if (role === "semiadmin") {
      hideElements([".btn-delete", ".admin-only"]);
    } else if (role === "admin") {
      // admin sees everything
    }
  }

  function hideElements(selectors) {
    selectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el) => (el.style.display = "none"));
    });
  }

  // ==========================================================
  // 📱 7️⃣ AUTO COLLAPSE ON MOBILE
  // ==========================================================
  if (window.innerWidth < 768) sidebar.classList.add("collapsed");

  // ==========================================================
  // 🎨 8️⃣ ANIMATIONS
  // ==========================================================
  sidebar.style.transition = "width 0.3s ease, background-color 0.3s";
  body.style.transition = "background-color 0.3s, color 0.3s";
});