/* ==========================================================
   🧭 Travel Dashboard Enterprise v5.2
   Universal UI Controller (Sidebar + Theme + Active State)
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const sidebar = document.getElementById("sidebar");
  const sidebarToggle = document.getElementById("sidebarToggle");
  const themeToggle = document.getElementById("themeToggle");
  const expandables = document.querySelectorAll(".expandable");
  const currentPath = window.location.pathname.split("/").pop();

  /* ------------------------------
     1️⃣ SIDEBAR TOGGLE (Collapse)
  ------------------------------ */
  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
      localStorage.setItem("sidebarCollapsed", sidebar.classList.contains("collapsed"));
    });

    // Restore sidebar state
    const isCollapsed = localStorage.getItem("sidebarCollapsed") === "true";
    if (isCollapsed) sidebar.classList.add("collapsed");
  }

  /* ------------------------------
     2️⃣ EXPANDABLE MENUS
  ------------------------------ */
  expandables.forEach((item) => {
    const button = item.querySelector(".expand-toggle");
    const submenu = item.querySelector(".submenu");

    if (button) {
      button.addEventListener("click", () => {
        const isOpen = item.classList.contains("open");
        document.querySelectorAll(".expandable").forEach((e) => e.classList.remove("open"));
        if (!isOpen) item.classList.add("open");
        submenu.classList.toggle("open");
      });
    }
  });

  /* ------------------------------
     3️⃣ THEME TOGGLE (Dark/Light)
  ------------------------------ */
  if (themeToggle) {
    const savedTheme = localStorage.getItem("theme") || "light";
    if (savedTheme === "dark") body.classList.add("theme-dark");

    themeToggle.addEventListener("click", () => {
      body.classList.toggle("theme-dark");
      const currentTheme = body.classList.contains("theme-dark") ? "dark" : "light";
      localStorage.setItem("theme", currentTheme);
    });
  }

  /* ------------------------------
     4️⃣ ACTIVE LINK HIGHLIGHT
  ------------------------------ */
  document.querySelectorAll(".sidebar-nav a").forEach((link) => {
    const linkPath = link.getAttribute("href").split("/").pop();
    if (linkPath === currentPath) {
      link.classList.add("active");
      const expandable = link.closest(".expandable");
      if (expandable) expandable.classList.add("open");
    }
  });

  /* ------------------------------
     5️⃣ AUTO CLOSE SIDEBAR ON MOBILE
  ------------------------------ */
  if (window.innerWidth < 768) {
    sidebar.classList.add("collapsed");
  }

  /* ------------------------------
     6️⃣ SMOOTH TRANSITION
  ------------------------------ */
  sidebar.style.transition = "width 0.3s ease, background-color 0.3s";
  body.style.transition = "background-color 0.3s, color 0.3s";
});