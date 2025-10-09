// ===========================
// ✅ AUTH HANDLER (Frontend)
// ===========================

// Pastikan API_BASE_URL dari config.js sudah tersedia
const API_BASE_URL = window.APP_CONFIG?.API_BASE_URL || window.location.origin;

// ===========================
// ✅ LOGIN HANDLER
// ===========================
async function handleLogin(event) {
  event.preventDefault();

  const username = document.getElementById("username")?.value.trim();
  const password = document.getElementById("password")?.value.trim();

  if (!username || !password) {
    showErrorToast("Masukkan username dan password.");
    return;
  }

  toggleLoading(true);
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      showErrorToast(data.message || "Login gagal. Periksa kembali data Anda.");
      return;
    }

    // Simpan token & username ke localStorage
    localStorage.setItem("token", data.token);
    localStorage.setItem("username", data.username);

    showSuccessToast("Login berhasil!");

    // Tunggu sebentar untuk efek transisi
    setTimeout(() => {
      window.location.reload();
    }, 800);
  } catch (err) {
    console.error("Login error:", err);
    showErrorToast("Gagal terhubung ke server. Pastikan koneksi Anda stabil.");
  } finally {
    toggleLoading(false);
  }
}

// ===========================
// ✅ LOGOUT HANDLER
// ===========================
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("username");

  showSuccessToast("Berhasil logout!");
  setTimeout(() => {
    window.location.href = "/";
  }, 700);
}

// ===========================
// ✅ ROUTE PROTECTION
// ===========================
function checkAuth() {
  const token = localStorage.getItem("token");
  const loginPage = document.getElementById("loginPage");
  const mainApp = document.getElementById("mainApp");
  const userInfo = document.getElementById("userInfo");

  if (!token) {
    // Belum login → tampilkan login page
    if (mainApp) mainApp.classList.add("hidden");
    if (loginPage) loginPage.classList.remove("hidden");
    return false;
  }

  // Sudah login → tampilkan dashboard
  if (loginPage) loginPage.classList.add("hidden");
  if (mainApp) mainApp.classList.remove("hidden");

  if (userInfo) {
    const username = localStorage.getItem("username") || "User";
    userInfo.textContent = `Selamat datang, ${username}`;
  }

  return true;
}

document.addEventListener("DOMContentLoaded", checkAuth);

// ===========================
// ✅ HELPER UI FUNCTION
// ===========================
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
