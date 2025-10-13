// ===============================
// ✅ App Main Handler (Frontend SPA)
// ===============================
function initializeApp() {
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username") || "User";
  const role = localStorage.getItem("role") || "staff";

  if (!token) return showPage("login");

  document.getElementById("loginPage").classList.add("hidden");
  document.getElementById("mainApp").classList.remove("hidden");

  // tampilkan info user
  const userInfo = document.getElementById("userInfo");
  if (userInfo) userInfo.textContent = `Selamat datang, ${username} (${role})`;

  // load data SPA
  toggleLoading(true);
  Promise.all([loadTours(), loadSales()])
    .catch(err => showErrorToast(err.message || "Gagal memuat data"))
    .finally(() => toggleLoading(false));

  // menu admin-only
  const salesMenu = document.getElementById("salesMenuItems");
  if (salesMenu) salesMenu.classList.toggle("hidden", role !== "admin");
}

// ===============================
// ✅ Page Navigation
// ===============================
function showPage(page) {
  const pages = {
    login: "loginPage",
    dashboard: "mainApp"
  };
  Object.values(pages).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add("hidden");
  });
  const current = document.getElementById(pages[page]);
  if (current) current.classList.remove("hidden");
}

// ===============================
// ✅ Helper: Toast & Loading
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
// ✅ Auto Init SPA on Load
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("token")) {
    initializeApp();
  }
});
