/* =====================================================
   APP.JS - FRONTEND CONTROLLER (FINAL BUILD 2025.10)
   ===================================================== */

const API_BASE = "/api";

/* =====================================================
   HELPERS
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
        loader.classList.add("flex", "opacity-100");
      });
    }, 400);
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
   API WRAPPERS (INTEGRATED WITH LOADER)
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
   DASHBOARD MAIN
   ===================================================== */
if (location.pathname.endsWith("dashboard.html")) {
  const logoutBtn = document.getElementById("logoutBtn");
  const userEl = document.getElementById("currentUser");
  const pageContent = document.getElementById("pageContent");
  const sidebar = document.querySelectorAll(".sidebar-item");

  // Verify login
  (async () => {
    const res = await fetch(`${API_BASE}/auth/verify`, { headers: authHeaders() });
    const data = await res.json();
    if (!data.ok) { localStorage.clear(); location.href = "/login.html"; }
    userEl.textContent = `${data.user.name || data.user.username} (${data.user.type})`;
  })();

  logoutBtn.onclick = () => { localStorage.clear(); location.href = "/login.html"; };

  // Dark Mode toggle
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

  sidebar.forEach(b => b.addEventListener("click", () => {
    sidebar.forEach(x => x.classList.remove("active"));
    b.classList.add("active");
  }));
}

/* =====================================================
   REPORT: TOUR
   ===================================================== */
if (location.pathname.endsWith("report_tour.html")) {
  let tours = [];
  let currentPage = 1;
  const perPage = 10;

  async function loadTours() {
    tours = await apiGet(`${API_BASE}/tours`, "Mengambil data tour...");
    renderRegionFilter(tours);
    renderTable();
  }

  function renderRegionFilter(data) {
    const regions = [...new Set(data.map(t => t.region).filter(Boolean))];
    const select = document.getElementById("filterRegion");
    regions.forEach(r => {
      const opt = document.createElement("option");
      opt.value = r;
      opt.textContent = r;
      select.appendChild(opt);
    });
  }

  function renderTable() {
    const table = document.getElementById("tourTable");
    const region = document.getElementById("filterRegion").value.toLowerCase();
    const keyword = document.getElementById("searchTour").value.toLowerCase();

    const filtered = tours.filter(t =>
      (!region || (t.region || "").toLowerCase().includes(region)) &&
      (!keyword || (t.tour_code + t.lead_passenger).toLowerCase().includes(keyword))
    );

    const totalPages = Math.ceil(filtered.length / perPage);
    if (currentPage > totalPages) currentPage = totalPages || 1;

    const start = (currentPage - 1) * perPage;
    const rows = filtered.slice(start, start + perPage);

    table.innerHTML = rows.map(t => `
      <tr class="hover:bg-indigo-50">
        <td class="p-3">${t.tour_code}</td>
        <td class="p-3">${t.lead_passenger}</td>
        <td class="p-3">${t.region}</td>
        <td class="p-3">${formatNumber(t.sales_amount)}</td>
        <td class="p-3">${formatNumber(t.profit_amount)}</td>
        <td class="p-3">${t.pax_count}</td>
      </tr>`).join("");

    document.getElementById("pageInfoTour").textContent = `Halaman ${currentPage} dari ${totalPages || 1}`;
  }

  document.getElementById("filterRegion").onchange = renderTable;
  document.getElementById("searchTour").oninput = renderTable;
  document.getElementById("prevTour").onclick = () => { if (currentPage > 1) { currentPage--; renderTable(); } };
  document.getElementById("nextTour").onclick = () => { currentPage++; renderTable(); };
  loadTours();
}

/* =====================================================
   REPORT: SALES
   ===================================================== */
if (location.pathname.endsWith("report_sales.html")) {
  let sales = [];
  let currentPage = 1;
  const perPage = 10;

  async function loadSales() {
    sales = await apiGet(`${API_BASE}/sales`, "Mengambil data sales...");
    renderMonthFilter(sales);
    renderSalesTable();
  }

  function renderMonthFilter(data) {
    const months = [...new Set(data.map(s => (s.transaction_date || "").substring(0,7)))].filter(Boolean);
    const select = document.getElementById("filterMonth");
    months.forEach(m => {
      const opt = document.createElement("option");
      opt.value = m;
      opt.textContent = m;
      select.appendChild(opt);
    });
  }

  function renderSalesTable() {
    const table = document.getElementById("salesTable");
    const month = document.getElementById("filterMonth").value;
    const keyword = document.getElementById("searchSales").value.toLowerCase();

    const filtered = sales.filter(s =>
      (!month || (s.transaction_date || "").includes(month)) &&
      (!keyword || (s.invoice_number || "").toLowerCase().includes(keyword))
    );

    const totalPages = Math.ceil(filtered.length / perPage);
    if (currentPage > totalPages) currentPage = totalPages || 1;

    const start = (currentPage - 1) * perPage;
    const rows = filtered.slice(start, start + perPage);

    table.innerHTML = rows.map(s => `
      <tr class="hover:bg-indigo-50">
        <td class="p-3">${s.transaction_date}</td>
        <td class="p-3">${s.invoice_number}</td>
        <td class="p-3">${formatNumber(s.sales_amount)}</td>
        <td class="p-3">${formatNumber(s.profit_amount)}</td>
        <td class="p-3">${formatNumber(s.discount_amount)}</td>
      </tr>`).join("");

    document.getElementById("pageInfoSales").textContent = `Halaman ${currentPage} dari ${totalPages || 1}`;
  }

  document.getElementById("filterMonth").onchange = renderSalesTable;
  document.getElementById("searchSales").oninput = renderSalesTable;
  document.getElementById("prevSales").onclick = () => { if (currentPage > 1) { currentPage--; renderSalesTable(); } };
  document.getElementById("nextSales").onclick = () => { currentPage++; renderSalesTable(); };
  loadSales();
}

/* =====================================================
   REPORT: DOCUMENT
   ===================================================== */
if (location.pathname.endsWith("report_document.html")) {
  let docs = [];
  let currentPage = 1;
  const perPage = 10;

  async function loadDocs() {
    docs = await apiGet(`${API_BASE}/documents`, "Mengambil data dokumen...");
    renderDocTable();
  }

  function renderDocTable() {
    const table = document.getElementById("docTable");
    const status = document.getElementById("filterStatus").value.toLowerCase();
    const keyword = document.getElementById("searchDoc").value.toLowerCase();

    const filtered = docs.filter(d =>
      (!status || (d.document_status || "").toLowerCase().includes(status)) &&
      (!keyword || (d.guest_names || "").toLowerCase().includes(keyword))
    );

    const totalPages = Math.ceil(filtered.length / perPage);
    if (currentPage > totalPages) currentPage = totalPages || 1;

    const start = (currentPage - 1) * perPage;
    const rows = filtered.slice(start, start + perPage);

    table.innerHTML = rows.map(d => `
      <tr class="hover:bg-indigo-50">
        <td class="p-3">${d.guest_names}</td>
        <td class="p-3">${d.invoice_number}</td>
        <td class="p-3">${d.process_type}</td>
        <td class="p-3">${d.document_status}</td>
        <td class="p-3">${d.visa_status}</td>
      </tr>`).join("");

    document.getElementById("pageInfoDoc").textContent = `Halaman ${currentPage} dari ${totalPages || 1}`;
  }

  document.getElementById("filterStatus").onchange = renderDocTable;
  document.getElementById("searchDoc").oninput = renderDocTable;
  document.getElementById("prevDoc").onclick = () => { if (currentPage > 1) { currentPage--; renderDocTable(); } };
  document.getElementById("nextDoc").onclick = () => { currentPage++; renderDocTable(); };
  loadDocs();
}
