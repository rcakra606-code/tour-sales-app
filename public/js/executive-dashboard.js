// ==========================================================
// 👔 Executive Dashboard JS — Travel Dashboard Enterprise v5.4.9
// ==========================================================

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) return (window.location.href = "login.html");

  try {
    // ===== STAFF PERFORMANCE =====
    const staffRes = await fetch("/api/executive/staff-performance", {
      headers: { Authorization: "Bearer " + token }
    });
    const staffData = await staffRes.json();

    const ctxStaff = document.getElementById("staffChart");
    new Chart(ctxStaff, {
      type: "bar",
      data: {
        labels: staffData.map(s => s.staff_name || "Tidak diketahui"),
        datasets: [
          {
            label: "Sales",
            data: staffData.map(s => s.total_sales),
            backgroundColor: "#2563eb"
          },
          {
            label: "Profit",
            data: staffData.map(s => s.total_profit),
            backgroundColor: "#10b981"
          }
        ]
      },
      options: { responsive: true, plugins: { legend: { position: "bottom" } } }
    });

    // ===== TARGET PROGRESS =====
    const targetRes = await fetch("/api/executive/target-progress", {
      headers: { Authorization: "Bearer " + token }
    });
    const targetData = await targetRes.json();

    const ctxTarget = document.getElementById("targetProgressChart");
    new Chart(ctxTarget, {
      type: "bar",
      data: {
        labels: targetData.map(t => t.staff_name),
        datasets: [
          {
            label: "Target Sales",
            data: targetData.map(t => t.target_sales),
            backgroundColor: "#94a3b8"
          },
          {
            label: "Actual Sales",
            data: targetData.map(t => t.actual_sales),
            backgroundColor: "#2563eb"
          }
        ]
      },
      options: { responsive: true, plugins: { legend: { position: "bottom" } } }
    });

    // ===== MONTHLY PERFORMANCE =====
    const monthlyRes = await fetch("/api/executive/monthly-performance", {
      headers: { Authorization: "Bearer " + token }
    });
    const monthlyData = await monthlyRes.json();

    const ctxMonthly = document.getElementById("monthlyChart");
    new Chart(ctxMonthly, {
      type: "line",
      data: {
        labels: monthlyData.map(m => new Date(m.month).toLocaleString("id-ID", { month: "short", year: "numeric" })),
        datasets: [
          {
            label: "Sales",
            data: monthlyData.map(m => m.total_sales),
            borderColor: "#2563eb",
            fill: false,
            tension: 0.1
          },
          {
            label: "Profit",
            data: monthlyData.map(m => m.total_profit),
            borderColor: "#10b981",
            fill: false,
            tension: 0.1
          }
        ]
      },
      options: { responsive: true, plugins: { legend: { position: "bottom" } } }
    });
  } catch (err) {
    console.error("❌ Executive dashboard error:", err);
  }
});