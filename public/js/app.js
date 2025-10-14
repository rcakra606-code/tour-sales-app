// public/app.js
const API_BASE = (window.location.origin) + "/api";
let token = localStorage.getItem("token") || null;
let currentUser = JSON.parse(localStorage.getItem("user")) || null;

// helper fetch with auth
async function apiFetch(path, opts = {}) {
  opts.headers = opts.headers || {};
  opts.headers["Content-Type"] = "application/json";
  if (token) opts.headers["Authorization"] = `Bearer ${token}`;
  const resp = await fetch(API_BASE + path, opts);
  if (resp.status === 401) {
    alert("Sesi habis. Silakan login ulang.");
    logout();
    throw new Error("Unauthorized");
  }
  return resp.json();
}

// Login handler (replace local static login)
async function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  try {
    const res = await fetch(API_BASE + "/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) return alert(data.message || data.error || "Login gagal");
    token = data.token;
    currentUser = data.user;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(currentUser));
    document.getElementById('currentUser').textContent = currentUser.name;
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    if (currentUser.type === 'super') {
      document.getElementById('superUserMenu').classList.remove('hidden');
      document.getElementById('regionMenu').classList.remove('hidden');
    } else if (currentUser.type === 'semi') {
      document.getElementById('regionMenu').classList.remove('hidden');
    }
    showPage('dashboard');
    populateDropdowns();
    updateCharts();
  } catch (err) { console.error(err); alert('Login error'); }
}

function logout() {
  token = null;
  currentUser = null;
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  document.getElementById('loginPage').classList.remove('hidden');
  document.getElementById('mainApp').classList.add('hidden');
}

// Dashboard functions use API
async function updateCharts() {
  try {
    const summary = await apiFetch("/dashboard/summary");
    document.getElementById('totalSales').textContent = `Rp ${Number(summary.totalSales||0).toLocaleString()}`;
    document.getElementById('totalProfit').textContent = `Rp ${Number(summary.totalProfit||0).toLocaleString()}`;
    document.getElementById('totalRegistrants').textContent = summary.totalRegistrants || 0;
    document.getElementById('totalPax').textContent = summary.totalPax || 0;

    const charts = await apiFetch("/dashboard/charts");
    // use charts.staffRows and charts.regionRows to render Chart.js charts (similar to original)
    // ... (call your existing chart rendering code, adapting to new data shape)
  } catch (err) {
    console.error("updateCharts", err);
  }
}

// Example: create tour form submit
async function handleDataSubmit(event) {
  event.preventDefault();
  const form = new FormData(event.target);
  const body = Object.fromEntries(form.entries());
  // convert types
  body.paxCount = parseInt(body.paxCount) || 0;
  body.tourPrice = parseFloat(body.tourPrice) || 0;
  try {
    const res = await apiFetch("/tours", {
      method: "POST",
      body: JSON.stringify(body)
    });
    alert("Data tersimpan");
    loadDataTable();
    event.target.reset();
  } catch (err) { console.error(err); alert("Gagal menyimpan"); }
}

// Load tours into table
async function loadDataTable() {
  try {
    const rows = await apiFetch("/tours");
    const tbody = document.getElementById('dataTableBody');
    tbody.innerHTML = "";
    rows.forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td class="px-6 py-4">${r.registrationDate || '-'}</td>
        <td class="px-6 py-4">${r.leadPassenger || '-'}</td>
        <td class="px-6 py-4">${r.tourCode || '-'}</td>
        <td class="px-6 py-4">${r.region || '-'}</td>
        <td class="px-6 py-4">${r.paxCount || 0}</td>
        <td class="px-6 py-4">${r.staff || '-'}</td>
        <td class="px-6 py-4">Rp ${Number(r.tourPrice||0).toLocaleString()}</td>
        <td class="px-6 py-4">${r.departureStatus || '-'}</td>
        <td class="px-6 py-4"><button onclick="openDetail(${r.id})" class="px-2 py-1 bg-blue-600 text-white rounded">Detail</button></td>`;
      tbody.appendChild(tr);
    });
  } catch (err) { console.error(err); }
}

// similar: loadSalesTable(), loadReportData(), etc. Use apiFetch("/sales"), apiFetch("/documents"), apiFetch("/users")

// initialize event listeners
document.addEventListener('DOMContentLoaded', function(){
  document.querySelector('form[onsubmit="handleLogin(event)"]').addEventListener('submit', handleLogin);
  const dataForm = document.getElementById('dataForm');
  if (dataForm) dataForm.addEventListener('submit', handleDataSubmit);
  // init theme, sidebar, etc (reuse existing code)
  initializeApp && initializeApp();
});
