/**
 * ==========================================================
 * 📁 public/js/sidebar.js
 * Travel Dashboard Enterprise — Sidebar Controller
 * ==========================================================
 * ✅ Auto-load sidebar.html ke setiap halaman
 * ✅ Collapse / expand toggle
 * ✅ Remember state via localStorage
 * ✅ Highlight active page
 * ✅ Sync dark/light mode
 * ==========================================================
 */

document.addEventListener("DOMContentLoaded", async () => {
  const sidebarContainer = document.createElement("div");
  sidebarContainer.id = "sidebar-container";
  document.body.prepend(sidebarContainer);

  // ==== Load Sidebar HTML ====
  try {
    const res = await fetch("/sidebar.html");
    if (res.ok) {
      sidebarContainer.innerHTML = await res.text();
      initializeSidebar();
    } else {
      console.warn("⚠️ Gagal memuat sidebar.html");
    }
  } catch (err) {
    console.error("❌ Error memuat sidebar:", err);
  }
});

function initializeSidebar() {
  const sidebar = document.getElementById("sidebar");
  const toggleSidebarBtn = document.getElementById("toggleSidebarBtn");

  // ===== Restore Collapse State =====
  const savedState = localStorage.getItem("sidebarState") || "expanded";
  if (savedState === "collapsed") sidebar.classList.add("collapsed");

  // ===== Handle Collapse Toggle =====
  toggleSidebarBtn?.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    const isCollapsed = sidebar.classList.contains("collapsed");
    localStorage.setItem("sidebarState", isCollapsed ? "collapsed" : "expanded");
  });

  // ===== Highlight Active Page =====
  const currentPath = window.location.pathname.split("/").pop();
  const items = sidebar.querySelectorAll(".sidebar-item");
  items.forEach((item) => {
    const href = item.getAttribute("href");
    if (href && href.includes(currentPath)) {
      item.classList.add("active");
    }
  });

  // ===== Sync Dark Mode =====
  const theme = document.body.getAttribute("data-theme") || "light";
  sidebar.setAttribute("data-theme", theme);

  // Listen for global theme changes (triggered by dashboard toggle)
  document.addEventListener("themechange", () => {
    const newTheme = document.body.getAttribute("data-theme") || "light";
    sidebar.setAttribute("data-theme", newTheme);
  });

  // ===== Responsive (mobile toggle) =====
  const mediaQuery = window.matchMedia("(max-width: 768px)");
  function handleResize(e) {
    if (e.matches) sidebar.classList.remove("collapsed");
  }
  mediaQuery.addEventListener("change", handleResize);
}