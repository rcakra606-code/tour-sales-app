// ==========================================================
// 🔐 Login Handler v5.3.4
// Safe login flow with redirect & token storage
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const errorMsg = document.getElementById("errorMsg");
  const year = document.getElementById("year");
  year.textContent = new Date().getFullYear();

  // Jika user sudah login sebelumnya, langsung redirect
  const existingToken = localStorage.getItem("token");
  const validToken =
    existingToken &&
    existingToken !== "undefined" &&
    existingToken !== "null" &&
    existingToken.trim().length > 20;

  if (validToken) {
    console.log("✅ Token masih valid, redirect ke dashboard...");
    window.location.href = "/dashboard.html";
    return;
  }

  // Handle form login
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorMsg.textContent = "";

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
      errorMsg.textContent = "Username dan password wajib diisi.";
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const err = await res.json();
        errorMsg.textContent = err.message || "Login gagal, periksa kembali.";
        return;
      }

      const data = await res.json();
      if (!data.token) {
        errorMsg.textContent = "Gagal mendapatkan token autentikasi.";
        return;
      }

      // Simpan token & user info
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      console.log("✅ Login berhasil. Mengarahkan ke dashboard...");
      window.location.href = "/dashboard.html";
    } catch (err) {
      console.error("❌ Error login:", err);
      errorMsg.textContent = "Gagal terhubung ke server.";
    }
  });
});