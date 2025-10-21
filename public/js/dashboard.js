// ==========================================================
// 📊 Dashboard Logic v5.3.4
// Handles summary data & region chart
// ==========================================================
document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // 🧠 Redirect jika belum login
  if (!token || token === "undefined" || token === "null") {
    window.location.href = "/login.html";
    return;
  }

  // Tampilkan user aktif di topbar
  document.getElementById("year").textContent = new Date().getFullYear();
  const userInfo = document.getElementById("activeUser");
  userInfo.textContent = `${user.staff_name || user.username || "User"} (${user.role})`;

  // 🔐 Header Auth
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // 🔹 Load Summary
  try {
    const res = await fetch("/api/dashboard/summary", { headers });
    if (!res.ok) throw new Error("Gagal mengambil data summary");
    const data = await res.json();
    renderSummary(data);
  } catch (err) {
    console.error("❌ Error summary:", err);
  }

  // 🔹 Load Region Data
  try {
    const res = await fetch("/api/dashboard/tour-region", { headers });
    if (!res.ok) throw new Error("Gagal mengambil data region");
    const data = await res.json();
    renderRegionChart(data);
  } catch (err) {
    console.error("❌ Error region:", err);
  }
});

// Render Summary Table
function renderSummary(data) {
  const tbody = document.querySelector("#summaryTable tbody");
  tbody.innerHTML = "";

  const rows = [
    { label: "Total Tour", value: data.totalTours || 0 },
    { label: "Total Sales", value: data.totalSales || 0 },
    { label: "Total Profit", value: data.totalProfit || 0 },
    { label: "Total Users", value: data.totalUsers || 0 },
  ];

  rows.forEach((r) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${r.label}</td><td>${r.value}</td>`;
    tbody.appendChild(tr);
  });
}

// Render Region Chart
function renderRegionChart(data) {
  const ctx = document.getElementById("regionChart");
  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: data.labels || [],
      datasets: [
        {
          data: data.counts || [],
          backgroundColor: [
            "#004b99",
            "#0a66c2",
            "#007bff",
            "#17a2b8",
            "#ffc107",
            "#28a745",
            "#dc3545",
            "#6f42c1",
          ],
        },
      ],
    },
    options: {
      plugins: { legend: { position: "bottom" } },
    },
  });
}