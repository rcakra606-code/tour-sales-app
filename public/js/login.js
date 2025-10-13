// public/js/login.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  if (!form) return console.error("Login form not found!");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
      alert("Username dan password wajib diisi!");
      return;
    }

    try {
      // 🔹 Kirim request login
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.token) {
        alert(data.error || "Login gagal. Periksa kembali username/password Anda.");
        return;
      }

      // 🔹 Simpan token JWT ke localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", username);

      // 🔹 Redirect ke dashboard/tours
      alert("Login berhasil! Anda akan diarahkan ke dashboard.");
      window.location.href = "/dashboard.html";
    } catch (err) {
      console.error("Error saat login:", err);
      alert("Terjadi kesalahan koneksi ke server.");
    }
  });
});
