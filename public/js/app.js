window.app = {
  initializeApp: async function () {
    const username = localStorage.getItem("username") || "User";
    const userInfo = document.getElementById("userInfo");
    if (userInfo) userInfo.textContent = `Selamat datang, ${username}`;

    try {
      toggleLoading(true);
      await Promise.all([window.tours.loadTours(), window.sales.loadSales?.()]);
    } catch (err) {
      window.auth.showError(err.message || "Gagal memuat data aplikasi");
    } finally {
      toggleLoading(false);
    }
  }
};

function toggleLoading(show) {
  const overlay = document.getElementById("loadingOverlay");
  if (overlay) overlay.classList.toggle("hidden", !show);
}
