/* ================================
   🌐 GLOBAL CONFIG
================================= */
const API_BASE = window.location.origin + "/api";
let token = localStorage.getItem("token") || null;
let currentUser = JSON.parse(localStorage.getItem("user") || "null");
let charts = { sales: null, region: null, daily: null };

/* ================================
   🔧 HELPER FUNCTIONS
================================= */
function showLoading(show = true) {
  const el = document.getElementById("loadingOverlay");
  if (el) el.classList.toggle("hidden", !show);
}

function showError(msg) {
  alert("❌ " + msg);
}

function showSuccess(msg) {
  console.log("✅ " + msg);
}

/* ================================
   📡 GENERIC API FETCH
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
   🔐 AUTH HANDLING
================================= */
async function handleLogin(e) {
  e.preventDefault();
  showLoading(true);
  const username = document.getElementById("username")?.value?.trim();
  const password = document.getElementById("password")?.value;

  try {
    const res = await fetch(API_BASE + "/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      showError(data.message || "Login gagal");
      return;
    }

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
  window.location.reload();
}

/* ================================
   🚀 AFTER LOGIN
================================= */
function bootAfterLogin() {
  const nameEl = document.getElementById("userInfo");
  if (nameEl && currentUser) nameEl.textContent = currentUser.name || "User";

  buildSidebar();
  showPage("dashboard");
  updateCharts();
}

/* ================================
   🧭 NAVIGATION
================================= */
function showPage(pageId) {
  document.querySelectorAll(".page-section").forEach((s) => s.classList.add("hidden"));
  const el = document.getElementById(pageId + "Page");
  if (el) el.classList.remove("hidden");

  // Load data sesuai halaman
  if (pageId === "dashboard") updateCharts();
  if (pageId === "regions") initRegionManagement();
}

/* ================================
   📊 DASHBOARD CHARTS
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

    const salesOverview = await apiFetch("/dashboard/sales-overview").catch(() => ({ daily: [] }));
    renderDailySalesChart(salesOverview.daily || []);
  } catch (err) {
    console.error("updateCharts error:", err);
  }
}

function renderSalesChart(staffRows) {
  const ctx = document.getElementById("salesChart")?.getContext("2d");
  if (!ctx) return;

  const labels = staffRows.map((r) => r.staff || "Unknown");
  const sales = staffRows.map((r) => r.sales || 0);
  const profit = staffRows.map((r) => r.profit || 0);
  if (charts.sales) charts.sales.destroy();
  charts.sales = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        { label: "Sales", data: sales, backgroundColor: "rgba(59,130,246,0.6)" },
        { label: "Profit", data: profit, backgroundColor: "rgba(16,185,129,0.6)" },
      ],
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true, ticks: { callback: (v) => "Rp " + v.toLocaleString() } } },
    },
  });
}

function renderRegionChart(regionRows) {
  const ctx = document.getElementById("regionChart")?.getContext("2d");
  if (!ctx) return;
  const labels = regionRows.map((r) => r.region || "Unknown");
  const data = regionRows.map((r) => r.count || 0);
  if (charts.region) charts.region.destroy();
  charts.region = new Chart(ctx, {
    type: "pie",
    data: {
      labels,
      datasets: [{ data, backgroundColor: labels.map((_, i) => `hsl(${i * 60 % 360}deg 70% 50%)`) }],
    },
    options: { responsive: true },
  });
}

function renderDailySalesChart(rows) {
  const ctx = document.getElementById("dailySalesChart")?.getContext("2d");
  if (!ctx) return;
  const labels = rows.map((r) => r.date);
  const sales = rows.map((r) => r.totalSales || 0);
  const profit = rows.map((r) => r.totalProfit || 0);
  if (charts.daily) charts.daily.destroy();
  charts.daily = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        { label: "Total Sales", data: sales, borderColor: "rgba(59,130,246,0.8)", fill: false, tension: 0.3 },
        { label: "Total Profit", data: profit, borderColor: "rgba(16,185,129,0.8)", fill: false, tension: 0.3 },
      ],
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true, ticks: { callback: (v) => "Rp " + v.toLocaleString() } } },
    },
  });
}

/* ================================
   🌍 REGION MANAGEMENT
================================= */
async function initRegionManagement() {
  try {
    const tbody = document.getElementById("regionTableBody");
    if (!tbody) return;
    tbody.innerHTML = "<tr><td colspan='3' class='p-4 text-center text-gray-500'>Loading...</td></tr>";

    const regions = await apiFetch("/regions");
    tbody.innerHTML = "";
    regions.forEach((r) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="p-2 border">${r.name}</td>
        <td class="p-2 border">${r.description || "-"}</td>
        <td class="p-2 border text-center">
          <button onclick="editRegion(${r.id}, '${r.name}', '${r.description || ""}')" class="text-blue-600 hover:underline mr-2">Edit</button>
          <button onclick="deleteRegion(${r.id})" class="text-red-600 hover:underline">Hapus</button>
        </td>`;
      tbody.appendChild(tr);
    });
  } catch (err) {
    showError("Gagal memuat region");
  }
}

async function saveRegion(e) {
  e.preventDefault();
  const id = document.getElementById("regionId").value;
  const name = document.getElementById("regionName").value.trim();
  const description = document.getElementById("regionDesc").value.trim();

  try {
    await apiFetch(`/regions${id ? "/" + id : ""}`, {
      method: id ? "PUT" : "POST",
      body: JSON.stringify({ name, description }),
    });
    showSuccess("Region berhasil disimpan");
    document.getElementById("regionForm").reset();
    document.getElementById("regionId").value = "";
    initRegionManagement();
  } catch (err) {
    showError(err.message);
  }
}

async function deleteRegion(id) {
  if (!confirm("Hapus region ini?")) return;
  try {
    await apiFetch(`/regions/${id}`, { method: "DELETE" });
    showSuccess("Region dihapus");
    initRegionManagement();
  } catch (err) {
    showError(err.message);
  }
}

function editRegion(id, name, description) {
  document.getElementById("regionId").value = id;
  document.getElementById("regionName").value = name;
  document.getElementById("regionDesc").value = description;
}

/* ================================
   🚀 INIT
================================= */
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("loginForm")?.addEventListener("submit", handleLogin);
  document.getElementById("logoutBtn")?.addEventListener("click", logout);
  document.getElementById("regionForm")?.addEventListener("submit", saveRegion);

  if (currentUser && token) {
    bootAfterLogin();
  }
});
