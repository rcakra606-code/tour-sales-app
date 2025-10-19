/**
 * ==========================================================
 * 📁 public/js/profile.js
 * Travel Dashboard Enterprise v5.0
 * ==========================================================
 * Fitur:
 * - Menampilkan data user aktif
 * - Ganti password
 * ==========================================================
 */

const usernameEl = document.getElementById("username");
const staffNameEl = document.getElementById("staffName");
const roleEl = document.getElementById("role");
const createdAtEl = document.getElementById("createdAt");
const passwordForm = document.getElementById("passwordForm");
const yearSpan = document.getElementById("year");
if (yearSpan) yearSpan.textContent = new Date().getFullYear();

// ===== LOAD PROFILE =====
async function loadProfile() {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Sesi login berakhir. Silakan login ulang.");
      window.location.href = "/login.html";
      return;
    }

    const res = await fetch("/api/profile/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Gagal memuat profil user.");

    const data = await res.json();
    usernameEl.textContent = data.username || "—";
    staffNameEl.textContent = data.staff_name || "—";
    roleEl.textContent = data.role || "—";
    createdAtEl.textContent = formatDate(data.created_at);
  } catch (err) {
    console.error("❌", err.message);
    alert("Gagal memuat profil.");
  }
}

// ===== CHANGE PASSWORD =====
passwordForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = Object.fromEntries(new FormData(passwordForm).entries());

  if (formData.newPassword !== formData.confirmPassword) {
    return alert("❌ Password baru dan konfirmasi tidak sama!");
  }

  try {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/profile/password", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      }),
    });

    if (!res.ok) throw new Error("Gagal memperbarui password.");

    alert("✅ Password berhasil diubah!");
    passwordForm.reset();
  } catch (err) {
    console.error(err);
    alert("❌ Terjadi kesalahan saat mengubah password.");
  }
});

// ===== HELPERS =====
function formatDate(d) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ===== INIT =====
loadProfile();