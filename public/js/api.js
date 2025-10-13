// ===============================
// ✅ Helper fetch API
// ===============================
window.apiRequest = async function(endpoint, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeader(),
    ...(options.headers || {}),
  };

  const res = await fetch(API_BASE + endpoint, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Terjadi kesalahan API");
  return data;
};
