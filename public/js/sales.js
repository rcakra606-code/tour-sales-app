// ===============================
// ✅ Sales Frontend Handler
// ===============================

const salesTable = document.getElementById("salesTable");
const salesForm = document.getElementById("salesForm");
const resetBtn = document.getElementById("salesResetBtn");

// ===============================
// LOAD ALL SALES
// ===============================
async function loadSales() {
  try {
    toggleLoading(true);
    const token = localStorage.getItem("token");
    const res = await fetch("/api/sales", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    if (!data.success) throw new Error(data.message || "Gagal memuat data sales.");

    renderSalesTable(data.data);
  } catch (err) {
    console.error("loadSales error:", err);
    showErrorToast(err.message);
  } finally {
    toggleLoading(false);
  }
}

// ===============================
// RENDER TABEL SALES
// ===============================
function renderSalesTable(sales) {
  if (!salesTable) return;
  salesTable.innerHTML = "";

  sales.forEach((sale) => {
    const tr = document.createElement("tr");
    tr.className = "border-b";

    tr.innerHTML = `
      <td class="p-2">${sale.name}</td>
      <td class="p-2">${sale.email}</td>
      <td class="p-2 text-right">${sale.target}</td>
      <td class="p-2 text-right">${sale.achieved}</td>
      <td class="p-2 text-center space-x-2">
        <button onclick="editSale(${sale.id})" class="bg-yellow-500 text-white px-2 py-1 rounded">Edit</button>
        <button onclick="deleteSale(${sale.id})" class="bg-red-600 text-white px-2 py-1 rounded">Hapus</button>
      </td>
    `;
    salesTable.appendChild(tr);
  });
}

// ===============================
// TAMBAH / UPDATE SALES
// ===============================
async function submitSale(e) {
  e.preventDefault();
  if (!salesForm) return;

  const id = salesForm.elements["saleId"]?.value || "";
  const name = salesForm.elements["name"]?.value.trim();
  const email = salesForm.elements["email"]?.value.trim();
  const target = parseFloat(salesForm.elements["target"]?.value);
  const achieved = parseFloat(salesForm.elements["achieved"]?.value);

  if (!name || !email || isNaN(target) || isNaN(achieved)) {
    showErrorToast("Semua field wajib diisi dengan benar.");
    return;
  }

  try {
    toggleLoading(true);
    const token = localStorage.getItem("token");
    const url = id ? "/api/sales" : "/api/sales";
    const method = id ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id, name, email, target, achieved }),
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Gagal menyimpan data sales.");

    showSuccessToast(data.message);
    resetSalesForm();
    await loadSales();
  } catch (err) {
    console.error("submitSale error:", err);
    showErrorToast(err.message);
  } finally {
    toggleLoading(false);
  }
}

// ===============================
// EDIT SALE
// ===============================
function editSale(id) {
  if (!salesTable || !salesForm) return;
  const row = Array.from(salesTable.children).find((tr) =>
    tr.querySelector("button")?.getAttribute("onclick")?.includes(`editSale(${id})`)
  );
  if (!row) return;

  salesForm.elements["saleId"].value = id;
  salesForm.elements["name"].value = row.children[0].textContent;
  salesForm.elements["email"].value = row.children[1].textContent;
  salesForm.elements["target"].value = row.children[2].textContent;
  salesForm.elements["achieved"].value = row.children[3].textContent;
}

// ===============================
// DELETE SALE
// ===============================
async function deleteSale(id) {
  if (!confirm("Apakah Anda yakin ingin menghapus data sales ini?")) return;
  try {
    toggleLoading(true);
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/sales/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Gagal menghapus data sales.");
    showSuccessToast(data.message);
    await loadSales();
  } catch (err) {
    console.error("deleteSale error:", err);
    showErrorToast(err.message);
  } finally {
    toggleLoading(false);
  }
}

// ===============================
// RESET FORM
// ===============================
function resetSalesForm() {
  if (!salesForm) return;
  salesForm.reset();
  salesForm.elements["saleId"].value = "";
}

// ===============================
// INIT
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  if (salesForm) salesForm.addEventListener("submit", submitSale);
  if (resetBtn) resetBtn.addEventListener("click", resetSalesForm);

  // Load data jika sudah login
  const token = localStorage.getItem("token");
  if (token) loadSales();
});
