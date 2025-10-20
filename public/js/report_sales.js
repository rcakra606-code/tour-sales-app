import * as XLSX from "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm";

const salesForm = document.getElementById("salesForm");
const targetForm = document.getElementById("targetForm");
const tableBody = document.querySelector("#salesTable tbody");
const searchInput = document.getElementById("searchInput");
const filterMonth = document.getElementById("filterMonth");
const btnExcel = document.getElementById("btnExportExcel");
const btnCSV = document.getElementById("btnExportCSV");
const btnDelete = document.getElementById("btnDelete");
const yearSpan = document.getElementById("year");
if (yearSpan) yearSpan.textContent = new Date().getFullYear();

let sales = [];

// ===== UTILITIES =====
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("id-ID") : "-");
const fmtRp = (n) => "Rp " + (Number(n || 0)).toLocaleString("id-ID");

// ===== LOAD SALES =====
async function loadSales() {
  try {
    const res = await fetch("/api/report/sales");
    if (!res.ok) throw new Error("Gagal memuat data sales");
    sales = await res.json();
    renderTable(sales);
  } catch (err) {
    console.error(err);
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Gagal memuat data</td></tr>`;
  }
}

// ===== RENDER TABLE =====
function renderTable(data) {
  if (!data || data.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Tidak ada data</td></tr>`;
    return;
  }

  tableBody.innerHTML = data
    .map(
      (s) => `
      <tr data-id="${s.id}">
        <td>${fmtDate(s.transaction_date)}</td>
        <td>${s.invoice_number || "-"}</td>
        <td>${s.staff_name || "-"}</td>
        <td style="text-align:right">${fmtRp(s.sales_amount)}</td>
        <td style="text-align:right">${fmtRp(s.profit_amount)}</td>
      </tr>`
    )
    .join("");
}

// ===== FORM SUBMIT =====
salesForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(salesForm).entries());
  const id = data.id;
  const method = id ? "PUT" : "POST";
  const url = id ? `/api/report/sales/${id}` : `/api/report/sales`;

  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Gagal menyimpan data");
    alert("✅ Data sales tersimpan!");
    salesForm.reset();
    btnDelete.style.display = "none";
    loadSales();
  } catch (err) {
    console.error(err);
    alert("❌ Gagal menyimpan data");
  }
});

// ===== TARGET FORM =====
targetForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(targetForm).entries());
  try {
    const res = await fetch("/api/report/targets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Gagal menyimpan target");
    alert("✅ Target per staff tersimpan!");
    targetForm.reset();
  } catch (err) {
    console.error(err);
    alert("❌ Gagal menyimpan target");
  }
});

// ===== FILTER & SEARCH =====
searchInput.addEventListener("input", applyFilters);
filterMonth.addEventListener("change", applyFilters);

function applyFilters() {
  const q = searchInput.value.trim().toLowerCase();
  const m = filterMonth.value;
  let filtered = sales.slice();

  if (q) {
    filtered = filtered.filter(
      (s) =>
        s.staff_name.toLowerCase().includes(q) ||
        (s.invoice_number && s.invoice_number.toLowerCase().includes(q))
    );
  }

  if (m) {
    const [y, month] = m.split("-");
    filtered = filtered.filter((s) => {
      const d = new Date(s.transaction_date);
      return (
        d.getFullYear() === parseInt(y) &&
        d.getMonth() + 1 === parseInt(month)
      );
    });
  }

  renderTable(filtered);
}

// ===== EXPORT =====
btnExcel.addEventListener("click", () => exportFile("xlsx"));
btnCSV.addEventListener("click", () => exportFile("csv"));

function exportFile(type) {
  if (!sales.length) return alert("Tidak ada data untuk diekspor");
  const ws = XLSX.utils.json_to_sheet(sales);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sales");
  const filename = `Sales_Report_${new Date().toISOString().slice(0, 10)}.${type}`;
  XLSX.writeFile(wb, filename, { bookType: type });
}

// INIT
loadSales();