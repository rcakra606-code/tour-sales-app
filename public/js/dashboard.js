// ==========================================================
// 🏠 Dashboard v5.3.6
// Fix: Add Progress Achievement per Staff & Role-based View
// ==========================================================
document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (!token || token === "undefined") return (window.location.href = "/login.html");

  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  document.getElementById("year").textContent = new Date().getFullYear();
  document.getElementById("activeUser").textContent = `${user.staff_name || user.username} (${user.role})`;

  const totalSalesEl = document.getElementById("totalSales");
  const totalProfitEl = document.getElementById("totalProfit");
  const totalToursEl = document.getElementById("totalTours");
  const totalRegionsEl = document.getElementById("totalRegions");
  const container = document.getElementById("achievementContainer");

  try {
    // Ambil summary utama
    const summaryRes = await fetch("/api/dashboard/summary", { headers });
    const summary = await summaryRes.json();

    totalSalesEl.textContent = summary.totalSales?.toLocaleString("id-ID") || 0;
    totalProfitEl.textContent = summary.totalProfit?.toLocaleString("id-ID") || 0;
    totalToursEl.textContent = summary.totalTours || 0;
    totalRegionsEl.textContent = summary.totalRegions || 0;

    // Ambil data progress per staff
    const perfRes = await fetch("/api/dashboard/staff-progress", { headers });
    const perfData = await perfRes.json();

    renderProgress(perfData, user.role);
    renderSalesChart(perfData);
  } catch (err) {
    console.error("❌ Dashboard load error:", err);
  }

  // ==========================================================
  // RENDER PROGRESS
  // ==========================================================
  function renderProgress(data, role) {
    container.innerHTML = "";

    const filtered = role === "staff" ? data.filter(d => d.staff_name === (user.staff_name || user.username)) : data;

    filtered.forEach((item) => {
      const salesPct = item.target_sales > 0 ? (item.total_sales / item.target_sales) * 100 : 0;
      const profitPct = item.target_profit > 0 ? (item.total_profit / item.target_profit) * 100 : 0;

      const div = document.createElement("div");
      div.className = "progress-card";
      div.innerHTML = `
        <h5>${item.staff_name}</h5>
        <div class="progress-group">
          <label>Sales: ${item.total_sales.toLocaleString("id-ID")} / ${item.target_sales.toLocaleString("id-ID")}</label>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${Math.min(salesPct, 100)}%"></div>
          </div>
        </div>
        <div class="progress-group">
          <label>Profit: ${item.total_profit.toLocaleString("id-ID")} / ${item.target_profit.toLocaleString("id-ID")}</label>
          <div class="progress-bar profit">
            <div class="progress-fill" style="width: ${Math.min(profitPct, 100)}%"></div>
          </div>
        </div>
      `;
      container.appendChild(div);
    });
  }

  // ==========================================================
  // SALES TREND CHART
  // ==========================================================
  function renderSalesChart(data) {
    const ctx = document.getElementById("salesChart");
    const labels = data.map(d => d.month);
    const sales = data.map(d => d.total_sales);
    const profit = data.map(d => d.total_profit);

    new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Sales",
            data: sales,
            borderColor: "#007bff",
            backgroundColor: "rgba(0,123,255,0.2)",
            fill: true,
            tension: 0.3,
          },
          {
            label: "Profit",
            data: profit,
            borderColor: "#28a745",
            backgroundColor: "rgba(40,167,69,0.2)",
            fill: true,
            tension: 0.3,
          },
        ],
      },
      options: {
        plugins: { legend: { position: "bottom" } },
        scales: { y: { beginAtZero: true } },
      },
    });
  }
});