// ===============================
// ✅ API Helper (CSP-Safe)
// ===============================
window.Api = {
  request: async function (endpoint, method = "GET", data = null, auth = true) {
    const headers = { "Content-Type": "application/json" };
    if (auth) {
      const token = localStorage.getItem(Config.tokenKey);
      if (token) headers["Authorization"] = "Bearer " + token;
    }

    const options = { method, headers };
    if (data) options.body = JSON.stringify(data);

    const response = await fetch(Config.apiBase + endpoint, options);
    const json = await response.json();
    if (!response.ok) throw new Error(json.message || "Terjadi kesalahan API");
    return json;
  }
};
