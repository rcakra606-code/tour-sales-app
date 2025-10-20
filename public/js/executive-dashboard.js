/**
 * public/js/executive-dashboard.js
 * Executive Dashboard — Charting + Export
 *
 * Expects backend endpoints:
 * - GET /api/dashboard/summary            -> summary + month_breakdown + region_breakdown
 * - GET /api/report/sales?from=...&to=... -> list of sales transactions
 * - GET /api/report/tour?from=...&to=...  -> list of tours (with pax & region)
 * - GET /api/dashboard/targets           -> targets per category or per staff
 *
 * This script renders Chart.js charts, applies date filters, and allows export CSV/XLSX.
 */

const yearSpan = document.getElementById("year");
if (yearSpan) yearSpan.textContent = new Date().getFullYear();

const kpiSales = document.getElementById("kpiSales");
const kpiProfit = document.getElementById("kpiProfit");
const kpiTours = document.getElementById("kpiTours");
const kpiPax = document.getElementById("kpiPax");

const rangeFrom = document.getElementById("rangeFrom");
const rangeTo = document.getElementById("rangeTo");
const groupBy = document.getElementById("groupBy");
const btnApply = document.getElementById("btnApply");
const btnExportCSV = document.getElementById("btnExportCSV");
const btnExportExcel = document.getElementById("btnExportExcel");

// Chart canvases
const ctxSalesProfit = document.getElementById("chartSalesProfit").getContext("2d");
const ctxRegionPax = document.getElementById("chartRegionPax").getContext("2d");
const ctxTopStaff = document.getElementById("chartTopStaff").getContext("2d");
const ctxTargets = document.getElementById("chartTargets").getContext("2d");

let chartSalesProfit = null;
let chartRegionPax = null;
let chartTopStaff = null;
let chartTargets = null;

// helper
const fmtRp = (n) => (isNaN(n) ? "Rp 0" : "Rp " + Number(n).toLocaleString("id-ID"));
const safeDate = (s) => (s ? new Date(s) : null);
const isoDate = (d) => (d ? new Date(d).toISOString() : "");

// fetch summary and render initial charts
async function loadAll(from, to, group = "month") {
  try {
    // summary endpoint
    const sumRes = await fetch("/api/dashboard/summary");
    const summary = sumRes.ok ? await sumRes.json() : null;

    // sales & tours with date filters
    const qs = new URLSearchParams();
    if (from) qs.set("from", from);
    if (to) qs.set("to", to);

    const salesRes = await fetch("/api/report/sales?" + qs.toString());
    const sales = salesRes.ok ? await salesRes.json() : [];

    const tourRes = await fetch("/api/report/tour?" + qs.toString());
    const tours = tourRes.ok ? await tourRes.json() : [];

    const targetsRes = await fetch("/api/dashboard/targets");
    const targets = targetsRes.ok ? await targetsRes.json() : [];

    // KPIs
    const totalSales = sales.reduce((s, x) => s + Number(x.sales_amount || 0), 0);
    const totalProfit = sales.reduce((s, x) => s + Number(x.profit_amount || 0), 0);
    const totalTours = tours.length;
    const totalPax = tours.reduce((s, t) => {
      const pax = t.all_passengers ? t.all_passengers.split(",").filter(Boolean).length : 0;
      // count lead passenger as 1 if present
      return s + pax + (t.lead_passenger ? 1 : 0);
    }, 0);

    kpiSales.textContent = fmtRp(totalSales);
    kpiProfit.textContent = fmtRp(totalProfit);
    kpiTours.textContent = totalTours.toLocaleString("id-ID");
    kpiPax.textContent = totalPax.toLocaleString("id-ID");

    // Prepare data for sales/profit trend (group by month or week)
    const grouped = groupDataBy(sales, group);
    renderSalesProfitChart(grouped.labels, grouped.salesSeries, grouped.profitSeries);

    // Region pax chart
    const regionData = aggregateRegionPax(tours);
    renderRegionPaxChart(regionData.labels, regionData.values);

    // Top staff (by sales)
    const staffData = aggregateTopStaff(sales);
    renderTopStaffChart(staffData.labels, staffData.values);

    // Targets chart
    const targetData = targets.map(t => ({
      label: t.category,
      target: Number(t.target || 0),
      actual: Number(t.actual || 0),
    }));
    renderTargetsChart(targetData);

    // store last loaded raw data for export
    window.__EXECUTIVE_RAW = { sales, tours, targets, summary };
  } catch (err) {
    console.error("Executive dashboard load error:", err);
    alert("Gagal memuat data executive dashboard. Cek console untuk detail.");
  }
}

// Helper: group sales by month or week
function groupDataBy(sales, group = "month") {
  const map = new Map();
  sales.forEach(s => {
    const d = s.transaction_date ? new Date(s.transaction_date) : null;
    if (!d) return;
    let key;
    if (group === "week") {
      const year = d.getFullYear();
      const week = getWeekNumber(d);
      key = `${year}-W${week.toString().padStart(2, "0")}`;
    } else {
      key = `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2, "0")}`;
    }
    if (!map.has(key)) map.set(key, { sales: 0, profit: 0 });
    const cur = map.get(key);
    cur.sales += Number(s.sales_amount || 0);
    cur.profit += Number(s.profit_amount || 0);
  });

  const labels = Array.from(map.keys()).sort();
  const salesSeries = labels.map(k => map.get(k).sales);
  const profitSeries = labels.map(k => map.get(k).profit);
  return { labels, salesSeries, profitSeries };
}

function getWeekNumber(d) {
  const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(),0,1));
  return Math.ceil((((tmp - yearStart) / 86400000) + 1)/7);
}

// Aggregate pax per region
function aggregateRegionPax(tours) {
  const map = new Map();
  tours.forEach(t => {
    const region = t.region || "Unknown";
    const pax = t.all_passengers ? t.all_passengers.split(",").filter(Boolean).length : 0;
    const lead = t.lead_passenger ? 1 : 0;
    const total = pax + lead;
    if (!map.has(region)) map.set(region, 0);
    map.set(region, map.get(region) + total);
  });
  const labels = Array.from(map.keys());
  const values = labels.map(l => map.get(l));
  return { labels, values };
}

// Aggregate top staff by sales
function aggregateTopStaff(sales) {
  const map = new Map();
  sales.forEach(s => {
    const staff = s.staff_name || "Unknown";
    if (!map.has(staff)) map.set(staff, 0);
    map.set(staff, map.get(staff) + Number(s.sales_amount || 0));
  });
  // sort desc and take top 8
  const sorted = Array.from(map.entries()).sort((a,b) => b[1]-a[1]).slice(0,8);
  return { labels: sorted.map(s=>s[0]), values: sorted.map(s=>s[1]) };
}

// Chart rendering functions
function renderSalesProfitChart(labels, salesSeries, profitSeries) {
  if (chartSalesProfit) chartSalesProfit.destroy();
  chartSalesProfit = new Chart(ctxSalesProfit, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { type:'bar', label: 'Sales', data: salesSeries, backgroundColor: 'rgba(11,116,222,0.8)' },
        { type:'line', label: 'Profit', data: profitSeries, borderColor: 'rgba(34,197,94,0.9)', tension:0.2, fill:false }
      ]
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      scales: { y: { beginAtZero: true } }
    }
  });
}

function renderRegionPaxChart(labels, values) {
  if (chartRegionPax) chartRegionPax.destroy();
  chartRegionPax = new Chart(ctxRegionPax, {
    type: 'pie',
    data: { labels, datasets: [{ data: values, backgroundColor: generatePalette(values.length) }]},
    options: { responsive: true }
  });
}

function renderTopStaffChart(labels, values) {
  if (chartTopStaff) chartTopStaff.destroy();
  chartTopStaff = new Chart(ctxTopStaff, {
    type: 'horizontalBar' in Chart.defaults ? 'horizontalBar' : 'bar',
    data: { labels, datasets: [{ label: 'Sales', data: values, backgroundColor: 'rgba(11,116,222,0.8)'}]},
    options: {
      indexAxis: 'y',
      responsive: true,
      scales: { x: { beginAtZero: true } }
    }
  });
}

function renderTargetsChart(targetData) {
  if (chartTargets) chartTargets.destroy();
  const labels = targetData.map(t => t.label);
  const targets = targetData.map(t => t.target);
  const actuals = targetData.map(t => t.actual);
  chartTargets = new Chart(ctxTargets, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Target', data: targets, backgroundColor: 'rgba(155, 155, 155, 0.5)' },
        { label: 'Realisasi', data: actuals, backgroundColor: 'rgba(11,116,222,0.85)' }
      ]
    },
    options: { responsive: true, scales: { y: { beginAtZero: true } } }
  });
}

// color palette
function generatePalette(n) {
  const base = ['#0b74de','#ff8a65','#a19cff','#f6d365','#4aa3ff','#f87171','#34d399','#f59e0b','#60a5fa','#7c3aed'];
  const res = [];
  for (let i=0;i<n;i++) res.push(base[i % base.length]);
  return res;
}

// EXPORT data (CSV / XLSX)
btnExportCSV.addEventListener("click", () => exportExecutive("csv"));
btnExportExcel.addEventListener("click", () => exportExecutive("xlsx"));

function exportExecutive(type = "csv") {
  const raw = window.__EXECUTIVE_RAW || { sales: [], tours: [], targets: [] };
  // create combined workbook with multiple sheets
  const wb = XLSX.utils.book_new();
  const wsSales = XLSX.utils.json_to_sheet(raw.sales || []);
  const wsTours = XLSX.utils.json_to_sheet(raw.tours || []);
  const wsTargets = XLSX.utils.json_to_sheet(raw.targets || []);
  XLSX.utils.book_append_sheet(wb, wsSales, "Sales");
  XLSX.utils.book_append_sheet(wb, wsTours, "Tours");
  XLSX.utils.book_append_sheet(wb, wsTargets, "Targets");
  const filename = `Executive_${new Date().toISOString().slice(0,10)}.${type}`;
  if (type === "csv") {
    // For CSV, export Sales sheet as CSV (common need). Provide ZIPing not included.
    const csv = XLSX.utils.sheet_to_csv(wsSales);
    downloadTextFile(csv, filename.replace('.csv','-sales.csv'));
  } else {
    XLSX.writeFile(wb, filename, { bookType: type });
  }
}

function downloadTextFile(text, filename) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

// Apply button
btnApply.addEventListener("click", () => {
  const from = rangeFrom.value ? new Date(rangeFrom.value).toISOString() : "";
  const to = rangeTo.value ? new Date(rangeTo.value).toISOString() : "";
  const group = groupBy.value || 'month';
  loadAll(from, to, group);
});

// initial load (no filter = all)
loadAll();