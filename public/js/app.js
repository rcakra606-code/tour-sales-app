/**
 * public/js/app.js
 * Travel Dashboard Enterprise v3.4.1 (Final)
 *
 * Fitur gabungan:
 * - Verifikasi JWT (/api/auth/verify)
 * - Redirect login <-> dashboard
 * - Global apiFetch() helper dengan Authorization header
 * - Utility: showToast(), formatNumber()
 * - Load current user data, tampilkan nama dan role-aware UI
 * - Global logout handler
 * - Safe behavior jika API down (handle errors)
 *
 * Cara pakai:
 * - Sertakan <script src="/js/app.js"></script> di akhir setiap HTML
 * - Pastikan backend punya endpoint /api/auth/verify yang mengembalikan { ok: true, user: {...} }
 */

(() => {
  "use strict";

  // ---------- Config ----------
  const VERIFY_ENDPOINT = "/api/auth/verify";
  const HEALTH_ENDPOINT = "/api/health";
  const REDIRECT_LOGIN = "/login.html";
  const REDIRECT_DASHBOARD = "/dashboard.html";

  // ---------- Utilities ----------
  function getToken() {
    return localStorage.getItem("token");
  }

  function setToken(token) {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }

  function removeToken() {
    localStorage.removeItem("token");
  }

  function currentPageName() {
    return window.location.pathname.split("/").pop() || "/";
  }

  // small toast helper (non-blocking)
  function showToast(message, opts = {}) {
    const { type = "info", timeout = 3000 } = opts;
    // if a toast container exists, use it; otherwise create minimal
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.style.position = "fixed";
      container.style.right = "20px";
      container.style.bottom = "20px";
      container.style.zIndex = 9999;
      document.body.appendChild(container);
    }
    const el = document.createElement("div");
    el.textContent = message;
    el.style.marginTop = "6px";
    el.style.padding = "10px 14px";
    el.style.borderRadius = "8px";
    el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.12)";
    el.style.background = type === "error" ? "#fee2e2" : type === "success" ? "#dcfce7" : "#eef2ff";
    el.style.color = "#0f172a";
    el.style.fontSize = "13px";
    container.appendChild(el);
    setTimeout(() => {
      el.remove();
      if (!container.hasChildNodes()) container.remove();
    }, timeout);
  }

  // number formatting (ID style)
  function formatNumber(value) {
    if (value == null) return "0";
    const n = Number(value);
    if (Number.isNaN(n)) return value;
    return n.toLocaleString("id-ID");
  }

  // ---------- apiFetch helper ----------
  // wrapper around fetch that adds Authorization header automatically,
  // handles JSON parse, and throws on HTTP errors (with parsed body if any)
  async function apiFetch(path, opts = {}) {
    const token = getToken();
    const headers = Object.assign({}, opts.headers || {});
    if (token) headers["Authorization"] = `Bearer ${token}`;
    if (!headers["Content-Type"] && !(opts.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const cfg = Object.assign({}, opts, { headers });
    try {
      const res = await fetch(path, cfg);
      // try parse JSON if any
      const contentType = res.headers.get("content-type") || "";
      const isJson = contentType.includes("application/json");
      const body = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);
      if (!res.ok) {
        const err = new Error(body && body.error ? body.error : `HTTP ${res.status}`);
        err.status = res.status;
        err.body = body;
        throw err;
      }
      return body;
    } catch (err) {
      // network error or thrown above
      throw err;
    }
  }

  // ---------- Auth verification & bootstrap ----------
  // This function will:
  // - If no token: redirect to login (except on login page)
  // - If token exists: call /api/auth/verify; if invalid: clear token & redirect to login
  // - If valid: set global currentUser and update UI (name, role)
  async function bootstrapAuth() {
    const token = getToken();
    const page = currentPageName();

    // If there's no token: ensure user is on login page
    if (!token) {
      if (page !== "login.html" && page !== "index.html" && page !== "/") {
        // Don't redirect for public assets like css/js; only for pages
        window.location.href = REDIRECT_LOGIN;
      } else if (page === "/" || page === "" || page === "index.html") {
        // root should go to login
        window.location.href = REDIRECT_LOGIN;
      }
      return null;
    }

    // token exists -> verify
    try {
      const data = await apiFetch(VERIFY_ENDPOINT, { method: "GET" });
      // expected: { ok: true, user: { username, name, type } }
      if (!data || !data.ok || !data.user) {
        // invalid token
        removeToken();
        showToast("Sesi tidak valid. Silakan login ulang.", { type: "error" });
        window.location.href = REDIRECT_LOGIN;
        return null;
      }

      // valid token; if on login page, redirect to dashboard
      if (page === "login.html" || page === "index.html" || page === "/") {
        window.location.href = REDIRECT_DASHBOARD;
        // return early; the new page will re-bootstrap
        return null;
      }

      // attach user to window for convenience across other scripts
      window.currentUser = data.user;
      applyUserToUI(data.user);
      return data.user;
    } catch (err) {
      // network error or verify failed
      console.error("Auth verify failed:", err);
      removeToken();
      // If we're already on login page, just display message
      if (page !== "login.html") {
        showToast("Autentikasi gagal. Silakan login ulang.", { type: "error" });
        window.location.href = REDIRECT_LOGIN;
      }
      return null;
    }
  }

  // Apply user info to UI: name display, role-based elements (data-role attributes)
  function applyUserToUI(user) {
    try {
      if (!user) return;
      const nameEl = document.getElementById("userNameDisplay");
      if (nameEl) nameEl.textContent = user.name || user.username;

      // set role-based visibility:
      // any element with data-role="super,semi" etc will be shown only if user's type in list
      const roleEls = document.querySelectorAll("[data-role]");
      roleEls.forEach((el) => {
        const allowed = el.getAttribute("data-role");
        if (!allowed) return;
        const allowedList = allowed.split(",").map((s) => s.trim().toLowerCase());
        const userRole = (user.type || "").toLowerCase();
        if (allowedList.includes(userRole)) {
          el.style.display = ""; // default
        } else {
          el.style.display = "none";
        }
      });
    } catch (e) {
      console.warn("applyUserToUI error:", e);
    }
  }

  // ---------- Global Logout ----------
  function attachLogoutHandlers() {
    const logoutBtns = document.querySelectorAll("[data-logout]");
    logoutBtns.forEach((btn) => {
      btn.addEventListener("click", (ev) => {
        ev.preventDefault();
        // Optionally call backend logout endpoint if you maintain server session (we don't)
        removeToken();
        showToast("Anda telah logout.", { type: "success" });
        setTimeout(() => {
          window.location.href = REDIRECT_LOGIN;
        }, 400);
      });
    });
  }

  // ---------- Healthcheck (optional) ----------
  async function checkHealth() {
    try {
      const res = await fetch(HEALTH_ENDPOINT);
      if (!res.ok) return false;
      return true;
    } catch (e) {
      return false;
    }
  }

  // ---------- Init (run on DOMContentLoaded) ----------
  async function init() {
    // Attach logout handlers early so login page's logout (if any) works
    attachLogoutHandlers();

    // Bootstrap authentication
    await bootstrapAuth();

    // Optional: display small indicator if backend is down
    const healthy = await checkHealth();
    if (!healthy) {
      const banner = document.getElementById("backendStatusBanner");
      if (banner) {
        banner.textContent = "⚠️ Backend tidak tersedia. Beberapa fitur mungkin terbatas.";
        banner.style.display = "";
      } else {
        // silent fallback
        console.warn("Backend healthcheck failed.");
      }
    }
  }

  // Run when DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Expose helpers globally for other scripts to use (dashboard.js, report pages, etc.)
  window.apiFetch = apiFetch;
  window.formatNumber = formatNumber;
  window.showToast = showToast;
  window.getToken = getToken;
  window.setToken = setToken;
  window.removeToken = removeToken;
})();
