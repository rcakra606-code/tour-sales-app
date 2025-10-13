import { apiFetch } from "./api.js";

const salesTable = document.getElementById("salesTable");
const salesForm = document.getElementById("salesForm");
const salesResetBtn = document.getElementById("salesResetBtn");
let editSalesId = null;

// ✅ Load semua sales
async function loadSales() {
  if (!salesTable) return;

  const res = await apiFetch("/sales");
  salesTable.innerHTML = "";

  res.sales.forEach(s => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="p-2">${s.customer}</td>
      <td class="p-2">${s.tour}</td>
      <td class="p-2">Rp ${s.amount}</td>
      <td class="p-2">${s.date}</td>
      <td class="p-2 text-center">
        <button onclick="editSales(${s.id})" class="bg-yellow-500 px-2 py-1 rounded text-white">Edit</button>
        <button onclick="deleteSales(${s.id})" class="bg-red-600 px-2 py-1 rounded text-white">Hapus</button>
      </td>`;
    salesTable.appendChild(tr);
  });
}

// ✅ Simpan / Update sales
async function saveSales(e) {
  e.preventDefault();
  if (!salesForm) return;

  const data = {
    customer: document.getElementById("customer").value,
    tour: document.getElementById("tourName").value,
    amount: document.getElementById("amount").value,
    date: document.getElementById("salesDate").value,
  };

  try {
    if (editSalesId) {
      await apiFetch(`/sales/${editSalesId}`, "PUT", data);
      editSalesId = null;
    } else {
      await apiFetch("/sales", "POST", data);
    }
    salesForm.reset();
    await loadSales();
  } catch (err) {
    alert(err.message);
  }
}

// ✅ Edit sales
function editSales(id) {
  editSalesId = id;
  apiFetch(`/sales/${id}`).then(res => {
    document.getElementById("customer").value = res.sale.customer;
    document.getElementById("tourName").value = res.sale.tour;
    document.getElementById("amount").value = res.sale.amount;
    document.getElementById("salesDate").value = res.sale.date;
  });
}

// ✅ Hapus sales
async function deleteSales(id) {
  if (confirm("Hapus data penjualan ini?")) {
    await apiFetch(`/sales/${id}`, "DELETE");
    await loadSales();
  }
}

// Event listener
if (salesForm) salesForm.addEventListener("submit", saveSales);
if (salesResetBtn) salesResetBtn.addEventListener("click", () => {
  salesForm.reset();
  editSalesId = null;
});

export { loadSales, editSales, deleteSales };
