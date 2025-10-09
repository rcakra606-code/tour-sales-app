// ===========================
// ✅ AUTH HANDLER (Frontend)
// ===========================

// Gunakan dari config.js agar tidak duplikat
const API_BASE_URL = window.APP_CONFIG?.API_BASE_URL || 'http://localhost:3000';

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
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
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

    setTimeout(() => {
      window.location.href = "/dashboard.html";
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
  const isLoginPage = window.location.pathname.endsWith("index.html") || window.location.pathname === "/";

  if (!token && !isLoginPage) {
    window.location.href = "/";
    return false;
  }

  if (token && isLoginPage) {
    window.location.href = "/dashboard.html";
    return false;
  }

  return true;
}

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
