// ===============================
// ✅ APP MAIN HANDLER (Frontend)
// ===============================

// Fungsi utama dipanggil setelah login sukses atau reload dengan session aktif
async function initializeApp() {
  console.log("🟢 initializeApp dijalankan");

  const username = localStorage.getItem("username") || "User";
  const userInfo = document.getElementById("userInfo");
  if (userInfo) userInfo.textContent = `Selamat datang, ${username}`;

  // Tampilkan menu khusus admin jika ada hak akses lebih
  const salesMenuItems = document.getElementById("salesMenuItems");
  if (salesMenuItems && username.toLowerCase() === "admin") {
    salesMenuItems.classList.remove("hidden");
  }

  try {
    toggleLoading(true);
    await Promise.all([loadTours(), loadSales()]);
    showPage("dashboard");
  } catch (error) {
    console.error("initializeApp error:", error);
    showErrorToast(error.message || "Gagal memuat data aplikasi");
  } finally {
    toggleLoading(false);
  }
}

// ===============================
// ✅ PAGE NAVIGATION
// ===============================
function showPage(page) {
  const pages = {
    dashboard: "dashboardPage",
    dataEntry: "dataEntryPage",
    salesDashboard: "salesDashboardPage",
    salesDataEntry: "salesDataEntryPage",
  };

  // Sembunyikan semua halaman
  Object.values(pages).forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.classList.add("hidden");
  });

  // Tampilkan halaman yang dipilih
  const current = document.getElementById(pages[page] || "dashboardPage");
  if (current) current.classList.remove("hidden");

  // Update judul halaman
  const pageTitle = document.getElementById("pageTitle");
  if (pageTitle) {
    const titleMap = {
      dashboard: "Dashboard Tour",
      dataEntry: "Input Data Tour",
      salesDashboard: "Dashboard Sales",
      salesDataEntry: "Input Data Sales",
    };
    pageTitle.textContent = titleMap[page] || "Dashboard";
  }

  console.log(`📄 Navigated to page: ${page}`);
}

// ===============================
// ✅ HELPER: Toasts & Loading
// ===============================
function toggleLoading(show) {
  const overlay = document.getElementById("loadingOverlay");
  if (overlay) overlay.classList.toggle("hidden", !show);
}

function showErrorToast(message) {
  const toast = document.getElementById("errorToast");
  const msg = document.getElementById("errorMessage");
  if (toast && msg) {
    msg.textContent = message;
    toast.classList.remove("hidden");
    setTimeout(() => toast.classList.add("hidden"), 4000);
  } else {
    alert(message);
  }
}

function showSuccessToast(message) {
  const toast = document.getElementById("successToast");
  const msg = document.getElementById("successMessage");
  if (toast && msg) {
    msg.textContent = message;
    toast.classList.remove("hidden");
    setTimeout(() => toast.classList.add("hidden"), 3000);
  } else {
    console.log(message);
  }
}

// ===============================
// ✅ HELPER: Sidebar Navigation
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const target = e.currentTarget.getAttribute("onclick") || "";
      const pageMatch = target.match(/showPage\(['"](.+?)['"]\)/);
      if (pageMatch && pageMatch[1]) {
        showPage(pageMatch[1]);
      }
    });
  });

  // Jika user sudah login, langsung tampilkan dashboard
  const token = localStorage.getItem("token");
  if (token) {
    initializeApp();
  }
});
