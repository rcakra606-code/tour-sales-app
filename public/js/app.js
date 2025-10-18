/* =====================================================
   APP.JS - Main Frontend Controller
   Compatible with: server.js + dashboard.html + login.html
   ===================================================== */

const API_BASE = "/api";
const token = localStorage.getItem("token");
const currentPath = window.location.pathname;

/* ---------- Helpers ---------- */
const headers = () => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
});

async function apiGet(url) {
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function apiPost(url, data) {
  const res = await fetch(url, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function apiPut(url, data) {
  const res = await fetch(url, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function apiDelete(url) {
  const res = await fetch(url, { method: "DELETE", headers: headers() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/* =====================================================
   LOGIN PAGE LOGIC
   ===================================================== */
if (currentPath.endsWith("login.html")) {
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

      if (!res.ok) throw new Error("Login gagal, periksa kembali akun Anda.");
      const data = await res.json();

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "/dashboard.html";
    } catch (err) {
      errorBox.textContent = err.message;
      errorBox.classList.remove("hidden");
    }
  });
}

/* =====================================================
   DASHBOARD LOGIC (Protected Page)
   ===================================================== */
if (currentPath.endsWith("dashboard.html")) {
  // ---- Initialization ----
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const logoutBtn = document.getElementById("logoutBtn");
  const currentUser = document.getElementById("currentUser");
  const sidebarButtons = document.querySelectorAll(".sidebar-item");
  const pageContent = document.getElementById("pageContent");

  // Verify auth token
  (async () => {
    const res = await fetch(`${API_BASE}/auth/verify`, { headers: headers() });
    const data = await res.json();
    if (!data.ok) {
      localStorage.clear();
      return (window.location.href = "/login.html");
    }
    if (currentUser) currentUser.textContent = `${data.user.name || data.user.username} (${data.user.type})`;
  })();

  // Logout
  logoutBtn?.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "/login.html";
  });

  // Sidebar navigation
  sidebarButtons.forEach(btn => {
    btn.addEventListener("click", async () => {
      sidebarButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const page = btn.dataset.page;
      await renderPage(page);
    });
  });

  /* =====================================================
     PAGE RENDERER
     ===================================================== */
  async function renderPage(page) {
    switch (page) {
      case "dashboard":
        return renderDashboardTour();
      case "dashboardSales":
        return renderDashboardSales();
      case "reportData":
        return renderReportTours();
      case "reportSales":
        return renderReportSales();
      case "reportDocument":
        return renderReportDocuments();
      case "manageUsers":
        return renderManageUsers();
      case "manageRegions":
        return renderManageRegions();
      case "executive":
        return renderExecutiveReport();
      default:
        pageContent.innerHTML = `<div class='text-gray-500 text-center py-10'>Halaman tidak ditemukan.</div>`;
    }
  }

  /* =====================================================
     PAGE: DASHBOARD TOUR
     ===================================================== */
  async function renderDashboardTour() {
    pageContent.innerHTML = `
      <div class="max-w-7xl mx-auto space-y-6">
        <h2 class="text-2xl font-bold mb-4">📈 Dashboard Tour</h2>
        <div id="tourSummary" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"></div>
        <div class="chart-container mt-8">
          <canvas id="tourChart"></canvas>
        </div>
      </div>
    `;

    const summary = await apiGet(`${API_BASE}/dashboard/summary`);
    const cards = [
      { title: "Total Sales", value: summary.totalSales, icon: "💰", color: "gradient-success" },
      { title: "Total Profit", value: summary.totalProfit, icon: "📊", color: "gradient-info" },
      { title: "Registrants", value: summary.totalRegistrants, icon: "🧾", color: "gradient-card" },
      { title: "Total Pax", value: summary.totalPax, icon: "👥", color: "gradient-warning" },
    ];

    const summaryDiv = document.getElementById("tourSummary");
    summaryDiv.innerHTML = cards.map(c => `
      <div class="p-6 rounded-2xl text-white ${c.color} shadow-lg">
        <div class="flex items-center justify-between mb-2">
          <span class="text-3xl">${c.icon}</span>
          <span class="text-sm opacity-75">${c.title}</span>
        </div>
        <p class="text-2xl font-bold">${formatNumber(c.value)}</p>
      </div>
    `).join("");

    // Chart
    const ctx = document.getElementById("tourChart").getContext("2d");
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: summary.regions.map(r => r.name),
        datasets: [{
          label: "Jumlah Tour per Region",
          data: summary.regions.map(r => r.count),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  /* =====================================================
     PAGE: DASHBOARD SALES
     ===================================================== */
  async function renderDashboardSales() {
    pageContent.innerHTML = `
      <div class="max-w-7xl mx-auto space-y-6">
        <h2 class="text-2xl font-bold mb-4">💰 Dashboard Sales</h2>
        <div id="salesContainer" class="chart-container">
          <canvas id="salesChart"></canvas>
        </div>
      </div>
    `;

    const sales = await apiGet(`${API_BASE}/sales`);
    const grouped = {};

    sales.forEach(s => {
      const ym = s.transaction_date?.substring(0, 7) || "Unknown";
      grouped[ym] = (grouped[ym] || 0) + s.sales_amount;
    });

    const labels = Object.keys(grouped).sort();
    const data = Object.values(grouped);

    const ctx = document.getElementById("salesChart").getContext("2d");
    new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: "Total Penjualan per Bulan",
          data,
          borderWidth: 3,
          fill: true
        }]
      },
      options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });
  }

  /* =====================================================
     PAGE: REPORT TOUR
     ===================================================== */
  async function renderReportTours() {
    pageContent.innerHTML = `
      <div class="max-w-7xl mx-auto space-y-6">
        <h2 class="text-2xl font-bold mb-4">📋 Report Tour</h2>
        <table class="w-full border-collapse text-sm bg-white shadow-lg rounded-xl overflow-hidden">
          <thead class="bg-indigo-500 text-white">
            <tr>
              <th class="p-3 text-left">Tour Code</th>
              <th class="p-3 text-left">Lead Passenger</th>
              <th class="p-3 text-left">Region</th>
              <th class="p-3 text-left">Sales</th>
              <th class="p-3 text-left">Profit</th>
              <th class="p-3 text-left">Pax</th>
              <th class="p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody id="tourTable" class="divide-y"></tbody>
        </table>
      </div>
    `;

    const tours = await apiGet(`${API_BASE}/tours`);
    const tbody = document.getElementById("tourTable");
    tbody.innerHTML = tours.map(t => `
      <tr class="hover:bg-indigo-50">
        <td class="p-3">${t.tour_code}</td>
        <td class="p-3">${t.lead_passenger}</td>
        <td class="p-3">${t.region || '-'}</td>
        <td class="p-3">${formatNumber(t.sales_amount)}</td>
        <td class="p-3">${formatNumber(t.profit_amount)}</td>
        <td class="p-3">${t.pax_count}</td>
        <td class="p-3">${t.departure_status}</td>
      </tr>
    `).join("");
  }

  /* =====================================================
     PAGE: REPORT SALES
     ===================================================== */
  async function renderReportSales() {
    pageContent.innerHTML = `
      <div class="max-w-7xl mx-auto space-y-6">
        <h2 class="text-2xl font-bold mb-4">💼 Report Sales</h2>
        <table class="w-full border-collapse text-sm bg-white shadow-lg rounded-xl overflow-hidden">
          <thead class="bg-indigo-500 text-white">
            <tr>
              <th class="p-3 text-left">Tanggal</th>
              <th class="p-3 text-left">Invoice</th>
              <th class="p-3 text-left">Sales</th>
              <th class="p-3 text-left">Profit</th>
              <th class="p-3 text-left">Discount</th>
            </tr>
          </thead>
          <tbody id="salesTable" class="divide-y"></tbody>
        </table>
      </div>
    `;
    const sales = await apiGet(`${API_BASE}/sales`);
    const tbody = document.getElementById("salesTable");
    tbody.innerHTML = sales.map(s => `
      <tr class="hover:bg-indigo-50">
        <td class="p-3">${s.transaction_date}</td>
        <td class="p-3">${s.invoice_number}</td>
        <td class="p-3">${formatNumber(s.sales_amount)}</td>
        <td class="p-3">${formatNumber(s.profit_amount)}</td>
        <td class="p-3">${formatNumber(s.discount_amount)}</td>
      </tr>
    `).join("");
  }

  /* =====================================================
     PAGE: REPORT DOCUMENT
     ===================================================== */
  async function renderReportDocuments() {
    pageContent.innerHTML = `
      <div class="max-w-7xl mx-auto space-y-6">
        <h2 class="text-2xl font-bold mb-4">📄 Report Dokumen</h2>
        <table class="w-full border-collapse text-sm bg-white shadow-lg rounded-xl overflow-hidden">
          <thead class="bg-indigo-500 text-white">
            <tr>
              <th class="p-3 text-left">Nama Tamu</th>
              <th class="p-3 text-left">No. Invoice</th>
              <th class="p-3 text-left">Jenis Proses</th>
              <th class="p-3 text-left">Status Dokumen</th>
              <th class="p-3 text-left">Status Visa</th>
            </tr>
          </thead>
          <tbody id="docTable" class="divide-y"></tbody>
        </table>
      </div>
    `;
    const docs = await apiGet(`${API_BASE}/documents`);
    const tbody = document.getElementById("docTable");
    tbody.innerHTML = docs.map(d => `
      <tr class="hover:bg-indigo-50">
        <td class="p-3">${d.guest_names}</td>
        <td class="p-3">${d.invoice_number}</td>
        <td class="p-3">${d.process_type}</td>
        <td class="p-3">${d.document_status}</td>
        <td class="p-3">${d.visa_status}</td>
      </tr>
    `).join("");
  }

  /* =====================================================
     PAGE: EXECUTIVE SUMMARY
     ===================================================== */
  async function renderExecutiveReport() {
    pageContent.innerHTML = `
      <div class="max-w-7xl mx-auto space-y-6">
        <h2 class="text-2xl font-bold mb-4">🏢 Executive Summary</h2>
        <div id="execSummary" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"></div>
        <div class="chart-container mt-8">
          <canvas id="execChart"></canvas>
        </div>
      </div>
    `;

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
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: summary.topStaff.map(s => s.username),
        datasets: [{
          label: "Top Staff Sales",
          data: summary.topStaff.map(s => s.sales),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  /* =====================================================
     UTILITIES
     ===================================================== */
  function formatNumber(num) {
    return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(num || 0);
  }
}
