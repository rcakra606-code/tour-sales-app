/* ---------- DASHBOARD ---------- */
async function updateCharts() {
  try {
    // 🔹 Fetch summary
    const summary = await apiFetch("/dashboard/summary");
    document.getElementById("totalSales").textContent = `Rp ${Number(summary.totalSales || 0).toLocaleString()}`;
    document.getElementById("totalProfit").textContent = `Rp ${Number(summary.totalProfit || 0).toLocaleString()}`;
    document.getElementById("totalRegistrants").textContent = summary.totalRegistrants || 0;
    document.getElementById("totalPax").textContent = summary.totalPax || 0;

    // 🔹 Fetch charts data (per staff dan per region)
    const chartsData = await apiFetch("/dashboard/charts");
    renderSalesChart(chartsData.staffRows || []);
    renderRegionChart(chartsData.regionRows || []);

    // 🔹 Fetch sales overview (harian)
    const salesOverview = await apiFetch("/dashboard/sales-overview");
    renderDailySalesChart(salesOverview.daily || []);
  } catch (err) {
    console.error("updateCharts error:", err);
  }
}

/* ---------- Chart: Sales vs Profit per Staff ---------- */
function renderSalesChart(staffRows) {
  const ctx = document.getElementById("salesChart").getContext("2d");
  const labels = staffRows.map(r => r.staff || "Unknown");
  const sales = staffRows.map(r => r.sales || 0);
  const profit = staffRows.map(r => r.profit || 0);

  if (charts.sales) charts.sales.destroy();
  charts.sales = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        { label: "Sales", data: sales, backgroundColor: "rgba(59,130,246,0.6)" },
        { label: "Profit", data: profit, backgroundColor: "rgba(16,185,129,0.6)" },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: { callback: v => "Rp " + v.toLocaleString() },
        },
      },
    },
  });
}

/* ---------- Chart: Registrasi per Region ---------- */
function renderRegionChart(regionRows) {
  const ctx = document.getElementById("regionChart").getContext("2d");
  const labels = regionRows.map(r => r.region || "Unknown");
  const data = regionRows.map(r => r.count || 0);

  if (charts.region) charts.region.destroy();
  charts.region = new Chart(ctx, {
    type: "pie",
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: labels.map((_, i) => `hsl(${i * 60 % 360}deg 70% 50%)`),
        },
      ],
    },
    options: { responsive: true },
  });
}

/* ---------- Chart: Penjualan Harian ---------- */
function renderDailySalesChart(rows) {
  const ctx = document.getElementById("dailySalesChart").getContext("2d");
  const labels = rows.map(r => r.date);
  const sales = rows.map(r => r.totalSales || 0);
  const profit = rows.map(r => r.totalProfit || 0);

  if (charts.salesTarget) charts.salesTarget.destroy();
  charts.salesTarget = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Total Sales",
          data: sales,
          borderColor: "rgba(59,130,246,0.8)",
          fill: false,
          tension: 0.3,
        },
        {
          label: "Total Profit",
          data: profit,
          borderColor: "rgba(16,185,129,0.8)",
          fill: false,
          tension: 0.3,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true, ticks: { callback: v => "Rp " + v.toLocaleString() } },
      },
    },
  });
}
