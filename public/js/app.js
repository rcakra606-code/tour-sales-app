// ===============================
// ✅ APP MAIN HANDLER (Frontend)
// ===============================

/**
 * Inisialisasi aplikasi: dipanggil setelah login sukses atau reload dengan session aktif
 */
async function initializeApp() {
  console.log("🟢 initializeApp dijalankan");

  const token = localStorage.getItem("token");
  if (!token) {
    // Token tidak ada → tampilkan login
    localStorage.removeItem("username");
    showPage("loginPage");
    return;
  }

  try {
    toggleLoading(true);

    // Verifikasi token ke backend
    const res = await fetch("/api/auth/verify", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    if (!data.valid) throw new Error("Token tidak valid");

    const username = data.user.username || "User";
    localStorage.setItem("username", username);

    const userInfo = document.getElementById("userInfo");
    if (userInfo) userInfo.textContent = `Selamat datang, ${username}`;

    // Tampilkan menu admin jika role admin
    if (data.user.role === "admin") {
      const salesMenuItems = document.getElementById("salesMenuItems");
      if (salesMenuItems) salesMenuItems.classList.remove("hidden");
    }

    // Load data tours dan sales secara paralel
    await Promise.all([loadTours(), loadSales()]);

    // Tampilkan halaman dashboard
    showPage("dashboard");
  } catch (err) {
    console.error("initializeApp error:", err);
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    showPage("loginPage");
    showErrorToast(err.message || "Sesi berakhir, silakan login ulang");
  } finally {
    toggleLoading(false);
  }
}

// ===============================
// ✅ PAGE NAVIGATION
// ===============================
function showPage(page) {
  const pages = {
    loginPage: "loginPage",
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

// Buat global helper agar bisa dipanggil dari tours.js & sales.js
window.toggleLoading = toggleLoading;
window.showErrorToast = showErrorToast;
window.showSuccessToast = showSuccessToast;

// ===============================
// ✅ LOGOUT HANDLER
// ===============================
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  showPage("loginPage");
}

// ===============================
// ✅ EVENT BINDINGS
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  // Sidebar navigation
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const target = e.currentTarget.getAttribute("onclick") || "";
      const pageMatch = target.match(/showPage\(['"](.+?)['"]\)/);
      if (pageMatch && pageMatch[1]) showPage(pageMatch[1]);
    });
  });

  // Login form
  const loginForm = document.getElementById("loginForm");
  if (loginForm) loginForm.addEventListener("submit", handleLogin);

  // Logout button
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.addEventListener("click", logout);

  // Toast close buttons
  const closeErrorToast = document.getElementById("closeErrorToast");
  if (closeErrorToast)
    closeErrorToast.addEventListener("click", () =>
      document.getElementById("errorToast").classList.add("hidden")
    );
  const closeSuccessToast = document.getElementById("closeSuccessToast");
  if (closeSuccessToast)
    closeSuccessToast.addEventListener("click", () =>
      document.getElementById("successToast").classList.add("hidden")
    );

  // Jika token ada, langsung inisialisasi app
  const token = localStorage.getItem("token");
  if (token) initializeApp();
});
