// ==========================================================
// 📊 Dashboard JS — Travel Dashboard Enterprise v5.4.9
// ==========================================================

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) return (window.location.href = "login.html");

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const summaryEl = document.getElementById("dashboard-summary");
  const regionChartEl = document.getElementById("regionChart");
  const performanceChartEl = document.getElementById("performanceChart");

  try {
    // === LOAD DASHBOARD SUMMARY ===
    const resSummary = await fetch("/api/dashboard/summary", { headers });
    if (resSummary.status === 401) {
      alert("Sesi telah berakhir, silakan login kembali.");
      localStorage.removeItem("token");
      return (window.location.href = "login.html");
    }

    const summary = await resSummary.json();

    if (summaryEl) {
      summaryEl.innerHTML = `
        <div class="summary-grid">
          <div class="summary-card">
            <h3>✈️ Total Tour</h3>
            <p>${summary.total_tours}</p>
          </div>
          <div class="summary-card">
            <h3>💰 Total Sales</h3>
            <p>Rp ${parseFloat(summary.total_sales).toLocaleString("id-ID")}</p>
          </div>
          <div class="summary-card">
            <h3>📈 Total Profit</h3>
            <p>Rp ${parseFloat(summary.total_profit).toLocaleString("id-ID")}</p>
          </div>
          <div class="summary-card">
            <h3>🎯 Target Sales</h3>
            <p>Rp ${parseFloat(summary.target_sales).toLocaleString("id-ID")}</p>
            <div class="progress-bar">
              <div class="progress-fill" style="width:${summary.progress_sales}%"></div>
            </div>
            <small>${summary.progress_sales}% tercapai</small>
          </div>
          <div class="summary-card">
            <h3>🎯 Target Profit</h3>
            <p>Rp ${parseFloat(summary.target_profit).toLocaleString("id-ID")}</p>
            <div class="progress-bar profit">
              <div class="progress-fill" style="width:${summary.progress_profit}%"></div>
            </div>
            <small>${summary.progress_profit}% tercapai</small>
          </div>
        </div>
      `;
    }

    // === LOAD TOUR REGION STATS ===
    const resRegion = await fetch("/api/dashboard/tour-region", { headers });
    const regionData = await resRegion.json();

    if (regionChartEl && regionData.length > 0) {
      const ctx = regionChartEl.getContext("2d");
      new Chart(ctx, {
        type: "bar",
        data: {
          labels: regionData.map((r) => r.region),
          datasets: [
            {
              label: "Jumlah Tour",
              data: regionData.map((r) => r.total_tour),
            },
          ],
        },
        options: {
          responsive: true,
          scales: { y: { beginAtZero: true } },
        },
      });
    }

    // === LOAD MONTHLY PERFORMANCE CHART ===
    const resPerf = await fetch("/api/dashboard/monthly-performance", { headers });
    const perfData = await resPerf.json();

    if (performanceChartEl && perfData.length > 0) {
      const ctxPerf = performanceChartEl.getContext("2d");
      new Chart(ctxPerf, {
        type: "line",
        data: {
          labels: perfData.map((p) => p.month),
          datasets: [
            {
              label: "Total Sales",
              data: perfData.map((p) => parseFloat(p.total_sales)),
              borderWidth: 2,
              borderColor: "#3b82f6",
              tension: 0.3,
            },
            {
              label: "Total Profit",
              data: perfData.map((p) => parseFloat(p.total_profit)),
              borderWidth: 2,
              borderColor: "#16a34a",
              tension: 0.3,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: "bottom" },
          },
        },
      });
    }
  } catch (err) {
    console.error("❌ Dashboard load error:", err);
    if (summaryEl)
      summaryEl.innerHTML =
        "<p style='color:red'>Gagal memuat data dashboard.</p>";
  }
});