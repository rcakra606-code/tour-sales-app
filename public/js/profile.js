// ==========================================================
// 👤 Profile Page Logic — v5.3.6
// ==========================================================
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const profileForm = document.getElementById("profileForm");
  const usernameField = document.getElementById("username");
  const staffNameField = document.getElementById("staffName");
  const roleField = document.getElementById("role");
  const userIdField = document.getElementById("userId");
  const createdAtField = document.getElementById("createdAt");

  async function loadProfile() {
    try {
      const res = await fetch("/api/profile", { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal memuat profil");

      usernameField.value = data.username || "-";
      staffNameField.value = data.staff_name || "";
      roleField.value = data.role || "-";
      userIdField.textContent = data.id || "-";
      createdAtField.textContent = data.created_at
        ? new Date(data.created_at).toLocaleString("id-ID")
        : "-";

      document.getElementById("activeUser").textContent =
        `${data.staff_name || data.username} (${data.role})`;
    } catch (err) {
      console.error("❌ loadProfile error:", err);
      alert("Gagal memuat profil");
    }
  }

  profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const staff_name = staffNameField.value.trim();
    const newPassword = document.getElementById("newPassword").value.trim();

    if (!staff_name) return alert("Nama staff wajib diisi");

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers,
        body: JSON.stringify({ staff_name, newPassword }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      alert("✅ Profil berhasil diperbarui");
      loadProfile();
    } catch (err) {
      alert("❌ Gagal memperbarui profil: " + err.message);
    }
  });

  loadProfile();
});