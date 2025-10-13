const API_URL = "/api";

function getToken() {
  return localStorage.getItem("token");
}

function getAuthHeaders() {
  const token = getToken();
  return token ? { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
}

async function apiGet(endpoint) {
  const res = await fetch(`${API_URL}${endpoint}`, { headers: getAuthHeaders() });
  return res.json();
}

async function apiPost(endpoint, data) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

async function apiPut(endpoint, data) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

async function apiDelete(endpoint) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return res.json();
}
