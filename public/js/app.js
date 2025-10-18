/* =====================================================
   APP.JS - Main Frontend Controller (Enhanced)
   - Adds Dark Mode toggle
   - Adds simple CRUD via prompt/confirm for Tours, Sales, Documents, Users, Regions
   - Integrates with server.js endpoints
   - Uses Chart.js for charts
   ===================================================== */

const API_BASE = "/api";

/* ---------- Helpers ---------- */
const authHeaders = () => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
});

async function apiGet(url) {
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `GET ${url} failed`);
  }
  return res.json();
}

async function apiPost(url, data) {
  const res = await fetch(url, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `POST ${url} failed`);
  }
  return res.json();
}

async function apiPut(url, data) {
  const res = await fetch(url, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `PUT ${url} failed`);
  }
  return res.json();
}

async function apiDelete(url) {
  const res = await fetch(url, {
    method: "DELETE",
    headers: authHeaders()
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `DELETE ${url} failed`);
  }
  return res.json();
}

function safeJSONParse(s) {
  try { return JSON.parse(s); } catch(e) { return null; }
}

function formatNumber(num) {
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(num || 0);
}

/* =====================================================
   LOGIN PAGE LOGIC
   ===================================================== */
if (window.location.pathname.endsWith("login.html")) {
  const form = document.getElementById("loginForm");
  const errorBox = document.getElementById("loginError");

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = form.username.value.trim();
    const password = form.password.value.trim();
    errorBox.classList.add("hidden");
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Login gagal");
      }
      const data = await res.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "/dashboard.html";
    } catch (err) {
      errorBox.textContent = err.message || "Login gagal";
      errorBox.classList.remove("hidden");
    }
  });
}

/* =====================================================
   DASHBOARD & SPA LOGIC
   ===================================================== */
if (window.location.pathname.endsWith("dashboard.html")) {
  const logoutBtn = document.getElementById("logoutBtn");
  const currentUser = document.getElementById("currentUser");
  const sidebarButtons = document.querySelectorAll(".sidebar-item");
  const pageContent = document.getElementById("pageContent");

  // Create Dark Mode toggle and insert into header area
  (function createDarkToggle() {
    const header = document.querySelector("header .flex.items-center") || document.querySelector("header div");
    if (!header) return;
    const btn = document.createElement("button");
    btn.id = "darkToggle";
    btn.title = "Toggle dark mode";
    btn.className = "ml-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-2 rounded-full text-sm transition-all";
    btn.textContent = "🌙";
    btn.style.cursor = "pointer";
    btn.addEventListener("click", () => {
      document.documentElement.classList.toggle("dark");
      localStorage.setItem("dark", document.documentElement.classList.contains("dark") ? "1" : "0");
      btn.textContent = document.documentElement.classList.contains("dark") ? "☀️" : "🌙";
    });
    // restore
    if (localStorage.getItem("dark") === "1") {
      document.documentElement.classList.add("dark");
      btn.textContent = "☀️";
    }
    // place after logout button
    const headerRight = document.querySelector("header .flex.items-center.space-x-4") || document.querySelector("header div:last-child");
    if (headerRight) headerRight.appendChild(btn);
    else if (header) header.appendChild(btn);
  })();

  // Verify token
  (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/verify`, { headers: authHeaders() });
      const data = await res.json();
      if (!data.ok) {
        localStorage.clear();
        return (window.location.href = "/login.html");
      }
      currentUser.textContent = `${data.user.name || data.user.username} (${data.user.type})`;
    } catch (e) {
      localStorage.clear();
      window.location.href = "/login.html";
    }
  })();

  logoutBtn?.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "/login.html";
  });

  // Sidebar nav events
  sidebarButtons.forEach(btn => {
    btn.addEventListener("click", async () => {
      sidebarButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const page = btn.dataset.page;
      await renderPage(page);
    });
  });

  // Activate default page (dashboard)
  const firstBtn = [...sidebarButtons].find(b => b.dataset.page === "dashboard") || sidebarButtons[0];
  if (firstBtn) { firstBtn.classList.add("active"); renderPage(firstBtn.dataset.page); }

  // Page router
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
      default:
        pageContent.innerHTML = `<div class='text-gray-500 text-center py-10'>Halaman tidak ditemukan.</div>`;
    }
  }

  /* =====================================================
     PAGE: DASHBOARD TOUR
     - includes quick create tour button
     ===================================================== */
  async function renderDashboardTour() {
    pageContent.innerHTML = `
      <div class="max-w-7xl mx-auto space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold">📈 Dashboard Tour</h2>
          <div class="space-x-3">
            <button id="btnNewTour" class="px-4 py-2 rounded-xl bg-indigo-600 text-white">+ New Tour</button>
            <button id="btnRefreshTour" class="px-4 py-2 rounded-xl border">Refresh</button>
          </div>
        </div>

        <div id="tourSummary" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"></div>

        <div class="chart-container mt-8">
          <canvas id="tourChart"></canvas>
        </div>
      </div>
    `;

    document.getElementById("btnNewTour").addEventListener("click", quickCreateTour);
    document.getElementById("btnRefreshTour").addEventListener("click", renderDashboardTour);

    try {
      const summary = await apiGet(`${API_BASE}/dashboard/summary`);
      const cards = [
        { title: "Total Sales", value: summary.totalSales, icon: "💰" },
        { title: "Total Profit", value: summary.totalProfit, icon: "📊" },
        { title: "Registrants", value: summary.totalRegistrants, icon: "🧾" },
        { title: "Total Pax", value: summary.totalPax, icon: "👥" },
      ];

      const summaryDiv = document.getElementById("tourSummary");
      summaryDiv.innerHTML = cards.map(c => `
        <div class="p-6 rounded-2xl text-white gradient-card shadow-lg">
          <div class="flex items-center justify-between mb-2">
            <span class="text-3xl">${c.icon}</span>
            <span class="text-sm opacity-75">${c.title}</span>
          </div>
          <p class="text-2xl font-bold">${formatNumber(c.value)}</p>
        </div>
      `).join("");

      // Chart
      const ctx = document.getElementById("tourChart").getContext("2d");
      if (window._tourChart) window._tourChart.destroy();
      window._tourChart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: summary.regions.map(r => r.name),
          datasets: [{ label: "Jumlah Tour per Region", data: summary.regions.map(r => r.count), borderWidth: 1 }]
        },
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
      });
    } catch (e) {
      alert("Gagal memuat dashboard: " + e.message);
    }
  }

  // Quick create tour via prompts (simple)
  async function quickCreateTour() {
    try {
      const registration_date = prompt("Tanggal registrasi (YYYY-MM-DD):", (new Date()).toISOString().slice(0,10));
      if (!registration_date) return;
      const tour_code = prompt("Tour code (mis: TR-001):", "");
      if (!tour_code) return;
      const lead_passenger = prompt("Lead passenger:", "");
      const pax_count = Number(prompt("Jumlah pax:", "1") || 1);
      const region = prompt("Region (nama):", "Asia");
      const tour_price = Number(prompt("Tour price (angka):", "0") || 0);
      const staff_username = safeJSONParse(localStorage.getItem("user"))?.username || '';

      const payload = { registration_date, tour_code, lead_passenger, pax_count, region, tour_price, staff_username };
      const created = await apiPost(`${API_BASE}/tours`, payload);
      alert("Tour berhasil dibuat: " + created.tour_code);
      renderDashboardTour();
    } catch (e) {
      alert("Gagal membuat tour: " + e.message);
    }
  }

  /* =====================================================
     PAGE: DASHBOARD SALES
     - includes quick new sale
     ===================================================== */
  async function renderDashboardSales() {
    pageContent.innerHTML = `
      <div class="max-w-7xl mx-auto space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold">💰 Dashboard Sales</h2>
          <div class="space-x-3">
            <button id="btnNewSale" class="px-4 py-2 rounded-xl bg-indigo-600 text-white">+ New Sale</button>
            <button id="btnRefreshSales" class="px-4 py-2 rounded-xl border">Refresh</button>
          </div>
        </div>

        <div id="salesContainer" class="chart-container">
          <canvas id="salesChart"></canvas>
        </div>
      </div>
    `;

    document.getElementById("btnNewSale").addEventListener("click", quickCreateSale);
    document.getElementById("btnRefreshSales").addEventListener("click", renderDashboardSales);

    try {
      const sales = await apiGet(`${API_BASE}/sales`);
      const grouped = {};
      sales.forEach(s => {
        const ym = s.transaction_date?.substring(0, 7) || "Unknown";
        grouped[ym] = (grouped[ym] || 0) + (Number(s.sales_amount) || 0);
      });
      const labels = Object.keys(grouped).sort();
      const data = labels.map(l => grouped[l]);

      const ctx = document.getElementById("salesChart").getContext("2d");
      if (window._salesChart) window._salesChart.destroy();
      window._salesChart = new Chart(ctx, {
        type: "line",
        data: { labels, datasets: [{ label: "Total Penjualan per Bulan", data, borderWidth: 3, fill: true }] },
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
      });
    } catch (e) {
      alert("Gagal memuat sales: " + e.message);
    }
  }

  async function quickCreateSale() {
    try {
      const transaction_date = prompt("Tanggal transaksi (YYYY-MM-DD):", (new Date()).toISOString().slice(0,10));
      if (!transaction_date) return;
      const invoice_number = prompt("Invoice number:", `INV-${Date.now()}`);
      if (!invoice_number) return;
      const sales_amount = Number(prompt("Sales amount:", "0") || 0);
      const profit_amount = Number(prompt("Profit amount:", Math.round(sales_amount * 0.2)) || 0);
      const staff_username = safeJSONParse(localStorage.getItem("user"))?.username || '';

      const payload = { transaction_date, invoice_number, sales_amount, profit_amount, staff_username };
      const created = await apiPost(`${API_BASE}/sales`, payload);
      alert("Sales berhasil dibuat: " + created.invoice_number);
      renderDashboardSales();
    } catch (e) {
      alert("Gagal membuat sales: " + e.message);
    }
  }

  /* =====================================================
     PAGE: REPORT TOUR (with edit/delete)
     ===================================================== */
  async function renderReportTours() {
    pageContent.innerHTML = `
      <div class="max-w-7xl mx-auto space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold">📋 Report Tour</h2>
          <div class="space-x-3">
            <button id="btnAddTour" class="px-4 py-2 rounded-xl bg-indigo-600 text-white">+ Add Tour</button>
            <button id="btnRefreshTours" class="px-4 py-2 rounded-xl border">Refresh</button>
          </div>
        </div>

        <table class="w-full border-collapse text-sm bg-white shadow-lg rounded-xl overflow-hidden">
          <thead class="bg-indigo-500 text-white">
            <tr>
              <th class="p-3 text-left">#</th>
              <th class="p-3 text-left">Tour Code</th>
              <th class="p-3 text-left">Lead Passenger</th>
              <th class="p-3 text-left">Region</th>
              <th class="p-3 text-left">Sales</th>
              <th class="p-3 text-left">Profit</th>
              <th class="p-3 text-left">Pax</th>
              <th class="p-3 text-left">Status</th>
              <th class="p-3 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody id="tourTable" class="divide-y"></tbody>
        </table>
      </div>
    `;

    document.getElementById("btnAddTour").addEventListener("click", quickCreateTour);
    document.getElementById("btnRefreshTours").addEventListener("click", renderReportTours);

    try {
      const tours = await apiGet(`${API_BASE}/tours`);
      const tbody = document.getElementById("tourTable");
      tbody.innerHTML = tours.map((t, i) => `
        <tr class="hover:bg-indigo-50">
          <td class="p-3">${i+1}</td>
          <td class="p-3">${t.tour_code}</td>
          <td class="p-3">${t.lead_passenger}</td>
          <td class="p-3">${t.region || '-'}</td>
          <td class="p-3">${formatNumber(t.sales_amount)}</td>
          <td class="p-3">${formatNumber(t.profit_amount)}</td>
          <td class="p-3">${t.pax_count}</td>
          <td class="p-3">${t.departure_status}</td>
          <td class="p-3">
            <button data-id="${t.id}" class="btnEditTour px-3 py-1 rounded-md bg-yellow-400 text-sm mr-2">Edit</button>
            <button data-id="${t.id}" class="btnDelTour px-3 py-1 rounded-md bg-red-400 text-sm">Delete</button>
          </td>
        </tr>
      `).join("");

      document.querySelectorAll(".btnEditTour").forEach(b => b.addEventListener("click", async (ev) => {
        const id = ev.currentTarget.dataset.id;
        await editTour(id);
      }));
      document.querySelectorAll(".btnDelTour").forEach(b => b.addEventListener("click", async (ev) => {
        const id = ev.currentTarget.dataset.id;
        if (!confirm("Hapus tour ini?")) return;
        try {
          await apiDelete(`${API_BASE}/tours/${id}`);
          alert("Terhapus.");
          renderReportTours();
        } catch (e) { alert("Gagal hapus: " + e.message); }
      }));
    } catch (e) {
      alert("Gagal memuat tours: " + e.message);
    }
  }

  async function editTour(id) {
    try {
      const t = await apiGet(`${API_BASE}/tours/${id}`);
      const tour_code = prompt("Tour code:", t.tour_code) || t.tour_code;
      const lead_passenger = prompt("Lead passenger:", t.lead_passenger) || t.lead_passenger;
      const pax_count = Number(prompt("Pax count:", t.pax_count) || t.pax_count);
      const region = prompt("Region name:", t.region || '');
      const sales_amount = Number(prompt("Sales amount:", t.sales_amount || 0) || 0);
      const profit_amount = Number(prompt("Profit amount:", t.profit_amount || 0) || 0);
      const departure_status = prompt("Departure status:", t.departure_status || 'belum_jalan') || t.departure_status;

      const payload = { tour_code, lead_passenger, pax_count, region, sales_amount, profit_amount, departure_status };
      await apiPut(`${API_BASE}/tours/${id}`, payload);
      alert("Tour updated.");
      renderReportTours();
    } catch (e) {
      alert("Gagal update: " + e.message);
    }
  }

  /* =====================================================
     PAGE: REPORT SALES (with edit/delete)
     ===================================================== */
  async function renderReportSales() {
    pageContent.innerHTML = `
      <div class="max-w-7xl mx-auto space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold">💼 Report Sales</h2>
          <div class="space-x-3">
            <button id="btnAddSale" class="px-4 py-2 rounded-xl bg-indigo-600 text-white">+ Add Sale</button>
            <button id="btnRefreshSales2" class="px-4 py-2 rounded-xl border">Refresh</button>
          </div>
        </div>

        <table class="w-full border-collapse text-sm bg-white shadow-lg rounded-xl overflow-hidden">
          <thead class="bg-indigo-500 text-white">
            <tr>
              <th class="p-3 text-left">#</th>
              <th class="p-3 text-left">Tanggal</th>
              <th class="p-3 text-left">Invoice</th>
              <th class="p-3 text-left">Sales</th>
              <th class="p-3 text-left">Profit</th>
              <th class="p-3 text-left">Discount</th>
              <th class="p-3 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody id="salesTable" class="divide-y"></tbody>
        </table>
      </div>
    `;

    document.getElementById("btnAddSale").addEventListener("click", quickCreateSale);
    document.getElementById("btnRefreshSales2").addEventListener("click", renderReportSales);

    try {
      const sales = await apiGet(`${API_BASE}/sales`);
      const tbody = document.getElementById("salesTable");
      tbody.innerHTML = sales.map((s, i) => `
        <tr class="hover:bg-indigo-50">
          <td class="p-3">${i+1}</td>
          <td class="p-3">${s.transaction_date}</td>
          <td class="p-3">${s.invoice_number}</td>
          <td class="p-3">${formatNumber(s.sales_amount)}</td>
          <td class="p-3">${formatNumber(s.profit_amount)}</td>
          <td class="p-3">${formatNumber(s.discount_amount)}</td>
          <td class="p-3">
            <button data-id="${s.id}" class="btnEditSale px-3 py-1 rounded-md bg-yellow-400 text-sm mr-2">Edit</button>
            <button data-id="${s.id}" class="btnDelSale px-3 py-1 rounded-md bg-red-400 text-sm">Delete</button>
          </td>
        </tr>
      `).join("");

      document.querySelectorAll(".btnEditSale").forEach(b => b.addEventListener("click", async (ev) => {
        const id = ev.currentTarget.dataset.id;
        editSale(id);
      }));
      document.querySelectorAll(".btnDelSale").forEach(b => b.addEventListener("click", async (ev) => {
        const id = ev.currentTarget.dataset.id;
        if (!confirm("Hapus sale ini?")) return;
        try {
          await apiDelete(`${API_BASE}/sales/${id}`);
          alert("Terhapus.");
          renderReportSales();
        } catch (e) { alert("Gagal hapus: " + e.message); }
      }));
    } catch (e) {
      alert("Gagal memuat sales: " + e.message);
    }
  }

  async function editSale(id) {
    try {
      const s = await apiGet(`${API_BASE}/sales`);
      const rec = s.find(x => String(x.id) === String(id));
      if (!rec) return alert("Record tidak ditemukan");
      const transaction_date = prompt("Tanggal transaksi (YYYY-MM-DD):", rec.transaction_date) || rec.transaction_date;
      const invoice_number = prompt("Invoice number:", rec.invoice_number) || rec.invoice_number;
      const sales_amount = Number(prompt("Sales amount:", rec.sales_amount) || rec.sales_amount);
      const profit_amount = Number(prompt("Profit amount:", rec.profit_amount) || rec.profit_amount);
      const discount_amount = Number(prompt("Discount amount:", rec.discount_amount) || rec.discount_amount);

      await apiPut(`${API_BASE}/sales/${id}`, { transaction_date, invoice_number, sales_amount, profit_amount, discount_amount });
      alert("Sales updated.");
      renderReportSales();
    } catch (e) {
      alert("Gagal update sale: " + e.message);
    }
  }

  /* =====================================================
     PAGE: REPORT DOCUMENTS (with edit/delete)
     ===================================================== */
  async function renderReportDocuments() {
    pageContent.innerHTML = `
      <div class="max-w-7xl mx-auto space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold">📄 Report Dokumen</h2>
          <div class="space-x-3">
            <button id="btnAddDoc" class="px-4 py-2 rounded-xl bg-indigo-600 text-white">+ Add Document</button>
            <button id="btnRefreshDocs" class="px-4 py-2 rounded-xl border">Refresh</button>
          </div>
        </div>

        <table class="w-full border-collapse text-sm bg-white shadow-lg rounded-xl overflow-hidden">
          <thead class="bg-indigo-500 text-white">
            <tr>
              <th class="p-3 text-left">#</th>
              <th class="p-3 text-left">Nama Tamu</th>
              <th class="p-3 text-left">Invoice</th>
              <th class="p-3 text-left">Jenis Proses</th>
              <th class="p-3 text-left">Status Dokumen</th>
              <th class="p-3 text-left">Status Visa</th>
              <th class="p-3 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody id="docTable" class="divide-y"></tbody>
        </table>
      </div>
    `;

    document.getElementById("btnAddDoc").addEventListener("click", quickCreateDocument);
    document.getElementById("btnRefreshDocs").addEventListener("click", renderReportDocuments);

    try {
      const docs = await apiGet(`${API_BASE}/documents`);
      const tbody = document.getElementById("docTable");
      tbody.innerHTML = docs.map((d, i) => `
        <tr class="hover:bg-indigo-50">
          <td class="p-3">${i+1}</td>
          <td class="p-3">${d.guest_names}</td>
          <td class="p-3">${d.invoice_number}</td>
          <td class="p-3">${d.process_type}</td>
          <td class="p-3">${d.document_status}</td>
          <td class="p-3">${d.visa_status}</td>
          <td class="p-3">
            <button data-id="${d.id}" class="btnEditDoc px-3 py-1 rounded-md bg-yellow-400 text-sm mr-2">Edit</button>
            <button data-id="${d.id}" class="btnDelDoc px-3 py-1 rounded-md bg-red-400 text-sm">Delete</button>
          </td>
        </tr>
      `).join("");

      document.querySelectorAll(".btnEditDoc").forEach(b => b.addEventListener("click", async (ev) => {
        const id = ev.currentTarget.dataset.id;
        editDocument(id);
      }));
      document.querySelectorAll(".btnDelDoc").forEach(b => b.addEventListener("click", async (ev) => {
        const id = ev.currentTarget.dataset.id;
        if (!confirm("Hapus dokumen ini?")) return;
        try {
          await apiDelete(`${API_BASE}/documents/${id}`);
          alert("Terhapus.");
          renderReportDocuments();
        } catch (e) { alert("Gagal hapus: " + e.message); }
      }));
    } catch (e) {
      alert("Gagal memuat dokumen: " + e.message);
    }
  }

  async function quickCreateDocument() {
    try {
      const document_receive_date = prompt("Tanggal terima dokumen (YYYY-MM-DD):", (new Date()).toISOString().slice(0,10));
      if (!document_receive_date) return;
      const guest_names = prompt("Nama tamu:", "");
      const invoice_number = prompt("Invoice number:", "");
      const process_type = prompt("Jenis proses:", "");
      const document_status = prompt("Status dokumen:", "diterima");
      const visa_status = prompt("Status visa:", "");
      const payload = { document_receive_date, guest_names, invoice_number, process_type, document_status, visa_status };
      const created = await apiPost(`${API_BASE}/documents`, payload);
      alert("Dokumen ditambahkan: ID " + created.id);
      renderReportDocuments();
    } catch (e) { alert("Gagal membuat dokumen: " + e.message); }
  }

  async function editDocument(id) {
    try {
      const d = await apiGet(`${API_BASE}/documents`);
      const rec = d.find(x => String(x.id) === String(id));
      if (!rec) return alert("Record tidak ditemukan");
      const guest_names = prompt("Nama tamu:", rec.guest_names) || rec.guest_names;
      const invoice_number = prompt("Invoice number:", rec.invoice_number) || rec.invoice_number;
      const process_type = prompt("Jenis proses:", rec.process_type) || rec.process_type;
      const document_status = prompt("Status dokumen:", rec.document_status) || rec.document_status;
      const visa_status = prompt("Status visa:", rec.visa_status) || rec.visa_status;
      await apiPut(`${API_BASE}/documents/${id}`, { guest_names, invoice_number, process_type, document_status, visa_status });
      alert("Dokumen diupdate.");
      renderReportDocuments();
    } catch (e) { alert("Gagal update dokumen: " + e.message); }
  }

  /* =====================================================
     PAGE: MANAGE USERS (super/semi)
     - create / edit / delete
     ===================================================== */
  async function renderManageUsers() {
    pageContent.innerHTML = `
      <div class="max-w-4xl mx-auto space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold">👥 Kelola User</h2>
          <div>
            <button id="btnAddUser" class="px-4 py-2 rounded-xl bg-indigo-600 text-white">+ Add User</button>
          </div>
        </div>

        <table class="w-full border-collapse text-sm bg-white shadow-lg rounded-xl overflow-hidden">
          <thead class="bg-indigo-500 text-white">
            <tr>
              <th class="p-3 text-left">#</th>
              <th class="p-3 text-left">Username</th>
              <th class="p-3 text-left">Name</th>
              <th class="p-3 text-left">Email</th>
              <th class="p-3 text-left">Role</th>
              <th class="p-3 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody id="usersTable" class="divide-y"></tbody>
        </table>
      </div>
    `;

    document.getElementById("btnAddUser").addEventListener("click", async () => {
      try {
        const username = prompt("Username (unique):");
        if (!username) return;
        const password = prompt("Password:");
        if (!password) return;
        const name = prompt("Full name:", "");
        const email = prompt("Email:", "");
        const type = prompt("Role (basic/semi/super):", "basic");
        await apiPost(`${API_BASE}/users`, { username, password, name, email, type });
        alert("User created.");
        renderManageUsers();
      } catch (e) {
        alert("Gagal membuat user: " + e.message);
      }
    });

    try {
      const users = await apiGet(`${API_BASE}/users`);
      const tbody = document.getElementById("usersTable");
      tbody.innerHTML = users.map((u, i) => `
        <tr class="hover:bg-indigo-50">
          <td class="p-3">${i+1}</td>
          <td class="p-3">${u.username}</td>
          <td class="p-3">${u.name || '-'}</td>
          <td class="p-3">${u.email || '-'}</td>
          <td class="p-3">${u.type}</td>
          <td class="p-3">
            <button data-username="${u.username}" class="btnEditUser px-3 py-1 rounded-md bg-yellow-400 text-sm mr-2">Edit</button>
            <button data-username="${u.username}" class="btnDelUser px-3 py-1 rounded-md bg-red-400 text-sm">Delete</button>
          </td>
        </tr>
      `).join("");

      document.querySelectorAll(".btnEditUser").forEach(b => b.addEventListener("click", async (ev) => {
        const username = ev.currentTarget.dataset.username;
        editUser(username);
      }));
      document.querySelectorAll(".btnDelUser").forEach(b => b.addEventListener("click", async (ev) => {
        const username = ev.currentTarget.dataset.username;
        if (!confirm(`Hapus user ${username}?`)) return;
        try {
          await apiDelete(`${API_BASE}/users/${username}`);
          alert("Terhapus.");
          renderManageUsers();
        } catch (e) { alert("Gagal hapus: " + e.message); }
      }));
    } catch (e) {
      alert("Gagal memuat users: " + e.message);
    }
  }

  async function editUser(username) {
    try {
      const name = prompt("Full name:", "") || undefined;
      const email = prompt("Email:", "") || undefined;
      const type = prompt("Role (basic/semi/super):", "basic") || undefined;
      const pwd = prompt("Password (kosong = tidak diubah):", "");
      const payload = {};
      if (pwd) payload.password = pwd;
      if (name !== undefined) payload.name = name;
      if (email !== undefined) payload.email = email;
      if (type !== undefined) payload.type = type;
      await apiPut(`${API_BASE}/users/${username}`, payload);
      alert("User updated.");
      renderManageUsers();
    } catch (e) {
      alert("Gagal update user: " + e.message);
    }
  }

  /* =====================================================
     PAGE: MANAGE REGIONS
     ===================================================== */
  async function renderManageRegions() {
    pageContent.innerHTML = `
      <div class="max-w-3xl mx-auto space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold">🌍 Kelola Region</h2>
          <div>
            <button id="btnAddRegion" class="px-4 py-2 rounded-xl bg-indigo-600 text-white">+ Add Region</button>
          </div>
        </div>

        <table class="w-full border-collapse text-sm bg-white shadow-lg rounded-xl overflow-hidden">
          <thead class="bg-indigo-500 text-white">
            <tr>
              <th class="p-3 text-left">#</th>
              <th class="p-3 text-left">Name</th>
              <th class="p-3 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody id="regionsTable" class="divide-y"></tbody>
        </table>
      </div>
    `;

    document.getElementById("btnAddRegion").addEventListener("click", async () => {
      try {
        const name = prompt("Nama region:");
        if (!name) return;
        await apiPost(`${API_BASE}/regions`, { name });
        alert("Region dibuat.");
        renderManageRegions();
      } catch (e) { alert("Gagal buat region: " + e.message); }
    });

    try {
      const regs = await apiGet(`${API_BASE}/regions`);
      const tbody = document.getElementById("regionsTable");
      tbody.innerHTML = regs.map((r, i) => `
        <tr class="hover:bg-indigo-50">
          <td class="p-3">${i+1}</td>
          <td class="p-3">${r.name}</td>
          <td class="p-3">
            <button data-id="${r.id}" class="btnDelRegion px-3 py-1 rounded-md bg-red-400 text-sm">Delete</button>
          </td>
        </tr>
      `).join("");

      document.querySelectorAll(".btnDelRegion").forEach(b => b.addEventListener("click", async (ev) => {
        const id = ev.currentTarget.dataset.id;
        if (!confirm("Hapus region ini?")) return;
        try {
          await apiDelete(`${API_BASE}/regions/${id}`);
          alert("Terhapus.");
          renderManageRegions();
        } catch (e) { alert("Gagal hapus: " + e.message); }
      }));
    } catch (e) {
      alert("Gagal memuat regions: " + e.message);
    }
  }

  /* =====================================================
     PAGE: EXECUTIVE SUMMARY
     ===================================================== */
  async function renderExecutiveReport() {
    pageContent.innerHTML = `
      <div class="max-w-7xl mx-auto space-y-6">
        <h2 class="text-2xl font-bold">🏢 Executive Summary</h2>
        <div id="execSummary" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"></div>
        <div class="chart-container mt-6">
          <canvas id="execChart"></canvas>
        </div>
      </div>
    `;

    try {
      const summary = await apiGet(`${API_BASE}/report/executive`);
      const cards = [
        { title: "Total Tours", value: summary.totalTours, icon: "🧭" },
        { title: "Total Sales", value: summary.totalSales, icon: "💰" },
        { title: "Total Profit", value: summary.totalProfit, icon: "📈" },
        { title: "Total Pax", value: summary.totalPax, icon: "👥" },
      ];

      const execDiv = document.getElementById("execSummary");
      execDiv.innerHTML = cards.map(c => `
        <div class="p-6 rounded-2xl text-white gradient-card shadow-lg">
          <div class="flex items-center justify-between mb-2">
            <span class="text-3xl">${c.icon}</span>
            <span class="text-sm opacity-75">${c.title}</span>
          </div>
          <p class="text-2xl font-bold">${formatNumber(c.value)}</p>
        </div>
      `).join("");

      const ctx = document.getElementById("execChart").getContext("2d");
      if (window._execChart) window._execChart.destroy();
      window._execChart = new Chart(ctx, {
        type: "bar",
        data: { labels: summary.topStaff.map(s => s.username), datasets: [{ label: "Top Staff Sales", data: summary.topStaff.map(s => s.sales), borderWidth: 1 }] },
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
      });
    } catch (e) {
      alert("Gagal memuat executive: " + e.message);
    }
  }

} // end dashboard block

/* =====================================================
   End of file
   ===================================================== */
