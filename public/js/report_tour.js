/**
 * ==========================================================
 * 📁 public/js/report_tour.js
 * Travel Dashboard Enterprise v5.0
 * ==========================================================
 * Fitur:
 * - CRUD input Tour
 * - Search, Filter Bulan/Tahun
 * - Export Excel & CSV
 * ==========================================================
 */

import * as XLSX from "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm";

const tourForm = document.getElementById("tourForm");
const searchInput = document.getElementById("searchTour");
const filterMonth = document.getElementById("filterMonth");
const tableBody = document.querySelector("#tourTable tbody");
const btnExcel = document.getElementById("btnExportExcel");
const btnCSV = document.getElementById("btnExportCSV");
const yearSpan = document.getElementById("year");
yearSpan.textContent = new Date().getFullYear();

let tours = [];

// ====== LOAD TOURS ======
async function loadTours() {
  try {
    const res = await fetch("/api/report/tour");
    if (!res.ok) throw new Error("Gagal mengambil data");
    tours = await res.json();
    renderTable(tours);
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

// ====== RENDER TABLE ======
function renderTable(data) {
  if (!data || data.length === 0) {
    tableBody.innerHTML =
      "<tr><td colspan='8' style='text-align:center;'>Tidak ada data</td></tr>";
    return;
  }

  tableBody.innerHTML = data
    .map(
      (t) => `
      <tr>
        <td>${formatDate(t.departure_date)}</td>
        <td>${t.lead_passenger}</td>
        <td>${t.tour_code}</td>
        <td>${t.region || "-"}</td>
        <td>${t.staff}</td>
        <td>${formatRupiah(t.sales_amount)}</td>
        <td>${formatRupiah(t.profit_amount)}</td>
        <td>${t.departure_status}</td>
      </tr>`
    )
    .join("");
}

// ====== FILTERS ======
searchInput.addEventListener("input", applyFilters);
filterMonth.addEventListener("change", applyFilters);

function applyFilters() {
  let filtered = tours;
  const search = searchInput.value.trim().toLowerCase();
  const monthValue = filterMonth.value;

  if (search) {
    filtered = filtered.filter(
      (t) =>
        t.lead_passenger.toLowerCase().includes(search) ||
        (t.tour_code && t.tour_code.toLowerCase().includes(search)) ||
        (t.booking_code && t.booking_code.toLowerCase().includes(search))
    );
  }

  if (monthValue) {
    const [year, month] = monthValue.split("-");
    filtered = filtered.filter((t) => {
      const d = new Date(t.departure_date);
      return (
        d.getFullYear() === parseInt(year) && d.getMonth() + 1 === parseInt(month)
      );
    });
  }

  renderTable(filtered);
}

// ====== EXPORT ======
btnExcel.addEventListener("click", () => exportFile("xlsx"));
btnCSV.addEventListener("click", () => exportFile("csv"));

function exportFile(type) {
  if (tours.length === 0) return alert("Tidak ada data untuk diekspor.");
  const ws = XLSX.utils.json_to_sheet(tours);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Tours");
  const filename = `Report_Tours_${new Date().toISOString().slice(0, 10)}.${type}`;
  XLSX.writeFile(wb, filename, { bookType: type });
}

// ====== FORM SUBMIT ======
tourForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = Object.fromEntries(new FormData(tourForm).entries());
  try {
    const res = await fetch("/api/report/tour", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (!res.ok) throw new Error("Gagal menyimpan data.");
    alert("✅ Data tour berhasil disimpan!");
    tourForm.reset();
    loadTours();
  } catch (err) {
    console.error(err);
    alert("❌ Gagal menyimpan data.");
  }
});

// ====== HELPERS ======
function formatDate(d) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatRupiah(n) {
  return "Rp " + (Number(n) || 0).toLocaleString("id-ID");
}

// ====== INIT ======
loadTours();