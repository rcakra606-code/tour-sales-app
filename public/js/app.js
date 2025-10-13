// ===============================
// ✅ App Main Handler
// ===============================
window.initializeApp = async function() {
  const username = localStorage.getItem("username") || "User";
  const userInfo = document.getElementById("userInfo");
  if (userInfo) userInfo.textContent = `Selamat datang, ${username}`;

  try {
    toggleLoading(true);
    await Promise.all([loadTours(), loadSales()]);
    showPage("dashboard");
  } catch (err) {
    showErrorToast(err.message);
  } finally {
    toggleLoading(false);
  }
};

window.showPage = function(page) {
  const pages = ["dashboardPage", "dataEntryPage", "salesDashboardPage", "salesDataEntryPage"];
  pages.forEach((id) => document.getElementById(id)?.classList.add("hidden"));
  const current = document.getElementById(page + "Page") || document.getElementById("dashboardPage");
  current?.classList.remove("hidden");
};

window.toggleLoading = function(show) {
  const overlay = document.getElementById("loadingOverlay");
  overlay?.classList.toggle("hidden", !show);
};

window.showErrorToast = function(message) {
  const toast = document.getElementById("errorToast");
  const msg = document.getElementById("errorMessage");
  if (toast && msg) {
    msg.textContent = message;
    toast.classList.remove("hidden");
    setTimeout(() => toast.classList.add("hidden"), 4000);
  } else {
    alert(message);
  }
};

window.showSuccessToast = function(message) {
  const toast = document.getElementById("successToast");
  const msg = document.getElementById("successMessage");
  if (toast && msg) {
    msg.textContent = message;
    toast.classList.remove("hidden");
    setTimeout(() => toast.classList.add("hidden"), 3000);
  } else {
    console.log(message);
  }
};

// Auto initialize if token exists
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("token")) initializeApp();
});
