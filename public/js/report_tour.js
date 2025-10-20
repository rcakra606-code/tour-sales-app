import * as XLSX from "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm";

const form = document.getElementById("tourForm");
const btnReset = document.getElementById("btnResetForm");
const btnDelete = document.getElementById("btnDelete");
const tableBody = document.querySelector("#tourTable tbody");
const regionSelect = document.getElementById("region");
const searchInput = document.getElementById("searchInput");
const filterMonth = document.getElementById("filterMonth");
const btnExcel = document.getElementById("btnExportExcel");
const btnCSV = document.getElementById("btnExportCSV");
const yearSpan = document.getElementById("year");
if (yearSpan) yearSpan.textContent = new Date().getFullYear();

let tours = [];
let regions = [];

// ===== UTIL =====
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("id-ID") : "-");
const fmtRp = (n) => "Rp " + (Number(n || 0)).toLocaleString("id-ID");
const escapeHtml = (str) =>
  String(str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

// ===== LOAD REGIONS =====
async function loadRegions() {
  try {
    const res = await fetch("/api/regions");
    if (!res.ok) throw new Error("Gagal memuat data region");
    regions = await res.json();
    regionSelect.innerHTML =
      '<option value="">Pilih Region</option>' +
      regions.map((r) => `<option value="${r.name}">${r.name}</option>`).join("");
  } catch (err) {
    console.error(err);
    regionSelect.innerHTML = "<option value=''>Gagal memuat region</option>";
  }
}

// ===== LOAD TOURS =====
async function loadTours() {
  try {
    const res = await fetch("/api/report/tour");
    if (!res.ok) throw new Error("Gagal memuat data tour");
    tours = await res.json();
    renderTable(tours);
  } catch (err) {
    console.error(err);
    tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Gagal memuat data</td></tr>`;
  }
}

// ===== RENDER TABLE =====
function renderTable(data) {
  if (!data || !data.length) {
    tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Tidak ada data</td></tr>`;
    return;
  }

  tableBody.innerHTML = data
    .map(
      (t) => `
      <tr data-id="${t.id}">
        <td><button class="btn-link view-tour" data-id="${t.id}">${escapeHtml(t.lead_passenger)}</button></td>
        <td>${escapeHtml(t.region || "-")}</td>
        <td>${fmtDate(t.departure_date)}</td>
        <td style="text-align:right">${fmtRp(t.tour_price)}</td>
        <td style="text-align:right">${fmtRp(t.sales_amount)}</td>
        <td style="text-align:right">${fmtRp(t.profit_amount)}</td>
        <td>${escapeHtml(t.departure_status)}</td>
      </tr>`
    )
    .join("");

  document.querySelectorAll(".view-tour").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = tours.find((x) => String(x.id) === String(btn.dataset.id));
      if (item) populateForm(item);
    });
  });
}

// ===== POPULATE FORM =====
function populateForm(t) {
  Object.entries(t).forEach(([key, val]) => {
    const el = document.getElementById(key);
    if (el) el.value = val || "";
  });
  form.dataset.id = t.id;
  btnDelete.style.display = "inline-block";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ===== RESET =====
btnReset.addEventListener("click", () => {
  form.reset();
  delete form.dataset.id;
  btnDelete.style.display = "none";
});

// ===== SUBMIT =====
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  const id = form.dataset.id;
  const method = id ? "PUT" : "POST";
  const url = id ? `/api/report/tour/${id}` : `/api/report/tour`;

  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Gagal menyimpan data tour");
    alert("✅ Data tour tersimpan!");
    form.reset();
    btnDelete.style.display = "none";
    loadTours();
  } catch (err) {
    console.error(err);
    alert("❌ Gagal menyimpan data");
  }
});

// ===== DELETE =====
btnDelete.addEventListener("click", async () => {
  const id = form.dataset.id;
  if (!id) return;
  if (!confirm("Yakin ingin menghapus data ini?")) return;
  try {
    const res = await fetch(`/api/report/tour/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Gagal menghapus data");
    alert("✅ Data dihapus!");
    form.reset();
    btnDelete.style.display = "none";
    loadTours();
  } catch (err) {
    console.error(err);
    alert("❌ Gagal menghapus data");
  }
});

// ===== FILTER =====
searchInput.addEventListener("input", applyFilters);
filterMonth.addEventListener("change", applyFilters);

function applyFilters() {
  const q = searchInput.value.trim().toLowerCase();
  const m = filterMonth.value;
  let filtered = tours.slice();

  if (q) {
    filtered = filtered.filter(
      (t) =>
        t.lead_passenger.toLowerCase().includes(q) ||
        (t.region && t.region.toLowerCase().includes(q)) ||
        (t.staff && t.staff.toLowerCase().includes(q))
    );
  }

  if (m) {
    const [y, month] = m.split("-");
    filtered = filtered.filter((t) => {
      const d = new Date(t.departure_date);
      return (
        d.getFullYear() === parseInt(y) && d.getMonth() + 1 === parseInt(month)
      );
    });
  }

  renderTable(filtered);
}

// ===== EXPORT =====
btnExcel.addEventListener("click", () => exportFile("xlsx"));
btnCSV.addEventListener("click", () => exportFile("csv"));

function exportFile(type) {
  if (!tours.length) return alert("Tidak ada data untuk diekspor");
  const ws = XLSX.utils.json_to_sheet(tours);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Tours");
  const filename = `Tours_${new Date().toISOString().slice(0, 10)}.${type}`;
  XLSX.writeFile(wb, filename, { bookType: type });
}

// INIT
await loadRegions();
await loadTours();