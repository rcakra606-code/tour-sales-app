import { apiFetch } from "./api.js";

const tourTable = document.getElementById("tourTable");
const tourForm = document.getElementById("tourForm");
const resetBtn = document.getElementById("resetBtn");
let editId = null;

// ✅ Load semua tour
async function loadTours() {
  const res = await apiFetch("/tours");
  tourTable.innerHTML = "";
  res.tours.forEach(t => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="p-2">${t.title}</td>
      <td class="p-2">${t.description}</td>
      <td class="p-2">Rp ${t.price}</td>
      <td class="p-2">${t.date}</td>
      <td class="p-2 text-center">
        <button onclick="editTour(${t.id})" class="bg-yellow-500 px-2 py-1 rounded text-white">Edit</button>
        <button onclick="deleteTour(${t.id})" class="bg-red-600 px-2 py-1 rounded text-white">Hapus</button>
      </td>`;
    tourTable.appendChild(tr);
  });
}

// ✅ Simpan / Update tour
async function saveTour(e) {
  e.preventDefault();
  const data = {
    title: document.getElementById("title").value,
    description: document.getElementById("description").value,
    price: document.getElementById("price").value,
    date: document.getElementById("date").value,
  };

  try {
    if (editId) {
      await apiFetch(`/tours/${editId}`, "PUT", data);
      editId = null;
    } else {
      await apiFetch("/tours", "POST", data);
    }
    tourForm.reset();
    await loadTours();
  } catch (err) {
    alert(err.message);
  }
}

function editTour(id) {
  editId = id;
  apiFetch(`/tours/${id}`).then(res => {
    document.getElementById("title").value = res.tour.title;
    document.getElementById("description").value = res.tour.description;
    document.getElementById("price").value = res.tour.price;
    document.getElementById("date").value = res.tour.date;
  });
}

async function deleteTour(id) {
  if (confirm("Hapus tour ini?")) {
    await apiFetch(`/tours/${id}`, "DELETE");
    await loadTours();
  }
}

if (tourForm) tourForm.addEventListener("submit", saveTour);
if (resetBtn) resetBtn.addEventListener("click", () => { tourForm.reset(); editId = null; });

export { loadTours, editTour, deleteTour };
