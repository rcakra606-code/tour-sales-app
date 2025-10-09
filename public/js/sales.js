// ======================================
// ✅ SALES MODULE
// ======================================

// Muat data Sales dari API
async function loadSales() {
  const tableBody = document.getElementById("salesTableBody");
  if (!tableBody) return; // Jika bukan di halaman Sales

  try {
    toggleLoading(true);
    const res = await SalesAPI.getAll();

    tableBody.innerHTML = "";

    if (!res || !Array.isArray(res.sales) || res.sales.length === 0) {
      tableBody.innerHTML =
        `<tr><td colspan="6" class="text-center py-4 text-gray-400">Belum ada data sales</td></tr>`;
      return;
    }

    res.sales.forEach((s) => {
      const row = document.createElement("tr");
      row.className = "border-b hover:bg-gray-50";

      row.innerHTML = `
        <td class="px-4 py-2 text-sm text-gray-600">${s.transaction_date || "-"}</td>
        <td class="px-4 py-2 text-sm text-gray-900 font-medium">${s.invoice_number || "-"}</td>
        <td class="px-4 py-2 text-sm text-gray-600 text-right">Rp ${Number(s.sales_amount || 0).toLocaleString("id-ID")}</td>
        <td class="px-4 py-2 text-sm text-gray-600 text-right">Rp ${Number(s.profit_amount || 0).toLocaleString("id-ID")}</td>
        <td class="px-4 py-2 text-sm text-gray-600">${s.staff_name || "-"}</td>
        <td class="px-4 py-2 text-sm text-gray-600">${s.discount_remarks || "-"}</td>
      `;

      tableBody.appendChild(row);
    });
  } catch (e) {
    console.error("Load sales error:", e);
    showErrorToast(e.message || "Gagal memuat data sales.");
  } finally {
    toggleLoading(false);
  }
}

// ======================================
// ✅ Modal Controls
// ======================================
function openSalesModal() {
  const modal = document.getElementById("salesModal");
  if (modal) modal.classList.remove("hidden");
}

function closeSalesModal() {
  const modal = document.getElementById("salesModal");
  if (modal) modal.classList.add("hidden");
}

// ======================================
// ✅ Simpan Data Sales
// ======================================
async function saveSales(e) {
  e.preventDefault();

  const payload = {
    transaction_date: document.getElementById("transactionDate")?.value || "",
    invoice_number: document.getElementById("invoiceNumber")?.value || "",
    sales_amount: parseInt(document.getElementById("salesAmount")?.value || "0", 10),
    profit_amount: parseInt(document.getElementById("profitAmount")?.value || "0", 10),
    discount_amount: parseInt(document.getElementById("discountAmount")?.value || "0", 10),
    discount_remarks: document.getElementById("discountRemarks")?.value || "",
    staff_name: document.getElementById("staffName")?.value || "",
  };

  // Validasi input wajib
  if (!payload.invoice_number || !payload.transaction_date || !payload.sales_amount) {
    showErrorToast("Tanggal, nomor invoice, dan jumlah sales wajib diisi!");
    return;
  }

  try {
    toggleLoading(true);
    await SalesAPI.create(payload);
    showSuccessToast("Data sales berhasil disimpan!");
    closeSalesModal();
    await loadSales();
  } catch (e) {
    console.error("Save sales error:", e);
    showErrorToast(e.message || "Gagal menyimpan data sales.");
  } finally {
    toggleLoading(false);
  }
}

// ======================================
// ✅ Inisialisasi otomatis saat halaman dimuat
// ======================================
document.addEventListener("DOMContentLoaded", () => {
  const salesTable = document.getElementById("salesTableBody");
  if (salesTable) {
    loadSales();
  }

  const salesForm = document.getElementById("salesForm");
  if (salesForm) {
    salesForm.addEventListener("submit", saveSales);
  }
});
