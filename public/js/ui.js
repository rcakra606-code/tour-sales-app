// ==========================================================
// 🧭 UI Global Script — Travel Dashboard Enterprise v5.3.6
// ==========================================================
document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const sidebar = document.getElementById("sidebar");
  const sidebarToggle = document.getElementById("sidebarToggle");
  const themeToggle = document.getElementById("themeToggle");
  const currentYear = document.getElementById("year");
  const expandButtons = document.querySelectorAll(".expand-toggle");
  const activeLinks = document.querySelectorAll(".sidebar-nav a");

  // ==========================================================
  // 📅 Year Footer
  // ==========================================================
  if (currentYear) currentYear.textContent = new Date().getFullYear();

  // ==========================================================
  // 🌗 Theme Mode (Dark / Light)
  // ==========================================================
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    body.classList.remove("theme-light");
    body.classList.add("theme-dark");
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      if (body.classList.contains("theme-dark")) {
        body.classList.remove("theme-dark");
        body.classList.add("theme-light");
        localStorage.setItem("theme", "light");
      } else {
        body.classList.remove("theme-light");
        body.classList.add("theme-dark");
        localStorage.setItem("theme", "dark");
      }
    });
  }

  // ==========================================================
  // 📂 Sidebar Expand / Collapse Sections
  // ==========================================================
  expandButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const parent = e.target.closest(".expandable");
      const submenu = parent.querySelector(".submenu");
      const isOpen = parent.classList.contains("open");

      if (isOpen) {
        parent.classList.remove("open");
        submenu.classList.remove("open");
      } else {
        parent.classList.add("open");
        submenu.classList.add("open");
      }

      // Simpan status ke localStorage
      const expandedMenus = Array.from(document.querySelectorAll(".expandable.open")).map(
        (x) => x.querySelector(".expand-toggle").textContent.trim()
      );
      localStorage.setItem("expandedMenus", JSON.stringify(expandedMenus));
    });
  });

  // Restore expand state
  const storedMenus = JSON.parse(localStorage.getItem("expandedMenus") || "[]");
  storedMenus.forEach((menuText) => {
    expandButtons.forEach((btn) => {
      if (btn.textContent.trim() === menuText) {
        const parent = btn.closest(".expandable");
        const submenu = parent.querySelector(".submenu");
        parent.classList.add("open");
        submenu.classList.add("open");
      }
    });
  });

  // ==========================================================
  // 📱 Sidebar Collapse (Full)
  // ==========================================================
  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");

      if (sidebar.classList.contains("collapsed")) {
        localStorage.setItem("sidebarCollapsed", "true");
      } else {
        localStorage.setItem("sidebarCollapsed", "false");
      }
    });

    // Restore collapsed state
    if (localStorage.getItem("sidebarCollapsed") === "true") {
      sidebar.classList.add("collapsed");
    }
  }

  // ==========================================================
  // 🧭 Active Menu Highlight
  // ==========================================================
  const currentPath = window.location.pathname.split("/").pop();
  activeLinks.forEach((link) => {
    const linkPath = link.getAttribute("href").split("/").pop();
    if (currentPath === linkPath) {
      link.classList.add("active");
      const parentMenu = link.closest(".submenu");
      if (parentMenu) {
        parentMenu.classList.add("open");
        const expandable = parentMenu.closest(".expandable");
        if (expandable) expandable.classList.add("open");
      }
    }
  });

  // ==========================================================
  // 💡 Smooth Sidebar Animation
  // ==========================================================
  sidebar.addEventListener("transitionend", () => {
    document.querySelectorAll(".submenu.open").forEach((el) => {
      el.style.maxHeight = sidebar.classList.contains("collapsed") ? "0" : el.scrollHeight + "px";
    });
  });

  // ==========================================================
  // 🧹 Fallback Prevent Flash (in case dark mode applies late)
  // ==========================================================
  setTimeout(() => {
    body.style.visibility = "visible";
    body.style.opacity = "1";
  }, 100);
});