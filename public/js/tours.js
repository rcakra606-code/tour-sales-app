const token = localStorage.getItem("token");
const headers = { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };

const form = document.getElementById("tourForm");
const resetBtn = document.getElementById("resetBtn");
const tableBody = document.getElementById("tourTable");
const idInput = document.getElementById("tourId");
const titleInput = document.getElementById("title");
const descInput = document.getElementById("description");
const priceInput = document.getElementById("price");
const dateInput = document.getElementById("date");

// ==========================
// ✅ Utility Toast
// ==========================
function showToast(msg, type = "success") {
  const div = document.createElement("div");
  div.className = `fixed top-4 right-4 px-4 py-2 rounded text-white z-50 ${type === "error" ? "bg-red-500" : "bg-green-600"}`;
  div.textContent = msg;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}

// ==========================
// ✅ Load all tours
// ==========================
async function loadTours() {
  const res = await fetch("/api/tours", { headers });
  const data = await res.json();
  tableBody.innerHTML = "";

  if (!data.success) {
    showToast("Gagal memuat data tour", "error");
    return;
  }

  data.tours.forEach((t) => {
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

// ==========================
// ✅ Create / Update Tour
// ==========================
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = idInput.value;
  const payload = {
    title: titleInput.value.trim(),
    description: descInput.value.trim(),
    price: parseFloat(priceInput.value),
    date: dateInput.value,
  };

  const url = id ? `/api/tours/${id}` : "/api/tours";
  const method = id ? "PUT" : "POST";

  const res = await fetch(url, {
    method,
    headers,
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (data.success) {
    showToast(data.message || "Berhasil disimpan");
    form.reset();
    idInput.value = "";
    loadTours();
  } else {
    showToast(data.message || "Gagal menyimpan", "error");
  }
});

// ==========================
// ✅ Edit Tour
// ==========================
async function editTour(id) {
  const res = await fetch(`/api/tours/${id}`, { headers });
  const data = await res.json();
  if (data.success) {
    const t = data.tour;
    idInput.value = t.id;
    titleInput.value = t.title;
    descInput.value = t.description;
    priceInput.value = t.price;
    dateInput.value = t.date;
    showToast("Mode edit aktif", "success");
  }
}

// ==========================
// ✅ Delete Tour
// ==========================
async function deleteTour(id) {
  if (!confirm("Yakin ingin menghapus tour ini?")) return;
  const res = await fetch(`/api/tours/${id}`, { method: "DELETE", headers });
  const data = await res.json();
  if (data.success) {
    showToast("Tour dihapus");
    loadTours();
  } else {
    showToast("Gagal menghapus tour", "error");
  }
}

// ==========================
// ✅ Reset Button
// ==========================
resetBtn.addEventListener("click", () => {
  form.reset();
  idInput.value = "";
  showToast("Form direset");
});

document.addEventListener("DOMContentLoaded", loadTours);
