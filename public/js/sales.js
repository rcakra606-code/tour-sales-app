// ===============================
// ✅ SALES HANDLER
// ===============================
async function loadSales() {
  try {
    toggleLoading(true);
    const data = await apiGet("/api/sales");
    const tableBody = document.getElementById("salesTable");
    if (!data.success) return;

    tableBody.innerHTML = "";
    data.sales.forEach((s) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="p-2">${s.customer}</td>
        <td class="p-2">Rp ${s.amount?.toLocaleString("id-ID")}</td>
        <td class="p-2">${s.date || "-"}</td>
        <td class="p-2 text-center">
          <button onclick="editSale(${s.id})" class="text-blue-500 hover:underline">Edit</button>
          <button onclick="deleteSale(${s.id})" class="text-red-500 hover:underline ml-2">Hapus</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  } catch (err) {
    console.error(err);
    showErrorToast("Gagal load data sales");
  } finally {
    toggleLoading(false);
  }
}

// CRUD sales mirip tours (implementasi editSale, deleteSale, dll)
