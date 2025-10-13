// ===============================
// ✅ Sales CRUD
// ===============================
window.Sales = {
  list: async function() {
    const res = await Api.request("/sales");
    return res.data || [];
  },
  create: async function(data) {
    return await Api.request("/sales", "POST", data);
  },
  update: async function(id, data) {
    return await Api.request("/sales/" + id, "PUT", data);
  },
  remove: async function(id) {
    return await Api.request("/sales/" + id, "DELETE");
  }
};

// DOM Binding
document.addEventListener("DOMContentLoaded", function() {
  const salesForm = document.getElementById("salesForm");
  const salesTable = document.getElementById("salesTable");
  const resetBtn = document.getElementById("resetSalesBtn");

  async function loadSales() {
    if (!salesTable) return;
    salesTable.innerHTML = "";
    const sales = await window.Sales.list();
    sales.forEach(s => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="p-2">${s.customer}</td>
        <td class="p-2">${s.amount}</td>
        <td class="p-2">${s.date}</td>
        <td class="p-2 text-center">
          <button onclick="window.Sales.edit(${s.id})" class="bg-yellow-400 px-2 py-1 rounded">Edit</button>
          <button onclick="window.Sales.delete(${s.id})" class="bg-red-600 px-2 py-1 rounded text-white">Hapus</button>
        </td>
      `;
      salesTable.appendChild(tr);
    });
  }

  salesForm && salesForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("saleId").value;
    const data = {
      customer: document.getElementById("customer").value.trim(),
      amount: parseFloat(document.getElementById("amount").value),
      date: document.getElementById("saleDate").value
    };
    try {
      window.App.toggleLoading(true);
      if (id) await window.Sales.update(id, data);
      else await window.Sales.create(data);
      window.App.showSuccessToast("Data tersimpan");
      resetForm();
      loadSales();
    } catch(err) {
      window.App.showErrorToast(err.message);
    } finally {
      window.App.toggleLoading(false);
    }
  });

  resetBtn && resetBtn.addEventListener("click", resetForm);

  function resetForm() {
    document.getElementById("saleId").value = "";
    document.getElementById("customer").value = "";
    document.getElementById("amount").value = "";
    document.getElementById("saleDate").value = "";
  }

  window.Sales.edit = function(id) {
    const sale = Array.from(salesTable.children).find(r => r.dataset.id == id);
    if (!sale) return;
    document.getElementById("saleId").value = id;
    document.getElementById("customer").value = sale.children[0].textContent;
    document.getElementById("amount").value = sale.children[1].textContent;
    document.getElementById("saleDate").value = sale.children[2].textContent;
  }

  window.Sales.delete = async function(id) {
    if (!confirm("Hapus data ini?")) return;
    try {
      window.App.toggleLoading(true);
      await window.Sales.remove(id);
      window.App.showSuccessToast("Data dihapus");
      loadSales();
    } catch(err) {
      window.App.showErrorToast(err.message);
    } finally {
      window.App.toggleLoading(false);
    }
  }

  window.Sales.loadSales = loadSales;
});
