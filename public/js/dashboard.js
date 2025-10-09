// ===============================
// ✅ Dashboard Script
// ===============================

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");

  // 🚫 Jika belum login → redirect ke halaman login
  if (!token) {
    window.location.href = "/";
    return;
  }

  // Element referensi
  const totalSalesEl = document.getElementById("totalSales");
  const activeToursEl = document.getElementById("activeTours");
  const pendingBookingsEl = document.getElementById("pendingBookings");
  const tourTable = document.getElementById("tourTable");
  const logoutBtn = document.getElementById("logoutBtn");

  // Logout listener
  if (logoutBtn) logoutBtn.addEventListener("click", logout);

  try {
    // ===============================
    // ✅ Ambil data sales & tours
    // ===============================
    const [sales, tours] = await Promise.all([
      API.get("/sales"),
      API.get("/tours"),
    ]);

    // ===============================
    // ✅ Ringkasan data
    // ===============================
    totalSalesEl.textContent = sales?.length || 0;
    activeToursEl.textContent = tours?.filter(t => t.status === "active").length || 0;
    pendingBookingsEl.textContent = tours?.filter(t => t.status === "pending").length || 0;

    // ===============================
    // ✅ Tabel recent tours
    // ===============================
    if (tours && tours.length) {
      tourTable.innerHTML = tours.slice(0, 10).map(t => `
        <tr>
          <td class="py-2 px-4 border-b">${t.name || t.tour_code || "-"}</td>
          <td class="py-2 px-4 border-b">${t.date ? new Date(t.date).toLocaleDateString() : "-"}</td>
          <td class="py-2 px-4 border-b">${t.participants || t.pax_count || 0}</td>
          <td class="py-2 px-4 border-b">
            <span class="px-2 py-1 rounded text-xs ${
              t.status === "active" ? "bg-green-100 text-green-700" :
              t.status === "pending" ? "bg-yellow-100 text-yellow-700" :
              "bg-gray-100 text-gray-600"
            }">${t.status || "N/A"}</span>
          </td>
        </tr>
      `).join("");
    } else {
      tourTable.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-gray-400">Tidak ada data tour</td></tr>`;
    }

    // ===============================
    // ✅ Render grafik Chart.js
    // ===============================
    renderSalesChart(sales);
  } catch (error) {
    console.error("❌ Error loading dashboard:", error);
    alert("Gagal memuat data dashboard. Silakan login ulang.");
    localStorage.removeItem("token");
    window.location.href = "/";
  }
});

// ===============================
// ✅ Render Chart.js
// ===============================
function renderSalesChart(sales) {
  const ctx = document.getElementById("salesChart").getContext("2d");
  const labels = (sales || []).slice(0, 7).map((s, i) => s.transaction_date || `Hari ${i + 1}`);
  const data = (sales || []).slice(0, 7).map(s => s.sales_amount || 0);

  new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Sales Amount (Rp)",
        data,
        backgroundColor: "rgba(37, 99, 235, 0.5)",
        borderColor: "rgba(37, 99, 235, 1)",
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true, ticks: { callback: val => `Rp ${val}` } } }
    }
  });
}
