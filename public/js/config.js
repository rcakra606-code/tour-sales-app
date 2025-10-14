// config.js
const API_BASE = "/api";
const TOKEN = localStorage.getItem("token") || null;

function getAuthHeader() {
  return TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {};
}
