// ===========================
// ✅ AUTH HANDLER (Frontend)
// ===========================

// Deteksi otomatis base URL (Render vs local)
const API_BASE = window.location.origin.includes("localhost")
  ? "http://localhost:3000"
  : window.location.origin;

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
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      showErrorToast(data.message || "Login gagal.");
      return;
    }

    // Simpan token & username di localStorage
    localStorage.setItem("token", data.token);
    localStorage.setItem("username", data.username);

    showSuccessToast("Login berhasil!");

    // Delay sedikit agar toast tampil
    setTimeout(() => {
      window.location.reload();
    }, 700);
  } catch (err) {
    console.error("Login error:", err);
    showErrorToast("Tidak dapat terhubung ke server.");
  } finally {
    toggleLoading(false);
  }
}

// ===========================
// ✅ Logout
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

  // Jika belum login → tampilkan form login
  if (!token) {
    if (mainApp) mainApp.classList.add("hidden");
    if (loginPage) loginPage.classList.remove("hidden");
    return false;
  }

  // Jika sudah login → tampilkan dashboard
  if (loginPage) loginPage.classList.add("hidden");
  if (mainApp) mainApp.classList.remove("hidden");

  if (userInfo && username) {
    userInfo.textContent = `Selamat datang, ${username}`;
  }

  return true;
}

// Jalankan proteksi otomatis saat halaman dimuat
document.addEventListener("DOMContentLoaded", checkAuth);

// ===========================
// ✅ Helper UI
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
