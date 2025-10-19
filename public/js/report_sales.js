/**
 * ==========================================================
 * 📁 public/js/report_sales.js
 * Travel Dashboard Enterprise v5.0
 * ==========================================================
 */

import * as XLSX from "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm";

// ====== ELEMENTS ======
const searchInput = document.getElementById("searchInput");
const filterMonth = document.getElementById("filterMonth");
const btnExcel = document.getElementById("btnExportExcel");
const btnCSV = document.getElementById("btnExportCSV");
const tableBody = document.querySelector("#salesTable tbody");
const yearSpan = document.getElementById("year");
yearSpan.textContent = new Date().getFullYear();

let allSales = [];

// ====== LOAD SALES DATA ======
async function loadSales() {
  try {
    const res = await fetch("/api/report/sales");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    allSales = await res.json();
    renderTable(allSales);
  } catch (err) {
    console.error("❌ Gagal memuat data sales:", err);
  }
}

// ====== RENDER TABLE ======
function renderTable(data) {
  if (!data || data.length === 0) {
    tableBody.innerHTML =
      "<tr><td colspan='4' style='text-align:center;'>Tidak ada data</td></tr>";
    return;
  }

  tableBody.innerHTML = data
    .map(
      (row) => `
      <tr>
        <td>${formatDate(row.transaction_date)}</td>
        <td>${row.staff_name}</td>
        <td>${formatRupiah(row.sales_amount)}</td>
        <td>${formatRupiah(row.profit_amount)}</td>
      </tr>`
    )
    .join("");
}

// ====== FILTERING ======
searchInput.addEventListener("input", applyFilters);
filterMonth.addEventListener("change", applyFilters);

function applyFilters() {
  let filtered = allSales;

  const search = searchInput.value.trim().toLowerCase();
  const monthValue = filterMonth.value; // format: YYYY-MM

  if (search) {
    filtered = filtered.filter((d) =>
      d.staff_name.toLowerCase().includes(search)
    );
  }

  if (monthValue) {
    const [year, month] = monthValue.split("-");
    filtered = filtered.filter((d) => {
      const date = new Date(d.transaction_date);
      return (
        date.getFullYear() === parseInt(year) &&
        date.getMonth() + 1 === parseInt(month)
      );
    });
  }

  renderTable(filtered);
}

// ====== EXPORT ======
btnExcel.addEventListener("click", () => exportFile("xlsx"));
btnCSV.addEventListener("click", () => exportFile("csv"));

function exportFile(type = "xlsx") {
  if (allSales.length === 0) return alert("Tidak ada data untuk diekspor.");
  const worksheet = XLSX.utils.json_to_sheet(allSales);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Data");
  const filename = `Sales_Report_${new Date().toISOString().slice(0, 10)}.${type}`;
  if (type === "xlsx") {
    XLSX.writeFile(workbook, filename);
  } else {
    XLSX.writeFile(workbook, filename, { bookType: "csv" });
  }
  alert(`✅ Data berhasil diekspor ke ${filename}`);
}

// ====== HELPERS ======
function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return "-";
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatRupiah(num) {
  if (!num) return "Rp 0";
  return "Rp " + Number(num).toLocaleString("id-ID");
}

// ====== INIT ======
loadSales();