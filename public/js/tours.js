// ===============================
// ✅ Tour Handlers
// ===============================
window.loadTours = async function() {
  try {
    const data = await apiRequest("/tours");
    const tableBody = document.getElementById("tourTable");
    tableBody.innerHTML = "";

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
    showErrorToast(err.message);
  }
};

window.editTour = async function(id) {
  try {
    const data = await apiRequest(`/tours/${id}`);
    const t = data.tour;
    document.getElementById("tourId").value = t.id;
    document.getElementById("title").value = t.title;
    document.getElementById("description").value = t.description;
    document.getElementById("price").value = t.price;
    document.getElementById("date").value = t.date;
    showSuccessToast("Mode edit aktif");
  } catch (err) {
    showErrorToast(err.message);
  }
};

window.deleteTour = async function(id) {
  if (!confirm("Yakin ingin menghapus tour ini?")) return;
  try {
    await apiRequest(`/tours/${id}`, { method: "DELETE" });
    showSuccessToast("Tour dihapus");
    loadTours();
  } catch (err) {
    showErrorToast(err.message);
  }
};
