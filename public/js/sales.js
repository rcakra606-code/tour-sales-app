// sales.js
async function loadSales() {
  // contoh placeholder, implementasi mirip tours
  try {
    const data = await request("/sales");
    console.log("Sales data:", data);
  } catch (err) {
    showErrorToast(err.message);
  }
}
