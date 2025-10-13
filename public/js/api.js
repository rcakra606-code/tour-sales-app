// ===============================
// ✅ API HELPER
// ===============================
const token = localStorage.getItem("token");
const headers = {
  "Content-Type": "application/json",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
};

async function apiGet(url) {
  const res = await fetch(url, { headers });
  return res.json();
}

async function apiPost(url, data) {
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  return res.json();
}

async function apiPut(url, data) {
  const res = await fetch(url, {
    method: "PUT",
    headers,
    body: JSON.stringify(data),
  });
  return res.json();
}

async function apiDelete(url) {
  const res = await fetch(url, {
    method: "DELETE",
    headers,
  });
  return res.json();
}
