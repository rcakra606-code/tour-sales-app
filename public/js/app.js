// public/app.js
const API_BASE = window.location.origin + "/api";
let token = localStorage.getItem("token") || null;
let currentUser = JSON.parse(localStorage.getItem("user") || "null");
let charts = { sales: null, region: null, departure: null, salesTarget: null, profitTarget: null };

function apiFetch(path, opts = {}) {
  opts.headers = opts.headers || {};
  if (!opts.headers["Content-Type"] && !(opts.body instanceof FormData)) opts.headers["Content-Type"] = "application/json";
  if (token) opts.headers["Authorization"] = `Bearer ${token}`;
  return fetch(API_BASE + path, opts).then(async r => {
    if (r.status === 401) {
      logout();
      throw new Error("Unauthorized");
    }
    const json = await r.json().catch(()=>({}));
    if (!r.ok) throw json;
    return json;
  });
}

/* ---------- Auth ---------- */
async function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
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
    bootAfterLogin();
  } catch (err) {
    console.error(err);
    alert("Login error");
  }
}

function bootAfterLogin() {
  document.getElementById("currentUser").textContent = currentUser.name;
  document.getElementById("loginPage").classList.add("hidden");
  document.getElementById("mainApp").classList.remove("hidden");
  if (currentUser.type === "super") {
    document.getElementById("manageUsersMenu").classList.remove("hidden");
    document.getElementById("manageRegionsMenu").classList.remove("hidden");
  } else if (currentUser.type === "semi") {
    document.getElementById("manageRegionsMenu").classList.remove("hidden");
  }
  showPage("dashboard");
  populateDropdowns();
  updateCharts();
  loadDataTable();
  loadSalesTable();
  loadUsersTable();
  loadRegionsTable();
}

function logout() {
  token = null;
  currentUser = null;
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  document.getElementById("loginPage").classList.remove("hidden");
  document.getElementById("mainApp").classList.add("hidden");
}

/* ---------- Navigation ---------- */
document.querySelectorAll(".navLink").forEach(a=>{
  a.addEventListener("click", (ev)=>{
    ev.preventDefault();
    const page = a.getAttribute("data-page");
    showPage(page);
  });
});
function showPage(pageId) {
  document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
  const map = {
    dashboard: "dashboardPage",
    dashboardSales: "dashboardSalesPage",
    inputData: "inputDataPage",
    inputSales: "inputSalesPage",
    reportData: "reportDataPage",
    reportSales: "reportSalesPage",
    documentShipment: "documentShipmentPage",
    reportDocument: "reportDocumentPage",
    userAdmin: "userAdminPage",
    manageUsers: "manageUsersPage",
    manageRegions: "manageRegionsPage"
  };
  const el = document.getElementById(map[pageId] || pageId + "Page");
  if (el) el.classList.remove("hidden");
  // load page-specific data
  if (pageId === "dashboard") updateCharts();
  if (pageId === "dashboardSales") updateSalesCharts();
  if (pageId === "inputData") loadDataTable();
  if (pageId === "inputSales") loadSalesTable();
  if (pageId === "reportData") loadReportData();
  if (pageId === "manageUsers") loadUsersTable();
  if (pageId === "manageRegions") loadRegionsTable();
}

/* ---------- Populate dropdowns (users, regions) ---------- */
async function populateDropdowns() {
  try {
    const users = await apiFetch("/users");
    const regions = await apiFetch("/regions").catch(()=>[]);
    const staffSelects = document.querySelectorAll("#staffSelect, #salesStaffSelect, #salesStaffSelect, #salesStaffSelect, #staffFilter, #salesStaffFilter, #reportStaffFilter");
    // fill staff selects
    const staffOptions = users.filter(u=>u.type === "basic" || u.type === "semi" || u.type === "super");
    staffSelects.forEach(sel => {
      if (!sel) return;
      sel.innerHTML = '<option value="">Pilih Staff</option>';
      sel.insertAdjacentHTML('beforeend', '<option value="all">Semua Staff</option>');
      staffOptions.forEach(u => sel.insertAdjacentHTML('beforeend', `<option value="${u.username}">${u.name}</option>`));
    });

    // fill staff used in dropdown with id staffSelect (for inputData)
    const staffInput = document.getElementById("staffSelect");
    if (staffInput) {
      staffInput.innerHTML = '<option value="">Pilih Staff</option>';
      users.forEach(u => {
        if (u.type === "basic" || u.type === "semi" || u.type === "super") staffInput.insertAdjacentHTML('beforeend', `<option value="${u.username}">${u.name}</option>`);
      });
    }

    // fill regions
    const regionSelect = document.getElementById("regionSelect");
    const reportRegion = document.getElementById("reportRegionFilter");
    if (regionSelect) {
      regionSelect.innerHTML = '<option value="">Pilih Region</option>';
      regions.forEach(r => regionSelect.insertAdjacentHTML('beforeend', `<option value="${r.name}">${r.name}</option>`));
    }
    if (reportRegion) {
      reportRegion.innerHTML = '<option value="all">Semua Region</option>';
      regions.forEach(r => reportRegion.insertAdjacentHTML('beforeend', `<option value="${r.name}">${r.name}</option>`));
    }
  } catch (err) {
    console.info("populateDropdowns error", err);
  }
}

/* ---------- DASHBOARD ---------- */
async function updateCharts() {
  try {
    const summary = await apiFetch("/dashboard/summary");
    document.getElementById("totalSales").textContent = `Rp ${Number(summary.totalSales||0).toLocaleString()}`;
    document.getElementById("totalProfit").textContent = `Rp ${Number(summary.totalProfit||0).toLocaleString()}`;
    document.getElementById("totalRegistrants").textContent = summary.totalRegistrants || 0;
    document.getElementById("totalPax").textContent = summary.totalPax || 0;

    const ch = await apiFetch("/dashboard/charts");
    renderSalesChart(ch.staffRows || []);
    renderRegionChart(ch.regionRows || []);
    renderDepartureChart(); // optional: compute from tours API if you want
  } catch (err) {
    console.error("updateCharts", err);
  }
}

function renderSalesChart(staffRows) {
  const ctx = document.getElementById("salesChart").getContext("2d");
  const labels = staffRows.map(r => r.staff || "Unknown");
  const sales = staffRows.map(r => r.sales || 0);
  const profit = staffRows.map(r => r.profit || 0);
  if (charts.sales) charts.sales.destroy();
  charts.sales = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        { label: "Sales", data: sales, backgroundColor: 'rgba(59,130,246,0.6)' },
        { label: "Profit", data: profit, backgroundColor: 'rgba(16,185,129,0.6)' }
      ]
    },
    options: { responsive:true, scales:{ y:{ beginAtZero:true, ticks:{ callback: v => 'Rp ' + v.toLocaleString() } } } }
  });
}

function renderRegionChart(regionRows) {
  const ctx = document.getElementById("regionChart").getContext("2d");
  const labels = regionRows.map(r => r.region);
  const data = regionRows.map(r => r.count);
  if (charts.region) charts.region.destroy();
  charts.region = new Chart(ctx, {
    type: "pie",
    data: { labels, datasets: [{ data, backgroundColor: labels.map((_,i)=>`hsl(${i*60 % 360}deg 70% 50%)`) }] },
    options: { responsive:true }
  });
}

function renderDepartureChart() {
  // optional: compute from tours endpoint as needed
}

/* ---------- TOURS (inputData) ---------- */
document.getElementById("dataForm").addEventListener("submit", handleDataSubmit);

async function handleDataSubmit(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const body = Object.fromEntries(fd.entries());
  body.paxCount = parseInt(body.paxCount) || 0;
  body.tourPrice = parseFloat(body.tourPrice) || 0;
  try {
    await apiFetch("/tours", { method: "POST", body: JSON.stringify(body) });
    alert("Data tour tersimpan");
    e.target.reset();
    loadDataTable();
  } catch (err) { console.error(err); alert("Gagal menyimpan data tour"); }
}

async function loadDataTable() {
  try {
    const rows = await apiFetch("/tours");
    const tbody = document.getElementById("dataTableBody");
    tbody.innerHTML = "";
    rows.forEach(r => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="p-2">${r.registrationDate||"-"}</td>
        <td class="p-2">${r.leadPassenger||"-"}</td>
        <td class="p-2">${r.tourCode||"-"}</td>
        <td class="p-2">${r.region||"-"}</td>
        <td class="p-2">${r.paxCount||0}</td>
        <td class="p-2">${r.staff||"-"}</td>
        <td class="p-2">Rp ${Number(r.tourPrice||0).toLocaleString()}</td>
        <td class="p-2">${r.departureStatus||"-"}</td>
        <td class="p-2"><button onclick="openDetail(${r.id})" class="px-2 py-1 bg-blue-600 text-white rounded">Detail</button></td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) { console.error(err); }
}

/* ---------- SALES ---------- */
document.getElementById("salesForm").addEventListener("submit", handleSalesSubmit);
async function handleSalesSubmit(e) {
  e.preventDefault();
  const body = Object.fromEntries(new FormData(e.target).entries());
  body.salesAmount = parseFloat(body.salesAmount) || 0;
  body.profitAmount = parseFloat(body.profitAmount) || 0;
  try {
    await apiFetch("/sales", { method: "POST", body: JSON.stringify(body) });
    alert("Sales tersimpan");
    e.target.reset();
    loadSalesTable();
  } catch (err) { console.error(err); alert("Gagal menyimpan sales"); }
}

async function loadSalesTable() {
  try {
    const rows = await apiFetch("/sales");
    const tbody = document.getElementById("salesTableBody");
    tbody.innerHTML = "";
    rows.forEach(r => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="p-2">${r.transactionDate||"-"}</td>
        <td class="p-2">${r.invoiceNumber||"-"}</td>
        <td class="p-2">Rp ${Number(r.salesAmount||0).toLocaleString()}</td>
        <td class="p-2">Rp ${Number(r.profitAmount||0).toLocaleString()}</td>
        <td class="p-2">${r.staff||"-"}</td>
        <td class="p-2"></td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) { console.error(err); }
}

/* ---------- REPORTS ---------- */
document.getElementById("exportReportCSV").addEventListener("click", exportReportCSV);
async function loadReportData() {
  try {
    const rows = await apiFetch("/tours");
    const tbody = document.getElementById("reportDataBody");
    tbody.innerHTML = "";
    rows.forEach(r => tbody.insertAdjacentHTML("beforeend", `<tr><td class="p-2">${r.registrationDate||"-"}</td><td class="p-2">${r.leadPassenger||"-"}</td><td class="p-2">${r.tourCode||"-"}</td><td class="p-2">${r.region||"-"}</td><td class="p-2">${r.paxCount||0}</td><td class="p-2">Rp ${Number(r.tourPrice||0).toLocaleString()}</td></tr>`));
  } catch (err) { console.error(err); }
}
function exportReportCSV() {
  // use currently loaded table data
  const rows = Array.from(document.querySelectorAll("#reportDataBody tr")).map(tr => Array.from(tr.querySelectorAll("td")).map(td => td.textContent.trim()));
  if (rows.length === 0) return alert("Tidak ada data untuk diexport");
  let csv = "Tgl Daftar,Lead Passenger,Kode Tour,Region,Pax,Harga\n";
  rows.forEach(r => csv += r.map(c => `"${c.replace(/"/g,'""')}"`).join(",") + "\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `report_${new Date().toISOString().slice(0,10)}.csv`;
  link.click();
}

/* ---------- USERS & REGIONS ---------- */
async function loadUsersTable() {
  try {
    const users = await apiFetch("/users");
    const tbody = document.getElementById("usersTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";
    users.forEach(u => tbody.insertAdjacentHTML("beforeend", `<tr><td class="p-2">${u.name}</td><td class="p-2">${u.username}</td><td class="p-2">${u.type}</td></tr>`));
  } catch (err) { console.error(err); }
}

async function loadRegionsTable() {
  // Implement if you have manage regions UI; for dropdowns we already call /regions
}

/* ---------- UTIL ---------- */
function openDetail(id) {
  alert("Detail modal for id: " + id + " (implement detail view as needed)");
}

/* ---------- INIT ---------- */
document.getElementById("loginForm").addEventListener("submit", handleLogin);
document.getElementById("logoutBtn").addEventListener("click", ()=>{ logout(); location.reload(); });

window.addEventListener("DOMContentLoaded", () => {
  // if logged in, boot
  if (currentUser && token) bootAfterLogin();
  else {
    document.getElementById("loginPage").classList.remove("hidden");
    document.getElementById("mainApp").classList.add("hidden");
  }
});
