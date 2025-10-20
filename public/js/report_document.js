import * as XLSX from "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm";

const documentForm = document.getElementById("documentForm");
const btnResetForm = document.getElementById("btnResetForm");
const btnDelete = document.getElementById("btnDelete");
const tableBody = document.querySelector("#documentTable tbody");
const searchInput = document.getElementById("searchInput");
const filterMonth = document.getElementById("filterMonth");
const btnExcel = document.getElementById("btnExportExcel");
const btnCSV = document.getElementById("btnExportCSV");
const yearSpan = document.getElementById("year");
if (yearSpan) yearSpan.textContent = new Date().getFullYear();

let documents = [];

// ===== UTIL =====
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("id-ID") : "-");
const escapeHtml = (str) =>
  String(str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

// ===== LOAD DOCUMENTS =====
async function loadDocuments() {
  try {
    const res = await fetch("/api/report/documents");
    if (!res.ok) throw new Error("Gagal memuat data dokumen");
    documents = await res.json();
    renderTable(documents);
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
      (d) => `
      <tr data-id="${d.id}">
        <td>${fmtDate(d.receive_date)}</td>
        <td><button class="btn-link view-doc" data-id="${d.id}">${escapeHtml(
        d.guest_name
      )}</button></td>
        <td>${escapeHtml(d.booking_code_dms || "-")}</td>
        <td>${escapeHtml(d.tour_code || "-")}</td>
        <td>${escapeHtml(d.remarks || "-")}</td>
      </tr>`
    )
    .join("");

  document.querySelectorAll(".view-doc").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = documents.find((x) => String(x.id) === String(btn.dataset.id));
      if (item) populateForm(item);
    });
  });
}

// ===== POPULATE FORM =====
function populateForm(d) {
  document.getElementById("docId").value = d.id;
  document.getElementById("receiveDate").value = d.receive_date
    ? d.receive_date.split("T")[0]
    : "";
  document.getElementById("guestName").value = d.guest_name || "";
  document.getElementById("bookingCodeDMS").value = d.booking_code_dms || "";
  document.getElementById("tourCode").value = d.tour_code || "";
  document.getElementById("remarks").value = d.remarks || "";
  btnDelete.style.display = "inline-block";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ===== RESET FORM =====
btnResetForm.addEventListener("click", () => {
  documentForm.reset();
  document.getElementById("docId").value = "";
  btnDelete.style.display = "none";
});

// ===== SUBMIT FORM =====
documentForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("docId").value;
  const data = Object.fromEntries(new FormData(documentForm).entries());
  const method = id ? "PUT" : "POST";
  const url = id ? `/api/report/documents/${id}` : `/api/report/documents`;

  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Gagal menyimpan data");
    alert("✅ Data dokumen tersimpan!");
    documentForm.reset();
    btnDelete.style.display = "none";
    loadDocuments();
  } catch (err) {
    console.error(err);
    alert("❌ Gagal menyimpan data dokumen");
  }
});

// ===== DELETE =====
btnDelete.addEventListener("click", async () => {
  const id = document.getElementById("docId").value;
  if (!id) return;
  if (!confirm("Yakin ingin menghapus data ini?")) return;
  try {
    const res = await fetch(`/api/report/documents/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Gagal menghapus");
    alert("✅ Data dihapus");
    documentForm.reset();
    btnDelete.style.display = "none";
    loadDocuments();
  } catch (err) {
    console.error(err);
    alert("❌ Gagal menghapus data");
  }
});

// ===== FILTER & SEARCH =====
searchInput.addEventListener("input", applyFilters);
filterMonth.addEventListener("change", applyFilters);

function applyFilters() {
  const q = searchInput.value.trim().toLowerCase();
  const m = filterMonth.value;
  let filtered = documents.slice();

  if (q) {
    filtered = filtered.filter(
      (d) =>
        d.guest_name.toLowerCase().includes(q) ||
        (d.booking_code_dms && d.booking_code_dms.toLowerCase().includes(q))
    );
  }

  if (m) {
    const [y, month] = m.split("-");
    filtered = filtered.filter((d) => {
      const dt = new Date(d.receive_date);
      return (
        dt.getFullYear() === parseInt(y) && dt.getMonth() + 1 === parseInt(month)
      );
    });
  }

  renderTable(filtered);
}

// ===== EXPORT =====
btnExcel.addEventListener("click", () => exportFile("xlsx"));
btnCSV.addEventListener("click", () => exportFile("csv"));

function exportFile(type) {
  if (!documents.length) return alert("Tidak ada data untuk diekspor");
  const ws = XLSX.utils.json_to_sheet(documents);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Documents");
  const filename = `Documents_${new Date().toISOString().slice(0, 10)}.${type}`;
  XLSX.writeFile(wb, filename, { bookType: type });
}

// INIT
loadDocuments();