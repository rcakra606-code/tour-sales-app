// ===========================
// ✅ AUTH HANDLER (Frontend)
// ===========================

// Deteksi otomatis base URL (Render / local)
const API_BASE = window.APP_CONFIG?.API_BASE_URL || window.location.origin;

// ===========================
// ✅ LOGIN HANDLER
// ===========================
async function handleLogin(event) {
  event.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    showErrorToast("Masukkan username dan password.");
    return;
  }

  toggleLoading(true);

  try {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      showErrorToast(data.message || "Login gagal. Periksa kembali kredensial Anda.");
      return;
    }

    // ✅ Simpan session
    localStorage.setItem("token", data.token);
    localStorage.setItem("username", data.username);

    showSuccessToast("Login berhasil!");

    // ✅ Tampilkan dashboard
    setTimeout(() => {
      const loginPage = document.getElementById("loginPage");
      const mainApp = document.getElementById("mainApp");
      const userInfo = document.getElementById("userInfo");

      if (loginPage) loginPage.classList.add("hidden");
      if (mainApp) mainApp.classList.remove("hidden");

      if (userInfo) userInfo.textContent = `Selamat datang, ${data.username}`;

      // Jalankan inisialisasi dashboard (loadTours & loadSales)
      if (typeof initializeApp === "function") {
        initializeApp();
      } else {
        console.warn("⚠️ initializeApp() belum didefinisikan.");
      }
    }, 700);
  } catch (err) {
    console.error("Login error:", err);
    showErrorToast("Tidak dapat terhubung ke server. Pastikan server berjalan.");
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
  setTimeout(() => window.location.reload(), 500);
}

// ===========================
// ✅ ROUTE PROTECTION
// ===========================
function checkAuth() {
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");

  const loginPage = document.getElementById("loginPage");
  const mainApp = document.getElementById("mainApp");
  const userInfo = document.getElementById("userInfo");

  if (!token) {
    if (mainApp) mainApp.classList.add("hidden");
    if (loginPage) loginPage.classList.remove("hidden");
    return false;
  }

  if (loginPage) loginPage.classList.add("hidden");
  if (mainApp) mainApp.classList.remove("hidden");

  if (userInfo && username) {
    userInfo.textContent = `Selamat datang, ${username}`;
  }

  // Jalankan dashboard init
  if (typeof initializeApp === "function") {
    initializeApp();
  }

  return true;
}

// Jalankan proteksi otomatis saat halaman dimuat
document.addEventListener("DOMContentLoaded", checkAuth);

// ===========================
// ✅ UI HELPERS
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
