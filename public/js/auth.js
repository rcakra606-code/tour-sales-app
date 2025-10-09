// =============================================
// ✅ AUTH HANDLER (Frontend)
// =============================================
(() => {
  if (!window.APP_CONFIG) {
    console.error("❌ APP_CONFIG belum dimuat. Pastikan config.js disertakan lebih dulu.");
    return;
  }

  const API_BASE = window.APP_CONFIG.API_BASE_URL;

  // ============================
  // 🔹 Login Handler
  // ============================
  async function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById("username")?.value.trim();
    const password = document.getElementById("password")?.value.trim();

    if (!username || !password) {
      showErrorToast("Masukkan username dan password.");
      return;
    }

    try {
      toggleLoading(true);
      const res = await AuthAPI.login(username, password);

      if (!res || !res.token) {
        showErrorToast("Login gagal. Periksa kembali username & password.");
        return;
      }

      // Simpan data ke localStorage
      localStorage.setItem("token", res.token);
      localStorage.setItem("username", res.username || username);

      showSuccessToast("Login berhasil!");
      setTimeout(() => {
        window.location.href = "/dashboard.html";
      }, 800);
    } catch (err) {
      console.error("Login error:", err);
      showErrorToast(err.message || "Gagal login. Coba lagi.");
    } finally {
      toggleLoading(false);
    }
  }

  // ============================
  // 🔹 Logout Handler
  // ============================
  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    showSuccessToast("Berhasil logout.");
    setTimeout(() => (window.location.href = "/"), 600);
  }

  // ============================
  // 🔹 Route Protection
  // ============================
  function checkAuth() {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    const isLoginPage =
      window.location.pathname === "/" ||
      window.location.pathname.endsWith("index.html");

    if (!token && !isLoginPage) {
      console.warn("🔒 Tidak ada token — redirect ke halaman login");
      window.location.href = "/";
      return false;
    }

    if (token && isLoginPage) {
      console.log("🔑 Sudah login — redirect ke dashboard");
      window.location.href = "/dashboard.html";
      return false;
    }

    // Tampilkan nama user bila di halaman dashboard
    const userInfo = document.getElementById("userInfo");
    if (token && username && userInfo) {
      userInfo.textContent = `Selamat datang, ${username}`;
    }

    return true;
  }

  // Jalankan proteksi saat halaman dimuat
  document.addEventListener("DOMContentLoaded", () => {
    checkAuth();

    const form = document.getElementById("loginForm");
    const logoutBtn = document.getElementById("logoutBtn");

    if (form) form.addEventListener("submit", handleLogin);
    if (logoutBtn) logoutBtn.addEventListener("click", logout);
  });

  // ============================
  // 🔹 Helper Functions
  // ============================
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

  // Ekspor ke global agar bisa dipakai file lain
  window.handleLogin = handleLogin;
  window.logout = logout;
  window.checkAuth = checkAuth;

  console.log("✅ Auth module loaded successfully");
})();
