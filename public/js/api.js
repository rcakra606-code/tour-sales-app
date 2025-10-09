// ===============================
// ✅ API HANDLER (Frontend)
// ===============================

// Deteksi otomatis base URL (Render vs Local)
const API_BASE = window.location.origin.includes("localhost")
  ? "http://localhost:3000"
  : window.location.origin;

// ===============================
// ✅ API Wrapper
// ===============================
class API {
  static getAuthHeaders() {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  static async request(endpoint, options = {}) {
    const url = `${API_BASE}/api${endpoint}`;
    const config = {
      method: options.method || "GET",
      headers: this.getAuthHeaders(),
      cache: "no-store", // cegah respon 304 cache
      ...options,
    };

    try {
      toggleLoading(true);

      const res = await fetch(url, config);
      const data = await res.json().catch(() => null);

      toggleLoading(false);

      if (!res.ok) {
        switch (res.status) {
          case 401:
            showErrorToast("Sesi telah berakhir, silakan login ulang.");
            logout();
            throw new Error("Unauthorized");
          case 403:
            showErrorToast("Anda tidak memiliki izin akses.");
            throw new Error("Forbidden");
          case 404:
            showErrorToast("Data tidak ditemukan.");
            throw new Error("Not Found");
          default:
            throw new Error(data?.message || "Terjadi kesalahan server.");
        }
      }

      return data;
    } catch (err) {
      toggleLoading(false);
      if (err.name === "TypeError" || err.message.includes("fetch")) {
        showErrorToast("Tidak dapat terhubung ke server.");
      } else {
        console.error("API error:", err.message);
      }
      throw err;
    }
  }

  // ===============================
  // ✅ CRUD Helper Methods
  // ===============================
  static get(ep) {
    return this.request(ep, { method: "GET" });
  }

  static post(ep, body) {
    return this.request(ep, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  static put(ep, body) {
    return this.request(ep, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  static delete(ep) {
    return this.request(ep, { method: "DELETE" });
  }

  // ===============================
  // ✅ Upload Handler
  // ===============================
  static async uploadFile(file) {
    const fd = new FormData();
    fd.append("file", file);

    const token = localStorage.getItem("token");
    const cfg = {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
    };

    try {
      toggleLoading(true);
      const res = await fetch(`${API_BASE}/api/uploads/single`, cfg);
      const data = await res.json();
      toggleLoading(false);

      if (!res.ok) throw new Error(data?.message || "Upload gagal");
      return data;
    } catch (e) {
      toggleLoading(false);
      showErrorToast(e.message || "Upload gagal.");
      throw e;
    }
  }
}

// ===============================
// ✅ Specific API Modules
// ===============================

const AuthAPI = {
  login: (username, password) =>
    API.post("/auth/login", { username, password }),

  getProfile: () => API.get("/auth/profile"),
};

const ToursAPI = {
  getAll: () => API.get("/tours"),
  create: (data) => API.post("/tours", data),
  update: (id, data) => API.put(`/tours/${id}`, data),
  delete: (id) => API.delete(`/tours/${id}`),
};

const SalesAPI = {
  getAll: () => API.get("/sales"),
  create: (data) => API.post("/sales", data),
  update: (id, data) => API.put(`/sales/${id}`, data),
  delete: (id) => API.delete(`/sales/${id}`),
};

// ===============================
// ✅ Optional: Tes koneksi
// ===============================
async function testAPIConnection() {
  try {
    const res = await API.get("/health");
    console.log("Server OK:", res);
  } catch (e) {
    console.warn("Server tidak merespons:", e.message);
  }
}
