async function loadTours() {
  try {
    const data = await apiGet("/tours");
    const tbody = document.getElementById("tourTable");
    tbody.innerHTML = "";

    if (data.tours && data.tours.length) {
      data.tours.forEach(t => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td class="p-2 border">${t.title}</td>
          <td class="p-2 border">${t.description}</td>
          <td class="p-2 border">${t.price}</td>
          <td class="p-2 border">${t.date}</td>
          <td class="p-2 border text-center">
            <button onclick="editTour(${t.id})" class="bg-yellow-500 text-white px-2 py-1 rounded">Edit</button>
            <button onclick="deleteTour(${t.id})" class="bg-red-600 text-white px-2 py-1 rounded">Hapus</button>
          </td>
        `;
        tbody.appendChild(row);
      });
    }
  } catch (err) {
    console.error("❌ loadTours error:", err);
    showErrorToast("Gagal memuat data tours");
  }
}

// Tambah/Edit Tour
const tourForm = document.getElementById("tourForm");
if (tourForm) {
  tourForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("tourId").value;
    const data = {
      title: document.getElementById("title").value,
      description: document.getElementById("description").value,
      price: parseFloat(document.getElementById("price").value),
      date: document.getElementById("date").value,
    };

    try {
      let res;
      if (id) {
        res = await apiPut(`/tours/${id}`, data);
      } else {
        res = await apiPost("/tours", data);
      }

      if (res.success) {
        showSuccessToast("Data berhasil disimpan");
        tourForm.reset();
        loadTours();
      } else {
        showErrorToast(res.message);
      }
    } catch (err) {
      console.error(err);
      showErrorToast("Gagal menyimpan data");
    }
  });
}

// Hapus Tour
async function deleteTour(id) {
  if (!confirm("Yakin ingin menghapus tour ini?")) return;
  try {
    const res = await apiDelete(`/tours/${id}`);
    if (res.success) {
      showSuccessToast("Tour dihapus");
      loadTours();
    } else {
      showErrorToast(res.message);
    }
  } catch (err) {
    console.error(err);
    showErrorToast("Gagal menghapus tour");
  }
}

// Edit Tour → isi form
async function editTour(id) {
  try {
    const data = await apiGet(`/tours`);
    const tour = data.tours.find(t => t.id === id);
    if (!tour) return showErrorToast("Data tidak ditemukan");

    document.getElementById("tourId").value = tour.id;
    document.getElementById("title").value = tour.title;
    document.getElementById("description").value = tour.description;
    document.getElementById("price").value = tour.price;
    document.getElementById("date").value = tour.date;
  } catch (err) {
    console.error(err);
    showErrorToast("Gagal memuat data tour untuk diedit");
  }
}

// Reset form
const resetBtn = document.getElementById("resetBtn");
if (resetBtn) resetBtn.addEventListener("click", () => {
  tourForm.reset();
  document.getElementById("tourId").value = "";
});
