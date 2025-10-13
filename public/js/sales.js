// ===============================
// ✅ Sales Frontend Handler
// ===============================
const salesTable = document.getElementById("salesTable");
const salesForm = document.getElementById("salesForm");

async function loadSales() {
  try {
    const sales = await apiGet("/sales");
    renderSales(sales);
  } catch (err) {
    console.error(err);
    showErrorToast("Gagal memuat data sales");
  }
}

function renderSales(sales) {
  if (!salesTable) return;
  salesTable.innerHTML = "";
  sales.forEach(s => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="p-2">${s.customer}</td>
      <td class="p-2">${s.tour_id}</td>
      <td class="p-2">${s.amount}</td>
      <td class="p-2">${s.date}</td>
      <td class="p-2 text-center">
        <button onclick="editSale(${s.id})" class="bg-yellow-500 text-white px-2 py-1 rounded">Edit</button>
        <button onclick="deleteSale(${s.id})" class="bg-red-600 text-white px-2 py-1 rounded">Hapus</button>
      </td>
    `;
    salesTable.appendChild(tr);
  });
}
