// ===============================
// ✅ Main App Handler
// ===============================
window.App = {
  init: function() {
    this.loginPage = document.getElementById("loginPage");
    this.mainApp = document.getElementById("mainApp");
    this.userInfo = document.getElementById("userInfo");

    document.getElementById("closeErrorToast")?.addEventListener("click", () => this.hideToast("error"));
    document.getElementById("closeSuccessToast")?.addEventListener("click", () => this.hideToast("success"));

    const token = localStorage.getItem(Config.tokenKey);
    if (token) this.initializeApp();
  },

  initializeApp: async function() {
    const username = localStorage.getItem(Config.usernameKey) || "User";
    this.userInfo.textContent = `Selamat datang, ${username}`;
    this.loginPage.classList.add("hidden");
    this.mainApp.classList.remove("hidden");

    try {
      this.toggleLoading(true);
      await Promise.all([window.Tours.loadTours(), window.Sales.loadSales()]);
    } catch(err) {
      this.showErrorToast(err.message);
    } finally {
      this.toggleLoading(false);
    }
  },

  toggleLoading: function(show) {
    const overlay = document.getElementById("loadingOverlay");
    if (overlay) overlay.classList.toggle("hidden", !show);
  },

  showErrorToast: function(msg) {
    const toast = document.getElementById("errorToast");
    const msgEl = document.getElementById("errorMessage");
    if (toast && msgEl) {
      msgEl.textContent = msg;
      toast.classList.remove("hidden");
      setTimeout(() => toast.classList.add("hidden"), 4000);
    } else alert(msg);
  },

  showSuccessToast: function(msg) {
    const toast = document.getElementById("successToast");
    const msgEl = document.getElementById("successMessage");
    if (toast && msgEl) {
      msgEl.textContent = msg;
      toast.classList.remove("hidden");
      setTimeout(() => toast.classList.add("hidden"), 3000);
    } else console.log(msg);
  },

  hideToast: function(type) {
    if (type === "error") document.getElementById("errorToast")?.classList.add("hidden");
    if (type === "success") document.getElementById("successToast")?.classList.add("hidden");
  },

  showPage: function(page) {
    const pages = { tours: "toursPage", sales: "salesPage" };
    Object.values(pages).forEach(id => document.getElementById(id)?.classList.add("hidden"));
    document.getElementById(pages[page])?.classList.remove("hidden");
  }
};
