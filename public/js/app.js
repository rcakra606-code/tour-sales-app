/* =====================================================
   APP.JS - FINAL FRONTEND CONTROLLER (v2025)
   ===================================================== */

const API_BASE = "/api";

/* =====================================================
   BASIC HELPERS
   ===================================================== */
const authHeaders = () => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
});

function formatNumber(num) {
  return new Intl.NumberFormat("id-ID").format(num || 0);
}

/* =====================================================
   ADVANCED GLOBAL LOADER HANDLER (FADE + DELAY + MESSAGE)
   ===================================================== */
let loaderTimer = null;
function showLoader(show = true, message = "Memuat data...") {
  const loader = document.getElementById("globalLoader");
  const msg = document.getElementById("loaderMessage");
  if (!loader || !msg) return;

  if (show) {
    msg.textContent = message;
    loaderTimer = setTimeout(() => {
      loader.classList.remove("hidden");
      requestAnimationFrame(() => {
        loader.classList.add("flex");
        loader.classList.add("opacity-100");
      });
    }, 400); // delay 400ms agar tidak flicker
  } else {
    if (loaderTimer) clearTimeout(loaderTimer);
    loader.classList.remove("opacity-100");
    loader.classList.add("opacity-0");
    setTimeout(() => {
      loader.classList.add("hidden");
      loader.classList.remove("flex");
    }, 300);
  }
}

/* =====================================================
   API WRAPPERS (TERINTEGRASI DENGAN LOADER)
   ===================================================== */
async function apiGet(url, msg = "Mengambil data...") {
  showLoader(true, msg);
  try {
    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  } finally {
    showLoader(false);
  }
}

async function apiPost(url, data, msg = "Menyimpan data...") {
  showLoader(true, msg);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  } finally {
    showLoader(false);
  }
}

async function apiPut(url, data, msg = "Memperbarui data...") {
  showLoader(true, msg);
  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  } finally {
    showLoader(false);
  }
}

async function apiDelete(url, msg = "Menghapus data...") {
  showLoader(true, msg);
  try {
    const res = await fetch(url, { method: "DELETE", headers: authHeaders() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  } finally {
    showLoader(false);
  }
}

/* =====================================================
   GLOBAL MODAL UTILITY (DENGAN SPINNER DI DALAM)
   ===================================================== */
function openModal(title, fields, onSubmit, initialData = {}) {
  const modal = document.getElementById("globalModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalForm = document.getElementById("modalForm");
  const closeBtn = document.getElementById("modalCloseBtn");
  const cancelBtn = document.getElementById("modalCancelBtn");
  const spinner = document.getElementById("modalSpinner");
  const submitBtn = document.getElementById("modalSubmitBtn");

  modalTitle.textContent = title;
  modalForm.innerHTML = "";

  fields.forEach(f => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
      <label class="block text-sm font-medium text-gray-700 mb-1">${f.label}</label>
      <input type="${f.type || 'text'}" name="${f.name}" value="${initialData[f.name] ?? ''}" 
        class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        ${f.required ? 'required' : ''} placeholder="${f.placeholder || ''}">
    `;
    modalForm.appendChild(wrapper);
  });

  modal.classList.remove("hidden");
  modal.classList.add("flex");

  function close() {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    modalForm.removeEventListener("submit", submitHandler);
  }

  closeBtn.onclick = cancelBtn.onclick = close;
  modal.onclick = e => { if (e.target === modal) close(); };

  async function submitHandler(e) {
    e.preventDefault();
    const formData = new FormData(modalForm);
    const data = {};
    formData.forEach((v, k) => data[k] = v);

    try {
      spinner.classList.remove("hidden");
      submitBtn.disabled = true;
      cancelBtn.disabled = true;
      await onSubmit(data);
      showToast("Data berhasil disimpan.", "success");
      close();
    } catch (err) {
      showToast("Terjadi kesalahan: " + err.message, "error");
    } finally {
      spinner.classList.add("hidden");
      submitBtn.disabled = false;
      cancelBtn.disabled = false;
    }
  }

  modalForm.addEventListener("submit", submitHandler);
}

/* =====================================================
   TOAST SYSTEM + ESC CLOSE
   ===================================================== */
function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;
  const toast = document.createElement("div");

  const colors = {
    success: "bg-green-500 text-white",
    error: "bg-red-500 text-white",
    info: "bg-gray-700 text-white"
  };

  toast.className = `${colors[type] || colors.info} px-4 py-2 rounded-lg shadow-lg text-sm animate-fade-in`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("opacity-0", "translate-x-5");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    const modal = document.getElementById("globalModal");
    if (modal && !modal.classList.contains("hidden")) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  }
});

/* =====================================================
   ANIMATION STYLES
   ===================================================== */
const style = document.createElement("style");
style.textContent = `
@keyframes fadeIn { from { opacity:0; transform:translateX(10px);} to {opacity:1; transform:none;} }
.animate-fade-in { animation: fadeIn .3s ease; }
@keyframes spin { to { transform: rotate(360deg); } }
.animate-spin { animation: spin 1s linear infinite; }
.transition-opacity { transition: opacity .3s ease; }
.opacity-100 { opacity: 1 !important; }
.opacity-0 { opacity: 0 !important; }
`;
document.head.appendChild(style);

/* =====================================================
   LOGIN PAGE
   ===================================================== */
if (location.pathname.endsWith("login.html")) {
  const form = document.getElementById("loginForm");
  const err = document.getElementById("loginError");
  form?.addEventListener("submit", async e => {
    e.preventDefault();
    err.classList.add("hidden");
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: form.username.value, password: form.password.value })
      });
      if (!res.ok) throw new Error("Login gagal");
      const data = await res.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      location.href = "/dashboard.html";
    } catch {
      err.textContent = "Login gagal. Coba lagi.";
      err.classList.remove("hidden");
    }
  });
}

/* =====================================================
   DASHBOARD PAGE
   ===================================================== */
if (location.pathname.endsWith("dashboard.html")) {
  const logoutBtn = document.getElementById("logoutBtn");
  const userEl = document.getElementById("currentUser");
  const pageContent = document.getElementById("pageContent");
  const sidebar = document.querySelectorAll(".sidebar-item");

  // Auth verify
  (async () => {
    const res = await fetch(`${API_BASE}/auth/verify`, { headers: authHeaders() });
    const data = await res.json();
    if (!data.ok) { localStorage.clear(); location.href = "/login.html"; }
    userEl.textContent = `${data.user.name || data.user.username} (${data.user.type})`;
  })();

  logoutBtn.onclick = () => { localStorage.clear(); location.href = "/login.html"; };

  // Dark Mode Toggle
  (function initDarkMode() {
    const header = document.querySelector("header .flex.items-center.space-x-4");
    const btn = document.createElement("button");
    btn.id = "darkToggle";
    btn.className = "bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-2 rounded-full text-sm";
    btn.textContent = localStorage.getItem("dark") === "1" ? "☀️" : "🌙";
    if (localStorage.getItem("dark") === "1") document.documentElement.classList.add("dark");
    btn.onclick = () => {
      document.documentElement.classList.toggle("dark");
      const isDark = document.documentElement.classList.contains("dark");
      localStorage.setItem("dark", isDark ? "1" : "0");
      btn.textContent = isDark ? "☀️" : "🌙";
    };
    header.appendChild(btn);
  })();

  // Sidebar navigation
  sidebar.forEach(b => b.addEventListener("click", () => {
    sidebar.forEach(x => x.classList.remove("active"));
    b.classList.add("active");
    renderPage(b.dataset.page);
  }));
  renderPage("dashboard");

  /* =====================================================
     PAGE RENDER FUNCTIONS
     ===================================================== */
  async function renderPage(page) {
    switch (page) {
      case "dashboard": return renderDashboardTour();
      case "dashboardSales": return renderDashboardSales();
      case "reportData": return renderReportTours();
      case "reportSales": return renderReportSales();
      case "reportDocument": return renderReportDocuments();
      case "manageUsers": return renderManageUsers();
      case "manageRegions": return renderManageRegions();
      case "executive": return renderExecutiveReport();
      default: pageContent.innerHTML = `<div class='text-gray-400 text-center py-10'>Halaman tidak ditemukan.</div>`;
    }
  }

  async function renderDashboardTour() {
    pageContent.innerHTML = `
      <div class="max-w-7xl mx-auto">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold">📈 Dashboard Tour</h2>
          <button id="addTourBtn" class="px-4 py-2 bg-indigo-600 text-white rounded-xl">+ Tambah Tour</button>
        </div>
        <div id="tourSummary" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"></div>
        <div class="chart-container mt-8"><canvas id="tourChart"></canvas></div>
      </div>
    `;
    document.getElementById("addTourBtn").onclick = () => {
      openModal("Tambah Tour", [
        { name: "registration_date", label: "Tanggal Registrasi", type: "date", required: true },
        { name: "tour_code", label: "Kode Tour", required: true },
        { name: "lead_passenger", label: "Lead Passenger" },
        { name: "pax_count", label: "Jumlah Pax", type: "number" },
        { name: "region", label: "Region" },
        { name: "tour_price", label: "Harga Tour", type: "number" }
      ], async d => {
        d.staff_username = JSON.parse(localStorage.getItem("user")).username;
        await apiPost(`${API_BASE}/tours`, d, "Menyimpan data tour...");
        renderDashboardTour();
      });
    };

    const data = await apiGet(`${API_BASE}/dashboard/summary`, "Mengambil data dashboard...");
    const cards = [
      { t: "Total Sales", v: data.totalSales, i: "💰" },
      { t: "Total Profit", v: data.totalProfit, i: "📊" },
      { t: "Registrants", v: data.totalRegistrants, i: "🧾" },
      { t: "Total Pax", v: data.totalPax, i: "👥" }
    ];
    document.getElementById("tourSummary").innerHTML = cards.map(c => `
      <div class="p-6 rounded-2xl text-white gradient-card shadow-lg">
        <div class="flex justify-between mb-2"><span class="text-3xl">${c.i}</span><span>${c.t}</span></div>
        <p class="text-2xl font-bold">${formatNumber(c.v)}</p>
      </div>`).join("");

    new Chart(document.getElementById("tourChart"), {
      type: "bar",
      data: { labels: data.regions.map(r => r.name), datasets: [{ label: "Jumlah Tour", data: data.regions.map(r => r.count) }] },
      options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });
  }

  async function renderDashboardSales() {
    pageContent.innerHTML = `
      <div class="max-w-7xl mx-auto">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold">💰 Dashboard Sales</h2>
          <button id="addSaleBtn" class="px-4 py-2 bg-indigo-600 text-white rounded-xl">+ Tambah Sales</button>
        </div>
        <div class="chart-container"><canvas id="salesChart"></canvas></div>
      </div>
    `;
    document.getElementById("addSaleBtn").onclick = () => {
      openModal("Tambah Sales", [
        { name: "transaction_date", label: "Tanggal Transaksi", type: "date", required: true },
        { name: "invoice_number", label: "No. Invoice", required: true },
        { name: "sales_amount", label: "Jumlah Sales", type: "number" },
        { name: "profit_amount", label: "Profit", type: "number" }
      ], async d => {
        await apiPost(`${API_BASE}/sales`, d, "Menyimpan data sales...");
        renderDashboardSales();
      });
    };

    const sales = await apiGet(`${API_BASE}/sales`, "Mengambil data penjualan...");
    const grouped = {};
    sales.forEach(s => {
      const ym = s.transaction_date?.substring(0,7);
      grouped[ym] = (grouped[ym]||0) + s.sales_amount;
    });
    const labels = Object.keys(grouped).sort();
    new Chart(document.getElementById("salesChart"), {
      type: "line",
      data: { labels, datasets: [{ label: "Penjualan per Bulan", data: labels.map(l => grouped[l]) }] },
      options: { responsive: true }
    });
  }

  async function renderReportTours() {
    pageContent.innerHTML = `<h2 class='text-2xl font-bold mb-4'>📋 Report Tour</h2>
      <table class='w-full border bg-white rounded-xl shadow-md text-sm'>
        <thead class='bg-indigo-500 text-white'><tr><th class='p-2'>Code</th><th class='p-2'>Lead</th><th class='p-2'>Region</th><th class='p-2'>Sales</th><th class='p-2'>Profit</th></tr></thead>
        <tbody id='tourTbl'></tbody></table>`;
    const t = await apiGet(`${API_BASE}/tours`, "Mengambil data laporan tour...");
    document.getElementById("tourTbl").innerHTML = t.map(r => `
      <tr class='hover:bg-indigo-50'><td class='p-2'>${r.tour_code}</td><td>${r.lead_passenger}</td><td>${r.region}</td><td>${r.sales_amount}</td><td>${r.profit_amount}</td></tr>`).join("");
  }

  async function renderReportSales() {
    pageContent.innerHTML = `<h2 class='text-2xl font-bold mb-4'>💼 Report Sales</h2>
      <table class='w-full border bg-white rounded-xl shadow-md text-sm'><thead class='bg-indigo-500 text-white'>
      <tr><th class='p-2'>Tanggal</th><th class='p-2'>Invoice</th><th class='p-2'>Sales</th><th class='p-2'>Profit</th></tr></thead>
      <tbody id='salesTbl'></tbody></table>`;
    const s = await apiGet(`${API_BASE}/sales`, "Mengambil data laporan sales...");
    document.getElementById("salesTbl").innerHTML = s.map(r => `
      <tr class='hover:bg-indigo-50'><td class='p-2'>${r.transaction_date}</td><td>${r.invoice_number}</td><td>${r.sales_amount}</td><td>${r.profit_amount}</td></tr>`).join("");
  }

  async function renderReportDocuments() {
    pageContent.innerHTML = `<h2 class='text-2xl font-bold mb-4'>📄 Report Dokumen</h2>
      <table class='w-full border bg-white rounded-xl shadow-md text-sm'><thead class='bg-indigo-500 text-white'>
      <tr><th class='p-2'>Nama</th><th class='p-2'>Invoice</th><th class='p-2'>Proses</th><th class='p-2'>Status</th></tr></thead>
      <tbody id='docTbl'></tbody></table>`;
    const d = await apiGet(`${API_BASE}/documents`, "Mengambil data dokumen...");
    document.getElementById("docTbl").innerHTML = d.map(r => `
      <tr class='hover:bg-indigo-50'><td class='p-2'>${r.guest_names}</td><td>${r.invoice_number}</td><td>${r.process_type}</td><td>${r.document_status}</td></tr>`).join("");
  }

  async function renderManageUsers() {
    pageContent.innerHTML = `<div class='flex justify-between mb-4'><h2 class='text-2xl font-bold'>👥 Users</h2>
      <button id='addUserBtn' class='px-4 py-2 bg-indigo-600 text-white rounded-xl'>+ User</button></div>
      <table class='w-full border bg-white rounded-xl shadow-md text-sm'><thead class='bg-indigo-500 text-white'>
      <tr><th class='p-2'>Username</th><th class='p-2'>Name</th><th class='p-2'>Role</th></tr></thead><tbody id='usrTbl'></tbody></table>`;
    document.getElementById("addUserBtn").onclick = () => {
      openModal("Tambah User", [
        { name: "username", label: "Username", required: true },
        { name: "password", label: "Password", type: "password", required: true },
        { name: "name", label: "Nama Lengkap" },
        { name: "email", label: "Email" },
        { name: "type", label: "Role (basic/semi/super)" }
      ], async d => {
        await apiPost(`${API_BASE}/users`, d, "Membuat user baru...");
        renderManageUsers();
      });
    };
    const u = await apiGet(`${API_BASE}/users`, "Mengambil daftar user...");
    document.getElementById("usrTbl").innerHTML = u.map(r => `<tr><td class='p-2'>${r.username}</td><td>${r.name}</td><td>${r.type}</td></tr>`).join("");
  }

  async function renderManageRegions() {
    pageContent.innerHTML = `<div class='flex justify-between mb-4'><h2 class='text-2xl font-bold'>🌍 Regions</h2>
      <button id='addRegionBtn' class='px-4 py-2 bg-indigo-600 text-white rounded-xl'>+ Region</button></div>
      <table class='w-full border bg-white rounded-xl shadow-md text-sm'><thead class='bg-indigo-500 text-white'>
      <tr><th class='p-2'>Nama Region</th></tr></thead><tbody id='regTbl'></tbody></table>`;
    document.getElementById("addRegionBtn").onclick = () => {
      openModal("Tambah Region", [
        { name: "name", label: "Nama Region", required: true }
      ], async d => {
        await apiPost(`${API_BASE}/regions`, d, "Menambahkan region...");
        renderManageRegions();
      });
    };
    const r = await apiGet(`${API_BASE}/regions`, "Mengambil daftar region...");
    document.getElementById("regTbl").innerHTML = r.map(x => `<tr><td class='p-2'>${x.name}</td></tr>`).join("");
  }

  async function renderExecutiveReport() {
    pageContent.innerHTML = `<h2 class='text-2xl font-bold mb-4'>🏢 Executive Summary</h2><div class='chart-container'><canvas id='execChart'></canvas></div>`;
    const d = await apiGet(`${API_BASE}/report/executive`, "Mengambil executive summary...");
    new Chart(document.getElementById("execChart"), {
      type: "bar",
      data: { labels: d.topStaff.map(s => s.username), datasets: [{ label: "Top Staff Sales", data: d.topStaff.map(s => s.sales) }] },
      options: { responsive: true }
    });
  }
}
