/**
 * ==========================================================
 * 📁 public/js/users.js
 * Travel Dashboard Enterprise v5.0
 * ==========================================================
 * Fitur:
 * - Tambah user baru
 * - Tampilkan daftar user
 * - Search & Export
 * ==========================================================
 */

import * as XLSX from "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm";

const userForm = document.getElementById("userForm");
const tableBody = document.querySelector("#userTable tbody");
const searchInput = document.getElementById("searchUser");
const btnExcel = document.getElementById("btnExportExcel");
const btnCSV = document.getElementById("btnExportCSV");
const yearSpan = document.getElementById("year");
if (yearSpan) yearSpan.textContent = new Date().getFullYear();

let users = [];

// ====== LOAD USERS ======
async function loadUsers() {
  try {
    const res = await fetch("/api/users");
    if (!res.ok) throw new Error("Gagal mengambil data user");
    users = await res.json();
    renderTable(users);
  } catch (err) {
    console.error("❌", err.message);
  }
}

// ====== RENDER TABLE ======
function renderTable(data) {
  if (!data || data.length === 0) {
    tableBody.innerHTML =
      "<tr><td colspan='4' style='text-align:center;'>Tidak ada data user</td></tr>";
    return;
  }

  tableBody.innerHTML = data
    .map(
      (u) => `
      <tr>
        <td>${u.username}</td>
        <td>${u.staff_name || "-"}</td>
        <td>${capitalize(u.role)}</td>
        <td>${formatDate(u.created_at)}</td>
      </tr>`
    )
    .join("");
}

// ====== FORM SUBMIT ======
userForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = Object.fromEntries(new FormData(userForm).entries());

  try {
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (!res.ok) throw new Error("Gagal menyimpan user");
    alert("✅ User berhasil disimpan!");
    userForm.reset();
    loadUsers();
  } catch (err) {
    console.error(err);
    alert("❌ Gagal menyimpan user");
  }
});

// ====== SEARCH FILTER ======
searchInput.addEventListener("input", () => {
  const q = searchInput.value.trim().toLowerCase();
  const filtered = users.filter(
    (u) =>
      u.username.toLowerCase().includes(q) ||
      (u.staff_name && u.staff_name.toLowerCase().includes(q))
  );
  renderTable(filtered);
});

// ====== EXPORT ======
btnExcel.addEventListener("click", () => exportFile("xlsx"));
btnCSV.addEventListener("click", () => exportFile("csv"));

function exportFile(type) {
  if (users.length === 0) return alert("Tidak ada data untuk diekspor.");
  const ws = XLSX.utils.json_to_sheet(users);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Users");
  const filename = `Users_${new Date().toISOString().slice(0, 10)}.${type}`;
  XLSX.writeFile(wb, filename, { bookType: type });
}

// ====== HELPERS ======
function formatDate(d) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// ====== INIT ======
loadUsers();