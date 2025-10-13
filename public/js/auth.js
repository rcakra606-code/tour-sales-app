// auth.js
window.auth = {
  login: async function (username, password) {
    try {
      const data = await window.api.request("/api/auth/login", "POST", { username, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.user.username);
      window.app.initializeApp(); // panggil main app
      window.auth.showSuccess("Login berhasil!");
    } catch (err) {
      window.auth.showError(err.message);
    }
  },

  logout: function () {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    document.getElementById("mainApp").classList.add("hidden");
    document.getElementById("loginPage").classList.remove("hidden");
  },

  showError: function (msg) {
    const toast = document.getElementById("errorToast");
    const msgEl = document.getElementById("errorMessage");
    if (toast && msgEl) {
      msgEl.textContent = msg;
      toast.classList.remove("hidden");
      setTimeout(() => toast.classList.add("hidden"), 4000);
    } else alert(msg);
  },

  showSuccess: function (msg) {
    const toast = document.getElementById("successToast");
    const msgEl = document.getElementById("successMessage");
    if (toast && msgEl) {
      msgEl.textContent = msg;
      toast.classList.remove("hidden");
      setTimeout(() => toast.classList.add("hidden"), 3000);
    } else console.log(msg);
  }
};

// Event listener login form
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  if (form) form.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    window.auth.login(username, password);
  });

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.addEventListener("click", () => window.auth.logout());
});
