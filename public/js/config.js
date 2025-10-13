// ===============================
// ✅ Config dasar
// ===============================
const API_BASE = "/api"; // bisa ganti jika di deploy berbeda

function getToken() {
  return localStorage.getItem("token");
}

function setToken(token) {
  localStorage.setItem("token", token);
}

function removeToken() {
  localStorage.removeItem("token");
}

export { API_BASE, getToken, setToken, removeToken };
