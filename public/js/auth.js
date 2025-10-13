// public/js/auth.js
import { apiPost } from "./api.js";

const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginPage = document.getElementById("loginPage");
const mainApp = document.getElementById("mainApp");
const userInfo = document.getElementById("userInfo");

const successToast = document.getElementById("successToast");
const successMessage = document.getElementById("successMessage");
const errorToast = document.getElementById("errorToast");
const errorMessage = document.getElementById("errorMessage");

// =====================
// ✅ Show Toast
// =====================
function showToast(msg, type = "success") {
  if (type === "error") {
    errorMessage.textContent = msg;
    errorToast.classList.remove("hidden");
    setTimeout(() => errorToast.classList.add("hidden"), 3000);
  } else {
    successMessage.textContent = msg;
    successToast.classList.remove("hidden");
    setTimeout(() => successToast.classList.add("hidden"), 3000);
  }
}

// =====================
// ✅ Login
// =====================
async function handleLogin(e) {
  e.preventDefault();
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (!username || !password) return showToast("Username & Password wajib diisi", "error");

  try {
    const data = await apiPost("/auth/login", { username, password });
    if (data.success) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.user.username);
      loginPage.classList.add("hidden");
      mainApp.classList.remove("hidden");
      userInfo.textContent = `Selamat datang, ${data.user.username}`;
      showToast("Login berhasil");
    } else {
      showToast(data.message || "Login gagal", "error");
    }
  } catch (err) {
    showToast("Terjadi kesalahan server", "error");
  }
}

if (loginForm) loginForm.addEventListener("submit", handleLogin);

// =====================
// ✅ Logout
// =====================
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    mainApp.classList.add("hidden");
    loginPage.classList.remove("hidden");
  });
}
