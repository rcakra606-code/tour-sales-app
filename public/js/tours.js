// public/js/tours.js
import { apiGet, apiPost, apiPut, apiDelete } from "./api.js";

const token = localStorage.getItem("token");
if (!token) console.warn("Token not found, tour API will fail");

const form = document.getElementById("tourForm");
const resetBtn = document.getElementById("resetBtn");
const tableBody = document.getElementById("tourTable");

const idInput = document.getElementById("tourId");
const titleInput = document.getElementById("title");
const descInput = document.getElementById("description");
const priceInput = document.getElementById("price");
const dateInput = document.getElementById("date");

// =====================
// ✅ Load Tours
// =====================
export async function loadTours() {
  const data = await apiGet("/tours", token);
  tableBody.innerHTML = "";
  if (!data.success) return console.error("Gagal load tours");

  data.tours.forEach(t => {
    const tr = document.createElement("tr");
    tr.className = "border-b";
    tr.innerHTML = `
      <td class="p-2">${t.title}</td>
      <td class="p-2">${t.description || "-"}</td>
      <td class="p-2">Rp ${t.price?.toLocaleString("id-ID")}</td>
      <td class="p-2">${t.date || "-"}</td>
      <td class="p-2 text-center">
        <button onclick="editTour(${t.id})" class="text-blue-500 hover:underline">Edit</button>
        <button onclick="deleteTour(${t.id})" class="text-red-500 hover:underline ml-2">Hapus</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

// =====================
// ✅ Create/Update Tour
// =====================
async function handleFormSubmit(e) {
  e.preventDefault();
  const id = idInput.value;
  const payload = {
    title: titleInput.value.trim(),
    description: descInput.value.trim(),
    price: parseFloat(priceInput.value),
    date: dateInput.value
  };

  let data;
  if (id) {
    data = await apiPut(`/tours/${id}`, payload, token);
  } else {
    data = await apiPost("/tours", payload, token);
  }

  if (data.success) {
    form.reset();
    idInput.value = "";
    loadTours();
    alert(data.message || "Berhasil disimpan");
  } else {
    alert(data.message || "Gagal menyimpan");
  }
}

form.addEventListener("submit", handleFormSubmit);

// =====================
// ✅ Edit Tour
// =====================
window.editTour = async (id) => {
  const data = await apiGet(`/tours/${id}`, token);
  if (!data.success) return alert("Gagal load tour");

  const t = data.tour;
  idInput.value = t.id;
  titleInput.value = t.title;
  descInput.value = t.description;
  priceInput.value = t.price;
  dateInput.value = t.date;
};

// =====================
// ✅ Delete Tour
// =====================
window.deleteTour = async (id) => {
  if (!confirm("Yakin ingin menghapus tour ini?")) return;
  const data = await apiDelete(`/tours/${id}`, token);
  if (data.success) {
    loadTours();
    alert("Tour dihapus");
  } else {
    alert(data.message || "Gagal menghapus tour");
  }
};

// =====================
// ✅ Reset Form
// =====================
resetBtn.addEventListener("click", () => {
  form.reset();
  idInput.value = "";
});
