async function loadSales() {
  try {
    const data = await apiGet("/sales");
    const tbody = document.getElementById("salesTable");
    if (!tbody) return;

    tbody.innerHTML = "";
    if (data.sales && data.sales.length) {
      data.sales.forEach(s => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td class="p-2 border">${s.customer}</td>
          <td class="p-2 border">${s.tour}</td>
          <td class="p-2 border">${s.amount}</td>
          <td class="p-2 border">${s.date}</td>
          <td class="p-2 border text-center">
            <button onclick="editSale(${s.id})" class="bg-yellow-500 text-white px-2 py-1 rounded">Edit</button>
            <button onclick="deleteSale(${s.id})" class="bg-red-600 text-white px-2 py-1 rounded">Hapus</button>
          </td>
        `;
        tbody.appendChild(row);
      });
    }
  } catch (err) {
    console.error("❌ loadSales error:", err);
    showErrorToast("Gagal memuat data sales");
  }
}

// Tambah/Edit Sales
const salesForm = document.getElementById("salesForm");
if (salesForm) {
  salesForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("saleId").value;
    const data = {
      customer: document.getElementById("customer").value,
      tour: document.getElementById("tourSelect").value,
      amount: parseFloat(document.getElementById("amount").value),
      date: document.getElementById("saleDate").value,
    };

    try {
      let res;
      if (id) {
        res = await apiPut(`/sales/${id}`, data);
      } else {
        res = await apiPost("/sales", data);
      }

      if (res.success) {
        showSuccessToast("Data berhasil disimpan");
        salesForm.reset();
        loadSales();
      } else {
        showErrorToast(res.message);
      }
    } catch (err) {
      console.error(err);
      showErrorToast("Gagal menyimpan data");
    }
  });
}

// Hapus Sales
async function deleteSale(id) {
  if (!confirm("Yakin ingin menghapus data sales ini?")) return;
  try {
    const res = await apiDelete(`/sales/${id}`);
    if (res.success) {
      showSuccessToast("Data sales dihapus");
      loadSales();
    } else {
      showErrorToast(res.message);
    }
  } catch (err) {
    console.error(err);
    showErrorToast("Gagal menghapus data sales");
  }
}

// Edit Sales → isi form
async function editSale(id) {
  try {
    const data = await apiGet("/sales");
    const sale = data.sales.find(s => s.id === id);
    if (!sale) return showErrorToast("Data tidak ditemukan");

    document.getElementById("saleId").value = sale.id;
    document.getElementById("customer").value = sale.customer;
    document.getElementById("tourSelect").value = sale.tour;
    document.getElementById("amount").value = sale.amount;
    document.getElementById("saleDate").value = sale.date;
  } catch (err) {
    console.error(err);
    showErrorToast("Gagal memuat data sales untuk diedit");
  }
}

// Reset form
const resetSalesBtn = document.getElementById("resetSalesBtn");
if (resetSalesBtn) resetSalesBtn.addEventListener("click", () => {
  salesForm.reset();
  document.getElementById("saleId").value = "";
});
