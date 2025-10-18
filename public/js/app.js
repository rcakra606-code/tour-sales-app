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
async function apiPost(url, data, msg = "Menyimpan data...") {
  showLoader(true, msg);
  try {
    const res = await fetch(url, {
      method: "POST", headers: authHeaders(), body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  } finally {
    showLoader(false);
  }
}

/* =====================================================
   TOAST SYSTEM
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

/* =====================================================
   EXPORT UTILITIES (CSV & EXCEL)
   ===================================================== */
function exportToCSV(filename, rows) {
  if (!rows.length) return showToast("Tidak ada data untuk diekspor.", "info");
  const header = Object.keys(rows[0]);
  const csv = [
    header.join(","),
    ...rows.map(r => header.map(h => `"${(r[h] || "").toString().replace(/"/g, '""')}"`).join(","))
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
  showToast("Data berhasil diekspor ke CSV.", "success");
}

function exportToExcel(filename, rows) {
  if (!rows.length) return showToast("Tidak ada data untuk diekspor.", "info");
  const headers = Object.keys(rows[0]);
  const xmlHeader = `<?xml version="1.0"?>
    <?mso-application progid="Excel.Sheet"?>
    <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
      xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
      <Styles>
        <Style ss:ID="HeaderStyle">
          <Font ss:Bold="1" ss:Color="#FFFFFF"/>
          <Interior ss:Color="#4F81BD" ss:Pattern="Solid"/>
          <Alignment ss:Horizontal="Center"/>
        </Style>
        <Style ss:ID="NumberStyle"><Alignment ss:Horizontal="Right"/><NumberFormat ss:Format="#,##0.00"/></Style>
        <Style ss:ID="TextStyle"><Alignment ss:Horizontal="Left"/></Style>
      </Styles>
      <Worksheet ss:Name="Report"><Table>`;
  const xmlFooter = `</Table></Worksheet></Workbook>`;
  let xmlBody = `<Row>${headers.map(h => `<Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">${h}</Data></Cell>`).join("")}</Row>`;
  for (const row of rows) {
    xmlBody += `<Row>${headers.map(h => {
      const val = row[h] ?? "";
      const isNum = typeof val === "number" || /^[0-9,.]+$/.test(val);
      return `<Cell ss:StyleID="${isNum ? "NumberStyle" : "TextStyle"}"><Data ss:Type="${isNum ? "Number" : "String"}">${val}</Data></Cell>`;
    }).join("")}</Row>`;
  }
  const blob = new Blob([xmlHeader + xmlBody + xmlFooter], { type: "application/vnd.ms-excel" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename.endsWith(".xls") ? filename : `${filename}.xls`;
  link.click();
  URL.revokeObjectURL(link.href);
  showToast("Data berhasil diekspor ke Excel (format profesional).", "success");
}

/* =====================================================
   DASHBOARD PAGE (ROLE & NOTIFICATIONS)
   ===================================================== */
if (location.pathname.endsWith("dashboard.html")) {
  const logoutBtn = document.getElementById("logoutBtn");
  const userEl = document.getElementById("currentUser");
  const notifBadge = document.getElementById("notifBadge");
  const notifBell = document.getElementById("notifBell");
  const sidebar = document.querySelectorAll(".sidebar-item, aside a");

  logoutBtn.onclick = () => { localStorage.clear(); location.href = "/login.html"; };

  // Auth verify + Role based access
  (async () => {
    const res = await fetch(`${API_BASE}/auth/verify`, { headers: authHeaders() });
    const data = await res.json();
    if (!data.ok) { localStorage.clear(); location.href = "/login.html"; return; }

    userEl.textContent = `${data.user.name || data.user.username} (${data.user.type})`;

    // === Role-based Access Control ===
    const role = data.user.type;
    const menuMap = {
      super: ["dashboard", "dashboardSales", "report_tour", "report_sales", "report_document", "manageUsers", "manageRegions", "executive"],
      semi: ["dashboard", "dashboardSales", "report_tour", "report_sales", "report_document", "manageRegions"],
      basic: ["dashboard", "dashboardSales", "report_tour", "report_sales", "report_document"]
    };
    const allowed = menuMap[role] || [];
    sidebar.forEach(el => {
      const label = el.textContent.trim().toLowerCase();
      const key =
        label.includes("tour") && label.includes("report") ? "report_tour" :
        label.includes("sales") && label.includes("report") ? "report_sales" :
        label.includes("dokumen") ? "report_document" :
        label.includes("user") ? "manageUsers" :
        label.includes("region") ? "manageRegions" :
        label.includes("executive") ? "executive" :
        label.includes("sales") && label.includes("dashboard") ? "dashboardSales" :
        "dashboard";
      if (!allowed.includes(key)) el.style.display = "none";
    });
  })();

  // === Realtime Notifications ===
  async function checkNotifications() {
    try {
      const res = await fetch(`${API_BASE}/dashboard/notifications`, { headers: authHeaders() });
      const data = await res.json();
      if (data.total > 0) {
        notifBadge.textContent = data.total;
        notifBadge.classList.remove("hidden");
      } else notifBadge.classList.add("hidden");
    } catch (err) { console.warn("Notif error:", err.message); }
  }
  notifBell.onclick = () => showToast("🔔 Tidak ada notifikasi baru saat ini", "info");
  setInterval(checkNotifications, 10000);
  checkNotifications();
}

/* =====================================================
   REPORT PAGES (TOUR, SALES, DOCUMENT)
   ===================================================== */
function paginate(data, page, perPage) {
  const totalPages = Math.ceil(data.length / perPage);
  if (page > totalPages) page = totalPages || 1;
  const start = (page - 1) * perPage;
  return { rows: data.slice(start, start + perPage), totalPages };
}

/* --- Report Tour --- */
if (location.pathname.endsWith("report_tour.html")) {
  let tours = []; let currentPage = 1; const perPage = 10;
  async function loadTours() {
    tours = await apiGet(`${API_BASE}/tours`, "Mengambil data tour...");
    renderRegionFilter(tours); renderTourTable();
  }
  function renderRegionFilter(data) {
    const regions = [...new Set(data.map(t => t.region).filter(Boolean))];
    const select = document.getElementById("filterRegion");
    regions.forEach(r => select.insertAdjacentHTML("beforeend", `<option value="${r}">${r}</option>`));
  }
  function getFilteredTours() {
    const region = document.getElementById("filterRegion").value.toLowerCase();
    const keyword = document.getElementById("searchTour").value.toLowerCase();
    return tours.filter(t => (!region || (t.region||"").toLowerCase().includes(region)) &&
      (!keyword || (t.tour_code+t.lead_passenger).toLowerCase().includes(keyword)));
  }
  function renderTourTable() {
    const filtered = getFilteredTours(); const { rows, totalPages } = paginate(filtered, currentPage, perPage);
    const table = document.getElementById("tourTable");
    table.innerHTML = rows.map(t => `<tr class='hover:bg-indigo-50'><td class='p-3'>${t.tour_code}</td>
      <td class='p-3'>${t.lead_passenger}</td><td class='p-3'>${t.region}</td>
      <td class='p-3'>${formatNumber(t.sales_amount)}</td><td class='p-3'>${formatNumber(t.profit_amount)}</td>
      <td class='p-3'>${t.pax_count}</td></tr>`).join("");
    document.getElementById("pageInfoTour").textContent = `Halaman ${currentPage} dari ${totalPages || 1}`;
  }
  document.getElementById("filterRegion").onchange = renderTourTable;
  document.getElementById("searchTour").oninput = renderTourTable;
  document.getElementById("prevTour").onclick = () => { if(currentPage>1){currentPage--;renderTourTable();}};
  document.getElementById("nextTour").onclick = () => { currentPage++;renderTourTable();};
  document.getElementById("exportTourCSV").onclick = () => exportToCSV("report_tour.csv", getFilteredTours());
  document.getElementById("exportTourXLSX").onclick = () => exportToExcel("report_tour.xls", getFilteredTours());
  loadTours();
}

/* --- Report Sales --- */
if (location.pathname.endsWith("report_sales.html")) {
  let sales=[];let currentPage=1;const perPage=10;
  async function loadSales(){sales=await apiGet(`${API_BASE}/sales`,"Mengambil data sales...");renderMonthFilter(sales);renderSalesTable();}
  function renderMonthFilter(data){const months=[...new Set(data.map(s=>(s.transaction_date||"").substring(0,7)))].filter(Boolean);
    const select=document.getElementById("filterMonth");months.forEach(m=>select.insertAdjacentHTML("beforeend",`<option value="${m}">${m}</option>`));}
  function getFilteredSales(){const m=document.getElementById("filterMonth").value;const k=document.getElementById("searchSales").value.toLowerCase();
    return sales.filter(s=>(!m||(s.transaction_date||"").includes(m))&&(!k||(s.invoice_number||"").toLowerCase().includes(k)));}
  function renderSalesTable(){const f=getFilteredSales();const{rows,totalPages}=paginate(f,currentPage,perPage);
    document.getElementById("salesTable").innerHTML=rows.map(s=>`<tr class='hover:bg-indigo-50'><td class='p-3'>${s.transaction_date}</td>
    <td class='p-3'>${s.invoice_number}</td><td class='p-3'>${formatNumber(s.sales_amount)}</td>
    <td class='p-3'>${formatNumber(s.profit_amount)}</td><td class='p-3'>${formatNumber(s.discount_amount)}</td></tr>`).join("");
    document.getElementById("pageInfoSales").textContent=`Halaman ${currentPage} dari ${totalPages||1}`;}
  document.getElementById("filterMonth").onchange=renderSalesTable;
  document.getElementById("searchSales").oninput=renderSalesTable;
  document.getElementById("prevSales").onclick=()=>{if(currentPage>1){currentPage--;renderSalesTable();}};
  document.getElementById("nextSales").onclick=()=>{currentPage++;renderSalesTable();};
  document.getElementById("exportSalesCSV").onclick=()=>exportToCSV("report_sales.csv",getFilteredSales());
  document.getElementById("exportSalesXLSX").onclick=()=>exportToExcel("report_sales.xls",getFilteredSales());
  loadSales();
}

/* --- Report Document --- */
if (location.pathname.endsWith("report_document.html")) {
  let docs=[];let currentPage=1;const perPage=10;
  async function loadDocs(){docs=await apiGet(`${API_BASE}/documents`,"Mengambil data dokumen...");renderDocTable();}
  function getFilteredDocs(){const s=document.getElementById("filterStatus").value.toLowerCase();const k=document.getElementById("searchDoc").value.toLowerCase();
    return docs.filter(d=>(!s||(d.document_status||"").toLowerCase().includes(s))&&(!k||(d.guest_names||"").toLowerCase().includes(k)));}
  function renderDocTable(){const f=getFilteredDocs();const{rows,totalPages}=paginate(f,currentPage,perPage);
    document.getElementById("docTable").innerHTML=rows.map(d=>`<tr class='hover:bg-indigo-50'><td class='p-3'>${d.guest_names}</td>
    <td class='p-3'>${d.invoice_number}</td><td class='p-3'>${d.process_type}</td>
    <td class='p-3'>${d.document_status}</td><td class='p-3'>${d.visa_status}</td></tr>`).join("");
    document.getElementById("pageInfoDoc").textContent=`Halaman ${currentPage} dari ${totalPages||1}`;}
  document.getElementById("filterStatus").onchange=renderDocTable;
  document.getElementById("searchDoc").oninput=renderDocTable;
  document.getElementById("prevDoc").onclick=()=>{if(currentPage>1){currentPage--;renderDocTable();}};
  document.getElementById("nextDoc").onclick=()=>{currentPage++;renderDocTable();};
  document.getElementById("exportDocCSV").onclick=()=>exportToCSV("report_document.csv",getFilteredDocs());
  document.getElementById("exportDocXLSX").onclick=()=>exportToExcel("report_document.xls",getFilteredDocs());
  loadDocs();
}
