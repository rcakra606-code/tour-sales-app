// ==========================================================
// 🚪 Logout JS — Travel Dashboard Enterprise v5.4.9
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  const confirmBox = document.getElementById("logoutConfirm");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      if (confirm("Yakin ingin logout?")) {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userRole");
        localStorage.removeItem("staffName");

        alert("Berhasil logout!");
        window.location.href = "login.html";
      }
    });
  } else {
    // Jika tidak ada tombol logout (misal halaman logout.html)
    localStorage.clear();
    window.location.href = "login.html";
  }
});