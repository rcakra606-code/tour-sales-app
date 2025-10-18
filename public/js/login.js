/**
 * ==========================================================
 * public/js/login.js — Travel Dashboard Enterprise v3.4.1
 * ==========================================================
 * ✅ Tangani submit form login
 * ✅ Kirim request ke /api/auth/login
 * ✅ Simpan token JWT ke localStorage
 * ✅ Integrasi penuh dengan app.js (redirect otomatis)
 * ✅ Pesan error / sukses tampil dinamis
 * ==========================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const msg = document.getElementById("loginMessage");

  if (!form) {
    console.warn("⚠️ Login form tidak ditemukan di halaman.");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
      msg.textContent = "⚠️ Username dan password wajib diisi.";
      msg.classList.add("text-red-600");
      return;
    }

    msg.textContent = "⏳ Sedang memproses login...";
    msg.classList.remove("text-red-600");
    msg.classList.add("text-gray-600");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        msg.textContent = data.error || "Login gagal. Periksa username dan password.";
        msg.classList.add("text-red-600");
        return;
      }

      if (!data.token) {
        msg.textContent = "Server tidak mengembalikan token login.";
        msg.classList.add("text-red-600");
        return;
      }

      // Simpan token di localStorage (digunakan app.js)
      localStorage.setItem("token", data.token);

      msg.textContent = "✅ Login berhasil! Mengarahkan ke dashboard...";
      msg.classList.remove("text-red-600");
      msg.classList.add("text-green-600");

      setTimeout(() => {
        window.location.href = "/dashboard.html";
      }, 800);
    } catch (err) {
      console.error("❌ Login error:", err);
      msg.textContent = "Terjadi kesalahan koneksi ke server.";
      msg.classList.add("text-red-600");
    }
  });
});
