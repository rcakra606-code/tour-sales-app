// ===============================
// ✅ Config Global
// ===============================
window.API_BASE = "/api";

window.getToken = function() {
  return localStorage.getItem("token") || "";
};

window.getAuthHeader = function() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
