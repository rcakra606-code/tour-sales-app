// api.js
async function request(endpoint, method = "GET", body = null) {
  const options = {
    method,
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${API_BASE}${endpoint}`, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Terjadi kesalahan API");
  return data;
}
