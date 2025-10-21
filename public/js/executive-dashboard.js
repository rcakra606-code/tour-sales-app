// ==========================================================
// 📈 Executive Dashboard v5.3.4
// Combined Monthly Performance & Target Tracking
// ==========================================================
document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (!token || token === "undefined") return (window.location.href = "/login.html");

  // Hanya admin & semiadmin yang boleh akses
  if (!["admin", "semiadmin"].includes(user.role)) {
    alert("❌ Hanya Admin atau Semi Admin yang dapat mengakses halaman ini.");
    return (window.location.href = "/dashboard.html");
  }

  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  document.getElementById("year").textContent = new Date().getFullYear();
  document.getElementById("activeUser").textContent = `${user.staff_name || user.username} (${user.role})`;

  try {
    const [monthlyRes, targetRes, profitRes] = await Promise.all([
      fetch("/api/executive/monthly-performance", { headers }),
      fetch("/api/executive/sales-targets", { headers }),
      fetch("/api/executive/profit-trend", { headers }),
    ]);

    const monthlyData = await monthlyRes.json();
    const targetData = await targetRes.json();
    const profitData = await profitRes.json();

    renderMonthlyPerformance(monthlyData);
    renderSalesTarget(targetData);
    renderProfitTrend(profitData);
  } catch (err) {
    console.error("❌ Error loading executive data:", err);
  }
});

// Monthly performance chart
function renderMonthlyPerformance(data) {
  const ctx = document.getElementById("monthlyPerformanceChart");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: data.months || [],
      datasets: [
        {
          label: "Total Sales",
          data: data.sales || [],
          backgroundColor: "#004b99",
        },
        {
          label: "Total Profit",
          data: data.profit || [],
          backgroundColor: "#0a66c2",
        },
        {
          label: "Total Tours",
          data: data.tours || [],
          backgroundColor: "#ffc107",
        },
      ],
    },
    options: {
      plugins: {
        legend: { position: "bottom" },
      },
      scales: {
        y: { beginAtZero: true },
      },
    },
  });
}

// Sales target vs actual
function renderSalesTarget(data) {
  const ctx = document.getElementById("targetChart");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: data.staffs || [],
      datasets: [
        {
          label: "Target Sales",
          data: data.targetSales || [],
          backgroundColor: "#6c757d",
        },
        {
          label: "Actual Sales",
          data: data.actualSales || [],
          backgroundColor: "#28a745",
        },
      ],
    },
    options: {
      plugins: {
        legend: { position: "bottom" },
      },
      scales: {
        y: { beginAtZero: true },
      },
    },
  });
}

// Profit trend (line)
function renderProfitTrend(data) {
  const ctx = document.getElementById("profitChart");
  new Chart(ctx, {
    type: "line",
    data: {
      labels: data.months || [],
      datasets: [
        {
          label: "Total Profit",
          data: data.profit || [],
          borderColor: "#0a66c2",
          backgroundColor: "rgba(10, 102, 194, 0.3)",
          tension: 0.3,
          fill: true,
        },
      ],
    },
    options: {
      plugins: {
        legend: { position: "bottom" },
      },
      scales: {
        y: { beginAtZero: true },
      },
    },
  });
}