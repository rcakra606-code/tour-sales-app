// ✅ Auth handlers
window.Auth = {
  login: async function(username, password) {
    return await window.Api.post("/auth/login", { username, password });
  },

  logout: function() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    location.reload();
  },

  isLoggedIn: function() {
    return !!localStorage.getItem("token");
  }
};
