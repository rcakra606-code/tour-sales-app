// ===========================
// ✅ AUTH HANDLER (Frontend)
// ===========================

// Base API otomatis sesuai environment
const API_BASE_URL = window.APP_CONFIG?.API_BASE_URL || window.location.origin;

// ===========================
// ✅ Login Handler
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
    console.log("➡️ Login API:", `${API_BASE_URL}/api/auth/login`);

    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    // Cek jika bukan JSON valid
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("❌ Response bukan JSON:", text);
      throw new Error("Server mengembalikan respons tidak valid (HTML)");
    }

    if (!response.ok) {
      showErrorToast(data.message || "Login gagal.");
      return;
    }

    // Simpan token & username di localStorage
    localStorage.setItem("token", data.token);
    localStorage.setItem("username", data.username);

    showSuccessToast("Login berhasil!");

    // Delay sedikit agar toast terlihat
    setTimeout(() => {
      window.location.href = "/dashboard.html";
    }, 700);

  } catch (err) {
    console.error("Login error:", err);
    showErrorToast(err.message || "Tidak dapat terhubung ke server.");
  } finally {
    toggleLoading(false);
  }
}

// ===========================
// ✅ Logout Handler
// ===========================
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  showSuccessToast("Berhasil logout!");
  setTimeout(() => (window.location.href = "/"), 700);
}

// ===========================
// ✅ Route Protection
// ===========================
function checkAuth() {
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  const loginPage = document.getElementById("loginPage");
  const mainApp = document.getElementById("mainApp");
  const userInfo = document.getElementById("userInfo");

  if (!token) {
    // Belum login
    if (mainApp) mainApp.classList.add("hidden");
    if (loginPage) loginPage.classList.remove("hidden");
    return false;
  }

  // Sudah login
  if (loginPage) loginPage.classList.add("hidden");
  if (mainApp) mainApp.classList.remove("hidden");
  if (userInfo && username) userInfo.textContent = `Selamat datang, ${username}`;
  return true;
}

// Jalankan proteksi otomatis saat halaman dimuat
document.addEventListener("DOMContentLoaded", checkAuth);

// ===========================
// ✅ Helper UI Functions
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
