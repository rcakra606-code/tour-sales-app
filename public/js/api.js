// public/js/api.js
const API_BASE_URL = "/api";

// Ambil token dari localStorage
function getToken() {
  return localStorage.getItem("token");
}

// Helper untuk memanggil API
async function apiRequest(endpoint, method = "GET", body = null, requiresAuth = true) {
  const headers = { "Content-Type": "application/json" };

  if (requiresAuth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${API_BASE_URL}${endpoint}`, options);

  // Jika token invalid → logout otomatis
  if (res.status === 401 || res.status === 403) {
    console.warn("Unauthorized, logging out...");
    localStorage.removeItem("token");
    window.location.href = "/index.html";
    return null;
  }

  try {
    return await res.json();
  } catch (err) {
    console.error("Failed to parse JSON:", err);
    return null;
  }
}

// Ekspor helper API
window.api = {
  get: (endpoint, auth = true) => apiRequest(endpoint, "GET", null, auth),
  post: (endpoint, body, auth = true) => apiRequest(endpoint, "POST", body, auth),
  put: (endpoint, body, auth = true) => apiRequest(endpoint, "PUT", body, auth),
  del: (endpoint, auth = true) => apiRequest(endpoint, "DELETE", null, auth),
};
