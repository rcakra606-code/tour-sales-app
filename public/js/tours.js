// public/js/tours.js
import { apiGet, apiPost, apiPut, apiDelete } from "./api.js";

const tableBody = document.getElementById("tourTableBody");
const form = document.getElementById("tourForm");
const resetBtn = document.getElementById("resetBtn");

const idInput = document.getElementById("tourId");
const titleInput = document.getElementById("title");
const descInput = document.getElementById("description");
const priceInput = document.getElementById("price");
const dateInput = document.getElementById("date");
const locationInput = document.getElementById("location");

// ==============================
// Toast helper
// ==============================
function showToast(msg, type = "success") {
  const div = document.createElement("div");
  div.textContent = msg;
  div.className = `fixed top-4 right-4 px-4 py-2 rounded text-white z-50 ${type === "error" ? "bg-red-500" : "bg-green-600"}`;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}

// ==============================
// Load semua tours
// ==============================
async function loadTours() {
  try {
    const data = await apiGet("/tours");
    if (!data.success) return showToast(data.message || "Gagal load tours", "error");

    tableBody.innerHTML = "";
    data.data.forEach(t => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${t.title}</td>
        <td>${t.description || "-"}</td>
        <td>${t.price?.toLocaleString("id-ID") || 0}</td>
        <td>${t.date || "-"}</td>
        <td>${t.location || "-"}</td>
        <td>
          <button onclick="editTour(${t.id})" class="text-blue-500">Edit</button>
          <button onclick="deleteTour(${t.id})" class="text-red-500">Hapus</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  } catch (err) {
    showToast(err.message, "error");
  }
}

// ==============================
// Submit Form
// ==============================
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = {
    title: titleInput.value.trim(),
    description: descInput.value.trim(),
    price: parseFloat(priceInput.value),
    date: dateInput.value,
    location: locationInput.value.trim(),
  };

  try {
    let res;
    if (idInput.value) {
      res = await apiPut(`/tours/${idInput.value}`, payload);
    } else {
      res = await apiPost("/tours", payload);
    }

    if (!res.success) return showToast(res.message || "Gagal simpan", "error");

    showToast(res.message || "Berhasil disimpan");
    form.reset();
    idInput.value = "";
    loadTours();
  } catch (err) {
    showToast(err.message, "error");
  }
});

// ==============================
// Edit Tour
// ==============================
window.editTour = async (id) => {
  try {
    const res = await apiGet(`/tours/${id}`);
    if (!res.success) return showToast(res.message, "error");

    const t = res.data;
    idInput.value = t.id;
    titleInput.value = t.title;
    descInput.value = t.description;
    priceInput.value = t.price;
    dateInput.value = t.date;
    locationInput.value = t.location;
    showToast("Mode edit aktif");
  } catch (err) {
    showToast(err.message, "error");
  }
};

// ==============================
// Delete Tour
// ==============================
window.deleteTour = async (id) => {
  if (!confirm("Yakin ingin menghapus tour ini?")) return;
  try {
    const res = await apiDelete(`/tours/${id}`);
    if (!res.success) return showToast(res.message, "error");
    showToast(res.message || "Tour dihapus");
    loadTours();
  } catch (err) {
    showToast(err.message, "error");
  }
};

// ==============================
// Reset Form
// ==============================
resetBtn.addEventListener("click", () => {
  form.reset();
  idInput.value = "";
  showToast("Form direset");
});

// ==============================
// Inisialisasi
// ==============================
document.addEventListener("DOMContentLoaded", loadTours);
