/**
 * public/js/report_tour.js
 * - Works with API endpoints:
 *   GET /api/report/tour         -> list all tours
 *   POST /api/report/tour        -> create tour
 *   PUT  /api/report/tour/:id    -> update tour
 *   DELETE /api/report/tour/:id  -> delete tour
 *   GET /api/regions             -> list regions
 *
 * - Exports via xlsx lib (CDN)
 */

import * as XLSX from "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm";

const tourForm = document.getElementById("tourForm");
const btnResetForm = document.getElementById("btnResetForm");
const btnDelete = document.getElementById("btnDelete");
const searchInput = document.getElementById("searchTour");
const filterMonth = document.getElementById("filterMonth");
const filterRegionSelect = document.getElementById("filterRegion");
const btnExcel = document.getElementById("btnExportExcel");
const btnCSV = document.getElementById("btnExportCSV");
const tableBody = document.querySelector("#tourTable tbody");
const regionList = document.getElementById("regionList");
const regionInput = document.getElementById("region");
const yearSpan = document.getElementById("year");
if (yearSpan) yearSpan.textContent = new Date().getFullYear();

let tours = [];
let regions = [];

// UTIL
const fmtDate = (d) => {
  if (!d) return "-";
  const dt = new Date(d);
  if (isNaN(dt)) return "-";
  return dt.toLocaleDateString("id-ID");
};
const fmtMoney = (n) =>
  "Rp " + (Number(n || 0)).toLocaleString("id-ID");

// LOAD REGIONS
async function loadRegions() {
  try {
    const res = await fetch("/api/regions");
    if (!res.ok) throw new Error("Gagal memuat regions");
    regions = await res.json();
    // fill datalist & filter select
    regionList.innerHTML = regions.map(r => `<option value="${r.name}"></option>`).join("");
    const optsHtml = ['<option value="">Semua Region</option>']
      .concat(regions.map(r => `<option value="${r.name}">${r.name}</option>`))
      .join("");
    filterRegionSelect.innerHTML = optsHtml;
  } catch (err) {
    console.error(err);
  }
}

// LOAD TOURS
async function loadTours() {
  try {
    const res = await fetch("/api/report/tour");
    if (!res.ok) throw new Error("Gagal memuat data tour");
    tours = await res.json();
    renderTable(tours);
  } catch (err) {
    console.error(err);
    tableBody.innerHTML = `<tr><td colspan="9" style="text-align:center;">Gagal memuat data</td></tr>`;
  }
}

// RENDER TABLE
function renderTable(list) {
  if (!list || list.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="9" style="text-align:center;">Tidak ada data</td></tr>`;
    return;
  }

  tableBody.innerHTML = list.map(t => `
    <tr data-id="${t.id || ''}">
      <td>${fmtDate(t.registration_date)}</td>
      <td><button class="btn-link view-lead" data-id="${t.id}">${escapeHtml(t.lead_passenger || '-')}</button></td>
      <td>${escapeHtml(t.tour_code || '-')}</td>
      <td>${escapeHtml(t.region || '-')}</td>
      <td>${fmtDate(t.departure_date)}</td>
      <td>${escapeHtml(t.staff || '-')}</td>
      <td style="text-align:right">${fmtMoney(t.sales_amount)}</td>
      <td style="text-align:right">${fmtMoney(t.profit_amount)}</td>
      <td>${escapeHtml(t.departure_status || '-')}</td>
    </tr>
  `).join("");

  // attach click for view/edit
  document.querySelectorAll(".view-lead").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const id = btn.dataset.id;
      const item = tours.find(x => String(x.id) === String(id));
      if (item) populateForm(item);
    });
  });
}

// POPULATE FORM FOR EDIT
function populateForm(item) {
  // set fields (use ids from form)
  document.getElementById("tourId").value = item.id || "";
  document.getElementById("registrationDate").value = item.registration_date ? item.registration_date.split('T')[0] : "";
  document.getElementById("leadPassenger").value = item.lead_passenger || "";
  document.getElementById("allPassengers").value = item.all_passengers || "";
  document.getElementById("tourCode").value = item.tour_code || "";
  document.getElementById("region").value = item.region || "";
  document.getElementById("departureDate").value = item.departure_date ? item.departure_date.split('T')[0] : "";
  document.getElementById("bookingCode").value = item.booking_code || "";
  document.getElementById("tourPrice").value = item.tour_price || "";
  document.getElementById("discountRemarks").value = item.discount_remarks || "";
  document.getElementById("paymentProof").value = item.payment_proof || "";
  document.getElementById("documentReceived").value = item.document_received ? item.document_received.split('T')[0] : "";
  document.getElementById("visaProcessStart").value = item.visa_process_start ? item.visa_process_start.split('T')[0] : "";
  document.getElementById("visaProcessEnd").value = item.visa_process_end ? item.visa_process_end.split('T')[0] : "";
  document.getElementById("documentRemarks").value = item.document_remarks || "";
  document.getElementById("staff").value = item.staff || "";
  document.getElementById("salesAmount").value = item.sales_amount || "";
  document.getElementById("profitAmount").value = item.profit_amount || "";
  document.getElementById("departureStatus").value = item.departure_status || "PENDING";

  btnDelete.style.display = "inline-block";
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// RESET FORM
function resetForm() {
  tourForm.reset();
  document.getElementById("tourId").value = "";
  btnDelete.style.display = "none";
}

// SUBMIT CREATE/UPDATE
tourForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("tourId").value;
  const payload = Object.fromEntries(new FormData(tourForm).entries());
  // sanitize numeric fields
  payload.tourPrice = Number(payload.tourPrice || 0);
  payload.salesAmount = Number(payload.salesAmount || 0);
  payload.profitAmount = Number(payload.profitAmount || 0);

  try {
    const url = id ? `/api/report/tour/${id}` : `/api/report/tour`;
    const method = id ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Server error');
    }
    alert("✅ Data tersimpan.");
    resetForm();
    await loadTours();
  } catch (err) {
    console.error(err);
    alert("❌ Gagal menyimpan data: " + (err.message || ""));
  }
});

btnResetForm.addEventListener("click", (e) => resetForm());

// DELETE
btnDelete.addEventListener("click", async () => {
  const id = document.getElementById("tourId").value;
  if (!id) return;
  if (!confirm("Yakin ingin menghapus data ini?")) return;
  try {
    const res = await fetch(`/api/report/tour/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Gagal menghapus");
    alert("✅ Data dihapus");
    resetForm();
    await loadTours();
  } catch (err) {
    console.error(err);
    alert("❌ Gagal menghapus: " + (err.message || ""));
  }
});

// FILTER + SEARCH
searchInput.addEventListener("input", applyFilters);
filterMonth.addEventListener("change", applyFilters);
filterRegionSelect.addEventListener("change", applyFilters);

function applyFilters() {
  const q = searchInput.value.trim().toLowerCase();
  const monthVal = filterMonth.value; // YYYY-MM
  const regionVal = filterRegionSelect.value;

  let filtered = tours.slice();

  if (q) {
    filtered = filtered.filter(t => {
      return (t.lead_passenger && t.lead_passenger.toLowerCase().includes(q)) ||
             (t.tour_code && t.tour_code.toLowerCase().includes(q)) ||
             (t.booking_code && t.booking_code.toLowerCase().includes(q));
    });
  }

  if (monthVal) {
    const [y,m] = monthVal.split("-");
    filtered = filtered.filter(t => {
      if (!t.departure_date) return false;
      const dt = new Date(t.departure_date);
      return dt.getFullYear() === Number(y) && (dt.getMonth()+1) === Number(m);
    });
  }

  if (regionVal) {
    filtered = filtered.filter(t => (t.region || "").toLowerCase() === regionVal.toLowerCase());
  }

  renderTable(filtered);
}

// EXPORT
btnExcel.addEventListener("click", () => exportFile("xlsx"));
btnCSV.addEventListener("click", () => exportFile("csv"));

function exportFile(type = "xlsx") {
  if (!tours || tours.length === 0) return alert("Tidak ada data untuk diekspor.");
  // map to safe export format
  const data = tours.map(t => ({
    id: t.id || '',
    registration_date: t.registration_date ? t.registration_date.split('T')[0] : '',
    lead_passenger: t.lead_passenger || '',
    all_passengers: t.all_passengers || '',
    tour_code: t.tour_code || '',
    region: t.region || '',
    departure_date: t.departure_date ? t.departure_date.split('T')[0] : '',
    booking_code: t.booking_code || '',
    tour_price: Number(t.tour_price || 0),
    sales_amount: Number(t.sales_amount || 0),
    profit_amount: Number(t.profit_amount || 0),
    staff: t.staff || '',
    departure_status: t.departure_status || ''
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Tours");
  const filename = `Report_Tours_${new Date().toISOString().slice(0,10)}.${type}`;
  XLSX.writeFile(wb, filename, { bookType: type });
}

// SAFETY: escape HTML when injecting
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// INIT
(async function init() {
  await loadRegions();
  await loadTours();
})();