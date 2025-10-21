// ==========================================================
// 👤 User Profile v5.3.4
// Update profile & password for logged-in user
// ==========================================================
document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (!token || token === "undefined") return (window.location.href = "/login.html");

  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  document.getElementById("year").textContent = new Date().getFullYear();
  document.getElementById("activeUser").textContent = `${user.staff_name || user.username} (${user.role})`;

  const form = document.getElementById("profileForm");
  const msg = document.getElementById("statusMsg");

  // Load current profile data
  async function loadProfile() {
    try {
      const res = await fetch("/api/profile", { headers });
      const data = await res.json();

      form.username.value = data.username;
      form.staffName.value = data.staff_name;
      form.role.value = data.role;
    } catch (err) {
      console.error("❌ Error load profile:", err);
      msg.textContent = "Gagal memuat data profil.";
    }
  }

  // Update profile
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      staff_name: form.staffName.value,
      newPassword: form.newPassword.value.trim() || undefined,
    };

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers,
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Update gagal");

      msg.textContent = "✅ Profil berhasil diperbarui!";
      msg.style.color = "#28a745";

      // Update cache user
      const updatedUser = { ...user, staff_name: payload.staff_name };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Reset field password
      form.newPassword.value = "";
    } catch (err) {
      console.error("❌ Update error:", err);
      msg.textContent = "Gagal memperbarui profil.";
      msg.style.color = "#dc3545";
    }
  });

  loadProfile();
});