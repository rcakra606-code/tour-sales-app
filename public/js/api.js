// ✅ Helper Fetch API
window.Api = {
  get: async function(endpoint) {
    const token = localStorage.getItem("token");
    const res = await fetch(`${window.AppConfig.apiBase}${endpoint}`, {
      headers: { "Authorization": token ? `Bearer ${token}` : "" }
    });
    return res.json();
  },

  post: async function(endpoint, data) {
    const token = localStorage.getItem("token");
    const res = await fetch(`${window.AppConfig.apiBase}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : ""
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  put: async function(endpoint, data) {
    const token = localStorage.getItem("token");
    const res = await fetch(`${window.AppConfig.apiBase}${endpoint}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : ""
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  delete: async function(endpoint) {
    const token = localStorage.getItem("token");
    const res = await fetch(`${window.AppConfig.apiBase}${endpoint}`, {
      method: "DELETE",
      headers: { "Authorization": token ? `Bearer ${token}` : "" }
    });
    return res.json();
  }
};
