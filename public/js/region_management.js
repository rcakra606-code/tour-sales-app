import * as XLSX from "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm";

const form = document.getElementById("regionForm");
const btnReset = document.getElementById("btnReset");
const btnDelete = document.getElementById("btnDelete");
const tableBody = document.querySelector("#regionTable tbody");
const searchInput = document.getElementById("searchRegion");
const btnExcel = document.getElementById("btnExportExcel");
const btnCSV = document.getElementById("btnExportCSV");
const yearSpan = document.getElementById("year");
if (yearSpan) yearSpan.textContent = new Date().getFullYear();

let regions = [];

// UTIL
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-";
const escapeHtml = (s) =>
  String(s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

// LOAD REGIONS
async function loadRegions() {
  try {
    const res = await fetch("/api/regions");
    if (!res.ok) throw new Error("Gagal memuat data region");
    regions = await res.json();
    renderTable(regions);
  } catch (err) {
    console.error(err);
    tableBody.innerHTML = `<tr><td colspan="3" style="text-align:center;">Gagal memuat data</td></tr>`;
  }
}

// RENDER TABLE
function renderTable(data) {
  if (!data.length) {
    tableBody.innerHTML = `<tr><td colspan="3" style="text-align:center;">Tidak ada data</td></tr>`;
    return;
  }

  tableBody.innerHTML = data
    .map(
      (r) => `
      <tr data-id="${r.id}">
        <td><button class="btn-link view-region" data-id="${r.id}">${escapeHtml(r.name)}</button></td>
        <td>${escapeHtml(r.code || "-")}</td>
        <td>${fmtDate(r.created_at)}</td>
      </tr>`
    )
    .join("");

  document.querySelectorAll(".view-region").forEach((btn) =>
    btn.addEventListener("click", () => {
      const item = regions.find((x) => String(x.id) === String(btn.dataset.id));
      if (item) populateForm(item);
    })
  );
}

// POPULATE FORM
function populateForm(r) {
  document.getElementById("regionId").value = r.id;
  document.getElementById("regionName").value = r.name;
  document.getElementById("regionCode").value = r.code || "";
  btnDelete.style.display = "inline-block";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// RESET FORM
btnReset.addEventListener("click", () => {
  form.reset();
  document.getElementById("regionId").value = "";
  btnDelete.style.display = "none";
});

// SUBMIT FORM
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("regionId").value;
  const data = Object.fromEntries(new FormData(form).entries());
  const url = id ? `/api/regions/${id}` : `/api/regions`;
  const method = id ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Gagal menyimpan region");
    alert("✅ Region tersimpan!");
    form.reset();
    btnDelete.style.display = "none";
    loadRegions();
  } catch (err) {
    console.error(err);
    alert("❌ Gagal menyimpan region");
  }
});

// DELETE
btnDelete.addEventListener("click", async () => {
  const id = document.getElementById("regionId").value;
  if (!id) return;
  if (!confirm("Yakin ingin menghapus region ini?")) return;
  try {
    const res = await fetch(`/api/regions/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Gagal menghapus");
    alert("✅ Region dihapus");
    form.reset();
    btnDelete.style.display = "none";
    loadRegions();
  } catch (err) {
    console.error(err);
    alert("❌ Gagal menghapus region");
  }
});

// SEARCH
searchInput.addEventListener("input", () => {
  const q = searchInput.value.trim().toLowerCase();
  const filtered = regions.filter(
    (r) =>
      r.name.toLowerCase().includes(q) ||
      (r.code && r.code.toLowerCase().includes(q))
  );
  renderTable(filtered);
});

// EXPORT
btnExcel.addEventListener("click", () => exportFile("xlsx"));
btnCSV.addEventListener("click", () => exportFile("csv"));

function exportFile(type) {
  if (!regions.length) return alert("Tidak ada data untuk diekspor");
  const ws = XLSX.utils.json_to_sheet(regions);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Regions");
  const filename = `Regions_${new Date().toISOString().slice(0, 10)}.${type}`;
  XLSX.writeFile(wb, filename, { bookType: type });
}

// INIT
loadRegions();