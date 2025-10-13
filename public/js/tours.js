// ===============================
// ✅ TOUR HANDLER
// ===============================
const form = document.getElementById("tourForm");
const resetBtn = document.getElementById("resetBtn");
const tableBody = document.getElementById("tourTable");
const idInput = document.getElementById("tourId");
const titleInput = document.getElementById("title");
const descInput = document.getElementById("description");
const priceInput = document.getElementById("price");
const dateInput = document.getElementById("date");

async function loadTours() {
  try {
    toggleLoading(true);
    const data = await apiGet("/api/tours");
    tableBody.innerHTML = "";
    if (!data.success) {
      showErrorToast("Gagal memuat data tour");
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
  } catch (err) {
    console.error(err);
    showErrorToast("Gagal load tours");
  } finally {
    toggleLoading(false);
  }
}

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = idInput.value;
  const payload = {
    title: titleInput.value.trim(),
    description: descInput.value.trim(),
    price: parseFloat(priceInput.value),
    date: dateInput.value,
  };

  try {
    toggleLoading(true);
    const url = id ? `/api/tours/${id}` : "/api/tours";
    const method = id ? apiPut : apiPost;
    const data = await method(url, payload);

    if (data.success) {
      showSuccessToast(data.message || "Berhasil disimpan");
      form.reset();
      idInput.value = "";
      loadTours();
    } else showErrorToast(data.message || "Gagal menyimpan");
  } catch (err) {
    console.error(err);
    showErrorToast("Terjadi kesalahan saat simpan tour");
  } finally {
    toggleLoading(false);
  }
});

resetBtn?.addEventListener("click", () => {
  form.reset();
  idInput.value = "";
});

async function editTour(id) {
  try {
    toggleLoading(true);
    const data = await apiGet(`/api/tours/${id}`);
    if (data.success) {
      const t = data.tour;
      idInput.value = t.id;
      titleInput.value = t.title;
      descInput.value = t.description;
      priceInput.value = t.price;
      dateInput.value = t.date;
      showSuccessToast("Mode edit aktif");
    }
  } catch (err) {
    console.error(err);
    showErrorToast("Gagal load data tour");
  } finally {
    toggleLoading(false);
  }
}

async function deleteTour(id) {
  if (!confirm("Yakin ingin menghapus tour ini?")) return;
  try {
    toggleLoading(true);
    const data = await apiDelete(`/api/tours/${id}`);
    if (data.success) {
      showSuccessToast("Tour dihapus");
      loadTours();
    } else showErrorToast("Gagal hapus tour");
  } catch (err) {
    console.error(err);
    showErrorToast("Terjadi kesalahan saat hapus tour");
  } finally {
    toggleLoading(false);
  }
}
