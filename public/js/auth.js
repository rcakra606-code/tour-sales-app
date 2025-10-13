// ===============================
// ✅ Auth Handling
// ===============================
window.Auth = {
  login: async function(username, password) {
    const res = await Api.request("/auth/login", "POST", { username, password }, false);
    localStorage.setItem(Config.tokenKey, res.token);
    localStorage.setItem(Config.usernameKey, res.username);
    return res;
  },
  logout: function() {
    localStorage.removeItem(Config.tokenKey);
    localStorage.removeItem(Config.usernameKey);
    window.location.reload();
  }
};

// Form binding
document.addEventListener("DOMContentLoaded", function() {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value.trim();
      try {
        window.App.toggleLoading(true);
        await window.Auth.login(username, password);
        window.App.initializeApp();
      } catch (err) {
        window.App.showErrorToast(err.message);
      } finally {
        window.App.toggleLoading(false);
      }
    });
  }

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.addEventListener("click", () => window.Auth.logout());
});
