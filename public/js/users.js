import * as XLSX from "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm";

const userForm = document.getElementById("userForm");
const btnReset = document.getElementById("btnReset");
const btnDelete = document.getElementById("btnDelete");
const tableBody = document.querySelector("#userTable tbody");
const searchInput = document.getElementById("searchInput");
const filterRole = document.getElementById("filterRole");
const btnExcel = document.getElementById("btnExportExcel");
const btnCSV = document.getElementById("btnExportCSV");
const yearSpan = document.getElementById("year");
if (yearSpan) yearSpan.textContent = new Date().getFullYear();

let users = [];

// ===== UTIL =====
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-";
const escapeHtml = (str) =>
  String(str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

// ===== LOAD USERS =====
async function loadUsers() {
  try {
    const res = await fetch("/api/users");
    if (!res.ok) throw new Error("Gagal memuat data user");
    users = await res.json();
    renderTable(users);
  } catch (err) {
    console.error(err);
    tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Gagal memuat data</td></tr>`;
  }
}

// ===== RENDER TABLE =====
function renderTable(data) {
  if (!data || data.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Tidak ada data</td></tr>`;
    return;
  }

  tableBody.innerHTML = data
    .map(
      (u) => `
      <tr data-id="${u.id}">
        <td><button class="btn-link view-user" data-id="${u.id}">${escapeHtml(u.username)}</button></td>
        <td>${escapeHtml(u.staff_name)}</td>
        <td>${escapeHtml(u.role)}</td>
        <td>${fmtDate(u.created_at)}</td>
      </tr>`
    )
    .join("");

  document.querySelectorAll(".view-user").forEach((btn) =>
    btn.addEventListener("click", () => {
      const item = users.find((x) => String(x.id) === String(btn.dataset.id));
      if (item) populateForm(item);
    })
  );
}

// ===== POPULATE FORM =====
function populateForm(u) {
  document.getElementById("userId").value = u.id;
  document.getElementById("username").value = u.username;
  document.getElementById("staffName").value = u.staff_name || "";
  document.getElementById("password").value = "";
  document.getElementById("role").value = u.role;
  btnDelete.style.display = "inline-block";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ===== RESET FORM =====
btnReset.addEventListener("click", () => {
  userForm.reset();
  document.getElementById("userId").value = "";
  btnDelete.style.display = "none";
});

// ===== SUBMIT =====
userForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("userId").value;
  const data = Object.fromEntries(new FormData(userForm).entries());
  const method = id ? "PUT" : "POST";
  const url = id ? `/api/users/${id}` : `/api/users`;

  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Gagal menyimpan user");
    alert("✅ Data user tersimpan!");
    userForm.reset();
    btnDelete.style.display = "none";
    loadUsers();
  } catch (err) {
    console.error(err);
    alert("❌ Gagal menyimpan user");
  }
});

// ===== DELETE =====
btnDelete.addEventListener("click", async () => {
  const id = document.getElementById("userId").value;
  if (!id) return;
  if (!confirm("Yakin ingin menghapus user ini?")) return;
  try {
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Gagal menghapus");
    alert("✅ User dihapus");
    userForm.reset();
    btnDelete.style.display = "none";
    loadUsers();
  } catch (err) {
    console.error(err);
    alert("❌ Gagal menghapus user");
  }
});

// ===== FILTER & SEARCH =====
searchInput.addEventListener("input", applyFilters);
filterRole.addEventListener("change", applyFilters);

function applyFilters() {
  const q = searchInput.value.trim().toLowerCase();
  const role = filterRole.value;
  let filtered = users.slice();

  if (q) {
    filtered = filtered.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        (u.staff_name && u.staff_name.toLowerCase().includes(q))
    );
  }

  if (role) {
    filtered = filtered.filter((u) => u.role === role);
  }

  renderTable(filtered);
}

// ===== EXPORT =====
btnExcel.addEventListener("click", () => exportFile("xlsx"));
btnCSV.addEventListener("click", () => exportFile("csv"));

function exportFile(type) {
  if (!users.length) return alert("Tidak ada data untuk diekspor");
  const ws = XLSX.utils.json_to_sheet(users);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Users");
  const filename = `Users_${new Date().toISOString().slice(0, 10)}.${type}`;
  XLSX.writeFile(wb, filename, { bookType: type });
}

// INIT
loadUsers();