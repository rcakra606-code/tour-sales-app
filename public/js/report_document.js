/**
 * ==========================================================
 * 📁 public/js/report_document.js
 * Travel Dashboard Enterprise v5.0
 * ==========================================================
 * Fitur:
 * - Input dokumen
 * - Filter & search
 * - Export Excel & CSV
 * ==========================================================
 */

import * as XLSX from "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm";

const documentForm = document.getElementById("documentForm");
const searchInput = document.getElementById("searchDocument");
const filterMonth = document.getElementById("filterMonth");
const btnExcel = document.getElementById("btnExportExcel");
const btnCSV = document.getElementById("btnExportCSV");
const tableBody = document.querySelector("#documentTable tbody");
const yearSpan = document.getElementById("year");
yearSpan.textContent = new Date().getFullYear();

let documents = [];

// ====== LOAD DOCUMENTS ======
async function loadDocuments() {
  try {
    const res = await fetch("/api/report/document");
    if (!res.ok) throw new Error("Gagal memuat data dokumen.");
    documents = await res.json();
    renderTable(documents);
  } catch (err) {
    console.error("❌", err.message);
  }
}

// ====== RENDER TABLE ======
function renderTable(data) {
  if (!data || data.length === 0) {
    tableBody.innerHTML =
      "<tr><td colspan='5' style='text-align:center;'>Tidak ada data</td></tr>";
    return;
  }

  tableBody.innerHTML = data
    .map(
      (d) => `
      <tr>
        <td>${formatDate(d.receive_date)}</td>
        <td>${d.guest_name}</td>
        <td>${d.booking_code_dms}</td>
        <td>${d.tour_code || "-"}</td>
        <td>${d.remarks || "-"}</td>
      </tr>`
    )
    .join("");
}

// ====== FILTERING ======
searchInput.addEventListener("input", applyFilters);
filterMonth.addEventListener("change", applyFilters);

function applyFilters() {
  let filtered = documents;
  const search = searchInput.value.trim().toLowerCase();
  const monthValue = filterMonth.value;

  if (search) {
    filtered = filtered.filter(
      (d) =>
        d.guest_name.toLowerCase().includes(search) ||
        d.booking_code_dms.toLowerCase().includes(search) ||
        (d.tour_code && d.tour_code.toLowerCase().includes(search))
    );
  }

  if (monthValue) {
    const [year, month] = monthValue.split("-");
    filtered = filtered.filter((d) => {
      const dt = new Date(d.receive_date);
      return (
        dt.getFullYear() === parseInt(year) &&
        dt.getMonth() + 1 === parseInt(month)
      );
    });
  }

  renderTable(filtered);
}

// ====== EXPORT ======
btnExcel.addEventListener("click", () => exportFile("xlsx"));
btnCSV.addEventListener("click", () => exportFile("csv"));

function exportFile(type) {
  if (documents.length === 0) return alert("Tidak ada data untuk diekspor.");
  const ws = XLSX.utils.json_to_sheet(documents);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Documents");
  const filename = `Report_Documents_${new Date()
    .toISOString()
    .slice(0, 10)}.${type}`;
  XLSX.writeFile(wb, filename, { bookType: type });
}

// ====== FORM SUBMIT ======
documentForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = Object.fromEntries(new FormData(documentForm).entries());
  try {
    const res = await fetch("/api/report/document", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (!res.ok) throw new Error("Gagal menyimpan data dokumen.");
    alert("✅ Data dokumen berhasil disimpan!");
    documentForm.reset();
    loadDocuments();
  } catch (err) {
    console.error(err);
    alert("❌ Gagal menyimpan data dokumen.");
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

// ====== INIT ======
loadDocuments();