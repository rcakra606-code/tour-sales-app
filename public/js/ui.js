/**
 * ==========================================================
 * ui.js — Global Sidebar & Theme Controller (v3.7)
 * ==========================================================
 * ✅ Sidebar Expand/Collapse dengan animasi halus
 * ✅ Dark/Light Mode dengan transisi lembut
 * ✅ Efek Ripple klik di tombol & link
 * ✅ Glow highlight di card dashboard
 * ✅ Persist theme + responsive auto collapse
 * ==========================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  // -------------------------------------
  // 🧭 Sidebar Toggle
  // -------------------------------------
  const sidebar = document.getElementById("sidebar");
  const toggleSidebar = document.getElementById("toggleSidebar");
  const sidebarTitle = document.getElementById("sidebarTitle");

  if (sidebar && toggleSidebar) {
    toggleSidebar.addEventListener("click", () => {
      const isCollapsed = sidebar.classList.contains("sidebar-collapsed");
      sidebar.classList.toggle("sidebar-collapsed", !isCollapsed);
      sidebar.classList.toggle("sidebar-expanded", isCollapsed);
      if (sidebarTitle) {
        sidebarTitle.classList.add("opacity-0");
        setTimeout(() => {
          sidebarTitle.textContent = isCollapsed ? "Menu" : "";
          sidebarTitle.classList.remove("opacity-0");
        }, 180);
      }
    });
  }

  // -------------------------------------
  // 🌗 Theme (Light/Dark Mode)
  // -------------------------------------
  const themeToggle = document.getElementById("themeToggle");
  const currentMode = document.getElementById("currentMode");

  const applyTheme = (theme) => {
    const html = document.documentElement;
    html.classList.toggle("dark", theme === "dark");
    html.classList.add("theme-transition");
    setTimeout(() => html.classList.remove("theme-transition"), 400);
    localStorage.setItem("theme", theme);
    if (currentMode) currentMode.textContent = theme === "dark" ? "Dark Mode" : "Light Mode";
  };

  const savedTheme = localStorage.getItem("theme") || "light";
  applyTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const newTheme = document.documentElement.classList.contains("dark") ? "light" : "dark";
      applyTheme(newTheme);
    });
  }

  // -------------------------------------
  // 📱 Responsive Sidebar
  // -------------------------------------
  const handleResize = () => {
    if (window.innerWidth < 768) {
      sidebar?.classList.add("sidebar-collapsed");
      sidebar?.classList.remove("sidebar-expanded");
    } else {
      sidebar?.classList.remove("sidebar-collapsed");
      sidebar?.classList.add("sidebar-expanded");
    }
  };
  handleResize();
  window.addEventListener("resize", handleResize);

  // -------------------------------------
  // 💧 Ripple Effect for Buttons and Links
  // -------------------------------------
  document.body.addEventListener("click", (e) => {
    const target = e.target.closest("button, a");
    if (!target) return;

    const ripple = document.createElement("span");
    ripple.className = "ripple";
    const rect = target.getBoundingClientRect();
    ripple.style.left = `${e.clientX - rect.left}px`;
    ripple.style.top = `${e.clientY - rect.top}px`;
    target.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
  });

  // -------------------------------------
  // 🌟 Card Hover Glow (Dashboard & Report)
  // -------------------------------------
  const cards = document.querySelectorAll(".card-hover");
  cards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      card.classList.add("shadow-lg", "scale-[1.02]");
    });
    card.addEventListener("mouseleave", () => {
      card.classList.remove("shadow-lg", "scale-[1.02]");
    });
  });
});
