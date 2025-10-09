// ==============================
// ✅ APP INITIALIZATION
// ==============================

async function initializeApp() {
  try {
    // Cek login user
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");

    const userInfo = document.getElementById("userInfo");
    const salesMenu = document.getElementById("salesMenuItems");

    if (!token) {
      console.warn("User belum login. Redirect ke login page.");
      window.location.href = "/";
      return;
    }

    // Tampilkan nama user
    if (userInfo) userInfo.textContent = `Selamat datang, ${username || "User"}`;

    // Menu sales opsional (jika elemen ada)
    if (salesMenu) salesMenu.classList.remove("hidden");

    // Muat data awal (tours & sales)
    if (typeof loadTours === "function") await loadTours();
    if (typeof loadSales === "function") await loadSales();

    // Tampilkan dashboard utama
    showPage("dashboard");
  } catch (err) {
    console.error("Init app error:", err);
    showErrorToast("Gagal memuat aplikasi. Silakan coba lagi.");
  }
}

// ==============================
// ✅ PAGE NAVIGATION CONTROLLER
// ==============================
function showPage(page) {
  const pageMap = {
    dashboard: "dashboardPage",
    dataEntry: "dataEntryPage",
    salesDashboard: "salesDashboardPage",
    salesDataEntry: "salesDataEntryPage",
  };

  Object.values(pageMap).forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.classList.add("hidden");
  });

  const targetId = pageMap[page] || "dashboardPage";
  const target = document.getElementById(targetId);
  if (target) target.classList.remove("hidden");

  const titleEl = document.getElementById("pageTitle");
  if (titleEl) {
    titleEl.textContent = page.charAt(0).toUpperCase() + page.slice(1);
  }
}

// ==============================
// ✅ LOGOUT HANDLER
// ==============================
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  showSuccessToast("Berhasil logout!");
  setTimeout(() => (window.location.href = "/"), 800);
}

// ==============================
// ✅ AUTO INIT
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  // Jika sudah login → inisialisasi dashboard
  if (token) {
    initializeApp();
  } else {
    console.warn("Tidak ada token. Halaman login tetap ditampilkan.");
  }
});
