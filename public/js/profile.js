// ==========================================================
// 👤 Profile Page — Travel Dashboard Enterprise v5.4.9
// ==========================================================

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) return (window.location.href = "login.html");

  const usernameField = document.getElementById("username");
  const staffField = document.getElementById("staff_name");
  const roleField = document.getElementById("role");
  const profileMsg = document.getElementById("profileMsg");
  const passwordMsg = document.getElementById("passwordMsg");

  // ===== GET PROFILE INFO =====
  async function loadProfile() {
    try {
      const res = await fetch("/api/profile", {
        headers: { Authorization: "Bearer " + token }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      usernameField.value = data.username;
      staffField.value = data.staff_name || "";
      roleField.value = data.role;
    } catch (err) {
      console.error("❌ Load profile error:", err);
      profileMsg.textContent = "Gagal memuat data profil.";
    }
  }

  await loadProfile();

  // ===== UPDATE PROFILE =====
  document.getElementById("profileForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    profileMsg.textContent = "";

    const staff_name = staffField.value.trim();
    if (!staff_name) return (profileMsg.textContent = "Nama staff wajib diisi.");

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Authorization": "Bearer " + token,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ staff_name })
      });

      const data = await res.json();
      profileMsg.textContent = data.message || (res.ok ? "Profil berhasil diperbarui." : "Gagal memperbarui profil.");

      if (res.ok) {
        localStorage.setItem("staff_name", staff_name);
      }
    } catch (err) {
      console.error("❌ Update profile error:", err);
      profileMsg.textContent = "Terjadi kesalahan saat memperbarui profil.";
    }
  });

  // ===== UPDATE PASSWORD =====
  document.getElementById("passwordForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    passwordMsg.textContent = "";

    const old_password = document.getElementById("old_password").value.trim();
    const new_password = document.getElementById("new_password").value.trim();

    if (!old_password || !new_password)
      return (passwordMsg.textContent = "Lengkapi kedua kolom password.");

    try {
      const res = await fetch("/api/profile/password", {
        method: "PUT",
        headers: {
          "Authorization": "Bearer " + token,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ old_password, new_password })
      });

      const data = await res.json();
      passwordMsg.textContent = data.message || (res.ok ? "Password berhasil diubah." : "Gagal mengubah password.");

      if (res.ok) {
        document.getElementById("old_password").value = "";
        document.getElementById("new_password").value = "";
      }
    } catch (err) {
      console.error("❌ Update password error:", err);
      passwordMsg.textContent = "Terjadi kesalahan saat mengubah password.";
    }
  });
});