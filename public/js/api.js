// ===============================
// ✅ Global API Helper
// ===============================
(() => {
  if (!window.APP_CONFIG) {
    console.error("❌ APP_CONFIG belum diinisialisasi. Pastikan config.js dimuat terlebih dahulu.");
    return;
  }

  const API_BASE_URL = window.APP_CONFIG.API_BASE_URL;

  // ===============================
  // 🔹 Utility: Loading handler
  // ===============================
  function showLoading() {
    const overlay = document.getElementById("loadingOverlay");
    if (overlay) overlay.classList.remove("hidden");
  }

  function hideLoading() {
    const overlay = document.getElementById("loadingOverlay");
    if (overlay) overlay.classList.add("hidden");
  }

  // ===============================
  // 🔹 Utility: Logout & Redirect
  // ===============================
  function forceLogout(reason = "Sesi Anda telah berakhir.") {
    console.warn("🔐 Logout paksa:", reason);
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    if (window.showErrorToast) showErrorToast(reason);
    setTimeout(() => (window.location.href = "/"), 1200);
  }

  // ===============================
  // ✅ Core API Class
  // ===============================
  class API {
    static getAuthHeaders() {
      const token = localStorage.getItem("token");
      return {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      };
    }

    static async request(endpoint, options = {}) {
      const url = `${API_BASE_URL}${endpoint}`;
      const config = {
        headers: this.getAuthHeaders(),
        ...options,
      };

      try {
        showLoading();
        const res = await fetch(url, config);
        const text = await res.text(); // bisa JSON atau error HTML
        hideLoading();

        let data;
        try {
          data = text ? JSON.parse(text) : null;
        } catch {
          console.warn("⚠️ Response bukan JSON:", text);
          data = null;
        }

        // Tangani error response
        if (!res.ok) {
          if (res.status === 401) return forceLogout("Sesi login kedaluwarsa.");
          if (res.status === 403) throw new Error("Anda tidak memiliki akses.");
          if (res.status === 404) throw new Error("Data tidak ditemukan.");
          throw new Error(data?.message || "Terjadi kesalahan pada server.");
        }

        return data;
      } catch (err) {
        hideLoading();
        console.error("API Error:", err);
        if (err.message.includes("fetch") || err.name === "TypeError") {
          throw new Error("Tidak dapat terhubung ke server.");
        }
        throw err;
      }
    }

    static get(ep) {
      return this.request(ep, { method: "GET" });
    }
    static post(ep, body) {
      return this.request(ep, { method: "POST", body: JSON.stringify(body) });
    }
    static put(ep, body) {
      return this.request(ep, { method: "PUT", body: JSON.stringify(body) });
    }
    static delete(ep) {
      return this.request(ep, { method: "DELETE" });
    }

    // Upload file
    static async uploadFile(file) {
      const fd = new FormData();
      fd.append("file", file);
      const token = localStorage.getItem("token");

      const config = {
        method: "POST",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
        body: fd,
      };

      try {
        showLoading();
        const res = await fetch(`${API_BASE_URL}/api/uploads/single`, config);
        const data = await res.json();
        hideLoading();

        if (!res.ok) throw new Error(data.error || "Upload gagal.");
        return data;
      } catch (e) {
        hideLoading();
        throw e;
      }
    }
  }

  // ===============================
  // ✅ API Endpoint Wrappers
  // ===============================
  window.AuthAPI = {
    login: (username, password) => API.post("/api/auth/login", { username, password }),
    profile: () => API.get("/api/auth/profile"),
  };

  window.ToursAPI = {
    getAll: () => API.get("/api/tours"),
    create: (data) => API.post("/api/tours", data),
  };

  window.SalesAPI = {
    getAll: () => API.get("/api/sales"),
    create: (data) => API.post("/api/sales", data),
  };

  window.UploadAPI = {
    upload: (file) => API.uploadFile(file),
  };

  console.log("✅ API module loaded successfully.");
})();
