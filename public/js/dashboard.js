// ==========================================================
// 📊 Dashboard JS — Travel Dashboard Enterprise v5.4.9
// ==========================================================

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) return (window.location.href = "login.html");

  try {
    const res = await fetch("/api/dashboard/summary", {
      headers: { Authorization: "Bearer " + token }
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Gagal memuat data dashboard");

    document.getElementById("totalSales").textContent = `Rp${data.total_sales.toLocaleString()}`;
    document.getElementById("totalProfit").textContent = `Rp${data.total_profit.toLocaleString()}`;
    document.getElementById("totalTours").textContent = data.total_tours;
    document.getElementById("totalDocs").textContent = data.total_docs;

    // ===== CHART TARGET vs REALISASI =====
    const ctxTarget = document.getElementById("targetChart");
    new Chart(ctxTarget, {
      type: "bar",
      data: {
        labels: ["Sales", "Profit"],
        datasets: [
          {
            label: "Target",
            data: [data.target_sales, data.target_profit],
            backgroundColor: "#2563eb"
          },
          {
            label: "Realisasi",
            data: [data.total_sales, data.total_profit],
            backgroundColor: "#10b981"
          }
        ]
      },
      options: { responsive: true, plugins: { legend: { position: "bottom" } } }
    });

    // ===== CHART REGION =====
    const regionNames = data.pax_region.map(r => r.region);
    const regionCounts = data.pax_region.map(r => r.pax_count);
    const ctxRegion = document.getElementById("regionChart");

    new Chart(ctxRegion, {
      type: "pie",
      data: {
        labels: regionNames,
        datasets: [{ data: regionCounts, backgroundColor: ["#2563eb","#10b981","#f59e0b","#ef4444","#8b5cf6"] }]
      },
      options: { responsive: true, plugins: { legend: { position: "bottom" } } }
    });
  } catch (err) {
    console.error("❌ Dashboard load error:", err);
  }
});