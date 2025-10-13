// ===============================
// ✅ Sales Handlers
// ===============================
window.loadSales = async function() {
  try {
    const data = await apiRequest("/sales");
    console.log("Sales loaded:", data.sales);
    // TODO: Render sales ke tabel atau chart sesuai kebutuhan
  } catch (err) {
    showErrorToast(err.message);
  }
};
