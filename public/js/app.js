/* ================================
   🌐 GLOBAL CONFIG
================================= */
const API_BASE = window.location.origin + "/api";
let token = localStorage.getItem("token") || null;
let currentUser = JSON.parse(localStorage.getItem("user") || "null");
let charts = { sales: null, region: null, daily: null };

/* ================================
   ⚙️ HELPER UI
================================= */
function showLoading(show = true) {
  const el = document.getElementById("loadingOverlay");
  if (el) el.classList.toggle("hidden", !show);
}
function showError(msg) {
  const el = document.getElementById("errorToast");
  if (!el) return alert(msg);
  el.textContent = msg;
  el.classList.remove("hidden");
  setTimeout(() => el.classList.add("hidden"), 4000);
}
function showSuccess(msg) {
  const el = document.getElementById("successToast");
  if (!el) return alert(msg);
  el.textContent = msg;
  el.classList.remove("hidden");
  setTimeout(() => el.classList.add("hidden"), 3000);
}

/* ================================
   📡 API FETCH
================================= */
async function apiFetch(path, opts = {}) {
  opts.headers = opts.headers || {};
  if (!opts.headers["Content-Type"] && !(opts.body instanceof FormData))
    opts.headers["Content-Type"] = "application/json";
  if (token) opts.headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(API_BASE + path, opts);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw json;
  return json;
}

/* ================================
   🔐 AUTH
================================= */
async function handleLogin(e) {
  e.preventDefault();
  showLoading(true);
  const username = document.getElementById("username")?.value.trim();
  const password = document.getElementById("password")?.value;

  try {
    const res = await fetch(API_BASE + "/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) return showError(data.message || "Login gagal");

    token = data.token;
    currentUser = data.user;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(currentUser));
    bootAfterLogin();
  } catch (err) {
    showError("Terjadi kesalahan saat login");
  } finally {
    showLoading(false);
  }
}

function logout() {
  token = null;
  currentUser = null;
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  document.getElementById("mainApp")?.classList.add("hidden");
  document.getElementById("loginPage")?.classList.remove("hidden");
}

/* ================================
   🚀 BOOT AFTER LOGIN
================================= */
function bootAfterLogin() {
  document.getElementById("loginPage")?.classList.add("hidden");
  document.getElementById("mainApp")?.classList.remove("hidden");
  buildSidebar();
  updateCharts();
  showSuccess(`Selamat datang, ${currentUser.name}`);
}

/* ================================
   🧱 SIDEBAR
================================= */
function buildSidebar() {
  const sidebar = document.getElementById("sidebar");
  if (!sidebar) return;
  sidebar.classList.remove("hidden");

  // tampilkan menu khusus admin
  if (currentUser.type === "super") {
    const usersBtn = document.createElement("button");
    usersBtn.textContent = "👥 Manage Users";
    usersBtn.className = "w-full text-left px-4 py-2 rounded hover:bg-blue-100 dark:hover:bg-gray-700";
    usersBtn.onclick = () => showPage("users");
    sidebar.querySelector("nav").appendChild(usersBtn);
  }
}

/* ================================
   🌗 THEME
================================= */
function toggleTheme() {
  const html = document.documentElement;
  const dark = html.classList.toggle("dark");
  localStorage.setItem("theme", dark ? "dark" : "light");
}
if (localStorage.getItem("theme") === "dark") {
  document.documentElement.classList.add("dark");
}

/* ================================
   🧭 NAVIGATION
================================= */
function showPage(pageId) {
  document.querySelectorAll(".page-section").forEach((el) => el.classList.add("hidden"));
  const section = document.getElementById(pageId + "Page");
  if (section) section.classList.remove("hidden");

  if (pageId === "dashboard") updateCharts();
  if (pageId === "regionManagement") initRegionManagement();
  if (pageId === "users") loadUserList();
}

/* ================================
   📊 DASHBOARD
================================= */
async function updateCharts() {
  try {
    const summary = await apiFetch("/dashboard/summary");
    document.getElementById("totalSales").textContent = `Rp ${Number(summary.totalSales || 0).toLocaleString()}`;
    document.getElementById("totalProfit").textContent = `Rp ${Number(summary.totalProfit || 0).toLocaleString()}`;
    document.getElementById("totalRegistrants").textContent = summary.totalRegistrants || 0;
    document.getElementById("totalPax").textContent = summary.totalPax || 0;

    const chartsData = await apiFetch("/dashboard/charts");
    renderSalesChart(chartsData.staffRows || []);
    renderRegionChart(chartsData.regionRows || []);
  } catch (err) {
    showError("Gagal memuat data dashboard");
  }
}

/* Charts */
function renderSalesChart(rows) {
  const ctx = document.getElementById("salesChart").getContext("2d");
  const labels = rows.map(r => r.staff || "Unknown");
  const sales = rows.map(r => r.sales || 0);
  const profit = rows.map(r => r.profit || 0);
  if (charts.sales) charts.sales.destroy();
  charts.sales = new Chart(ctx, {
    type: "bar",
    data: { labels, datasets: [
      { label: "Sales", data: sales, backgroundColor: "rgba(59,130,246,0.6)" },
      { label: "Profit", data: profit, backgroundColor: "rgba(16,185,129,0.6)" }
    ]},
    options: { scales: { y: { beginAtZero: true } } }
  });
}
function renderRegionChart(rows) {
  const ctx = document.getElementById("regionChart").getContext("2d");
  const labels = rows.map(r => r.region || "Unknown");
  const data = rows.map(r => r.count || 0);
  if (charts.region) charts.region.destroy();
  charts.region = new Chart(ctx, {
    type: "pie",
    data: { labels, datasets: [{ data, backgroundColor: labels.map((_, i) => `hsl(${i * 60},70%,60%)`)}] }
  });
}

/* ================================
   🌍 REGION MANAGEMENT
================================= */
async function initRegionManagement() {
  const tbody = document.getElementById("regionTableBody");
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="3" class="p-4 text-center text-gray-500">Loading...</td></tr>`;
  try {
    const regions = await apiFetch("/regions");
    tbody.innerHTML = "";
    regions.forEach(r => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="p-2 border">${r.name}</td>
        <td class="p-2 border">${r.description || "-"}</td>
        <td class="p-2 border text-center">
          <button onclick="editRegion(${r.id}, '${r.name}', '${r.description || ""}')" class="text-blue-600">Edit</button>
          <button onclick="deleteRegion(${r.id})" class="text-red-600 ml-2">Hapus</button>
        </td>`;
      tbody.appendChild(tr);
    });
  } catch {
    showError("Gagal memuat region");
  }
}

/* ================================
   👥 USER MANAGEMENT
================================= */
async function loadUserList() {
  const tbody = document.getElementById("userTableBody");
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="4" class="p-4 text-center text-gray-500">Memuat...</td></tr>`;
  try {
    const users = await apiFetch("/users");
    tbody.innerHTML = "";
    users.forEach(u => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="border p-2">${u.name}</td>
        <td class="border p-2">${u.username}</td>
        <td class="border p-2">${u.role}</td>
        <td class="border p-2 text-center">
          <button onclick="resetPassword('${u.username}')" class="text-red-600 hover:underline">Reset Password</button>
        </td>`;
      tbody.appendChild(tr);
    });
  } catch {
    showError("Gagal memuat user list");
  }
}
async function resetPassword(username) {
  if (!confirm(`Reset password untuk ${username}?`)) return;
  try {
    await apiFetch(`/users/reset-password/${username}`, { method: "POST" });
    showSuccess("Password berhasil direset!");
  } catch {
    showError("Gagal reset password");
  }
}

/* ================================
   🧠 INIT
================================= */
document.getElementById("loginForm")?.addEventListener("submit", handleLogin);
document.getElementById("logoutBtn")?.addEventListener("click", logout);
window.addEventListener("DOMContentLoaded", () => {
  if (currentUser && token) bootAfterLogin();
});
