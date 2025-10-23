// ==========================================================
// 🔑 Login JS — Travel Dashboard Enterprise v5.4.9
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const msgEl = document.getElementById("loginMessage");

  // Jika sudah login, langsung ke dashboard
  const token = localStorage.getItem("token");
  if (token) return (window.location.href = "dashboard.html");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
      msgEl.textContent = "Masukkan username dan password.";
      msgEl.style.color = "red";
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        msgEl.textContent = data.message || "Login gagal.";
        msgEl.style.color = "red";
        return;
      }

      // Simpan token di localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("userRole", data.user.role);
      localStorage.setItem("staffName", data.user.staff_name);

      msgEl.textContent = "Login berhasil! Mengarahkan...";
      msgEl.style.color = "green";

      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1000);
    } catch (err) {
      console.error("❌ Login error:", err);
      msgEl.textContent = "Terjadi kesalahan server.";
      msgEl.style.color = "red";
    }
  });
});