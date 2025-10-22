// ==========================================================
// 🔐 Login Controller — Travel Dashboard Enterprise v5.4.6
// ==========================================================
// Fitur:
// - Validasi login ke API /api/auth/login
// - Simpan token JWT + data user
// - Redirect otomatis sesuai role
// - Mode siang/malam tersimpan global
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const form = document.getElementById("loginForm");
  const errorMsg = document.getElementById("errorMsg");
  const themeSwitch = document.getElementById("themeSwitch");

  // ======================================================
  // 🌞🌙 THEME INIT
  // ======================================================
  const currentTheme = localStorage.getItem("theme") || "light";
  if (currentTheme === "dark") {
    body.classList.remove("light-mode");
    body.classList.add("dark-mode");
    if (themeSwitch) themeSwitch.checked = true;
  }
  if (themeSwitch) {
    themeSwitch.addEventListener("change", () => {
      if (themeSwitch.checked) {
        body.classList.add("dark-mode");
        body.classList.remove("light-mode");
        localStorage.setItem("theme", "dark");
      } else {
        body.classList.add("light-mode");
        body.classList.remove("dark-mode");
        localStorage.setItem("theme", "light");
      }
    });
  }

  // ======================================================
  // 🧩 LOGIN HANDLER
  // ======================================================
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorMsg.textContent = "";

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
      errorMsg.textContent = "Harap isi username dan password.";
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const err = await response.json();
        errorMsg.textContent = err.message || "Login gagal, periksa kembali.";
        return;
      }

      const data = await response.json();

      // Simpan data login ke localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);
      localStorage.setItem("role", data.role);
      localStorage.setItem("staff_name", data.staff_name || "");

      // Redirect berdasarkan role
      if (data.role === "admin" || data.role === "semiadmin") {
        window.location.href = "dashboard.html";
      } else {
        window.location.href = "dashboard.html"; // staff tetap ke dashboard, view akan disesuaikan
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      errorMsg.textContent = "Terjadi kesalahan koneksi ke server.";
    }
  });
});