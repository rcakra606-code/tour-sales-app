/* ================================
   🚀 INIT & SIDEBAR GENERATOR
================================ */
function buildSidebar() {
  const sidebar = document.getElementById("sidebar");
  if (!sidebar) return;

  // Bersihkan dulu isi sidebar
  sidebar.innerHTML = "";

  // Daftar menu default (semua role)
  const menuItems = [
    { id: "dashboard", label: "📊 Dashboard", icon: "🏠" },
    { id: "tourDataEntry", label: "✈️ Input Tour", icon: "📝" },
  ];

  // Tambahan menu untuk sales team
  if (["admin", "semiadmin"].includes(currentUser.role)) {
    menuItems.push(
      { id: "salesDashboard", label: "💼 Dashboard Sales", icon: "📈" },
      { id: "salesDataEntry", label: "🧾 Input Sales", icon: "➕" }
    );
  }

  // Menu khusus admin
  if (currentUser.role === "admin") {
    menuItems.push(
      { id: "regionManagement", label: "🌍 Manage Region", icon: "🗺️" },
      { id: "userManagement", label: "👥 Manage User", icon: "⚙️" },
      { id: "changePasswordAdmin", label: "🔑 Ganti Password User", icon: "🔒" }
    );
  }

  // Build element HTML menu
  menuItems.forEach((item) => {
    const btn = document.createElement("button");
    btn.textContent = `${item.icon} ${item.label}`;
    btn.className =
      "w-full text-left px-4 py-2 rounded hover:bg-blue-600 hover:text-white transition font-medium mb-1";
    btn.addEventListener("click", () => {
      showPage(item.id);
      setActiveMenu(item.id);
    });
    sidebar.appendChild(btn);
  });

  // Tombol tema
  const themeBtn = document.createElement("button");
  themeBtn.textContent = "🌗 Toggle Tema";
  themeBtn.className =
    "w-full text-left px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition mt-4";
  themeBtn.addEventListener("click", toggleTheme);
  sidebar.appendChild(themeBtn);
}

function setActiveMenu(activeId) {
  const sidebar = document.getElementById("sidebar");
  sidebar.querySelectorAll("button").forEach((btn) => {
    btn.classList.remove("bg-blue-600", "text-white");
    if (btn.textContent.includes(activeId)) {
      btn.classList.add("bg-blue-600", "text-white");
    }
  });
}

/* ================================
   ✅ BOOT AFTER LOGIN
================================ */
function bootAfterLogin() {
  document.getElementById("userInfo").textContent = currentUser.name;
  document.getElementById("loginPage").classList.add("hidden");
  document.getElementById("mainApp").classList.remove("hidden");

  // Sidebar toggle event
  const sidebar = document.getElementById("sidebar");
  const toggleBtn = document.getElementById("sidebarToggle");
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener("click", () => {
      sidebar.classList.toggle("hidden");
    });
  }

  buildSidebar();
  showPage("dashboard");
  updateCharts();
}
