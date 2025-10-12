// ================================
// ✅ Dashboard Frontend Script (Final Compatible)
// ================================

// Cek token login
const token = localStorage.getItem("token");
if (!token) {
  alert("Sesi login berakhir. Silakan login kembali.");
  window.location.href = "/";
}

// ================================
// ✅ Utility Toast
// ================================
function showToast(message, type = "error") {
  const color = type === "success" ? "bg-green-500" : "bg-red-500";
  const toast = document.createElement("div");
  toast.className = `${color} text-white px-4 py-2 rounded shadow-lg fixed top-4 right-4 z-50 animate-fadeIn`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ================================
// ✅ Load Dashboard Data
// ================================
async function loadDashboard() {
  try {
    const response = await fetch("/api/dashboard", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        showToast("Sesi login sudah berakhir, silakan login ulang.");
        localStorage.clear();
        setTimeout(() => (window.location.href = "/"), 1200);
        return;
      }
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    if (!data.success) throw new Error(data.message || "Gagal memuat dashboard");

    renderSummary(data.data);
    await Promise.all([loadRecentTours(), loadSalesChart()]);
  } catch (err) {
    console.error("Dashboard Error:", err);
    showToast(`Gagal memuat data dashboard: ${err.message}`);
  }
}

// ================================
// ✅ Render Ringkasan Dashboard
// ================================
function renderSummary(data) {
  document.getElementById("totalSales").textContent = data.totalSales ?? 0;
  document.getElementById("totalTours").textContent = data.totalTours ?? 0;

  if (document.getElementById("pendingTours"))
    document.getElementById("pendingTours").textContent =
      data.pendingTours ?? 0;
}

// ================================
// ✅ Load Recent Tours Table
// ================================
async function loadRecentTours() {
  try {
    const res = await fetch("/api/tours", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();
    const tours = json?.tours || json?.data || [];

    const tbody = document.getElementById("tourTable");
    if (!tbody) return;

    tbody.innerHTML = "";

    tours
      .slice(-5)
      .reverse()
      .forEach((t) => {
        const tr = document.createElement("tr");
        tr.className = "border-b hover:bg-gray-50 transition";
        tr.innerHTML = `
          <td class="py-2 px-4">${t.title || t.tour_name || "-"}</td>
          <td class="py-2 px-4">${t.description || "-"}</td>
          <td class="py-2 px-4">${t.date || "-"}</td>
          <td class="py-2 px-4 text-right">Rp ${
            (t.price || 0).toLocaleString("id-ID")
          }</td>
        `;
        tbody.appendChild(tr);
      });
  } catch (err) {
    console.error("Load tours error:", err);
    showToast("Gagal memuat daftar tour.");
  }
}

// ================================
// ✅ Load Sales Chart (Chart.js)
// ================================
async function loadSalesChart() {
  try {
    const res = await fetch("/api/sales", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();
    const sales = json?.sales || json?.data || [];

    const recent = sales.slice(-7).reverse();
    const labels = recent.map(
      (s) => s.sale_date || s.date || "Tidak diketahui"
    );
    const values = recent.map((s) => s.amount || s.total || 0);

    const canvas = document.getElementById("salesChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    // Hancurkan chart lama jika sudah ada
    if (window.salesChartInstance) {
      window.salesChartInstance.destroy();
    }

    window.salesChartInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Penjualan (Rp)",
            data: values,
            backgroundColor: "rgba(37, 99, 235, 0.6)",
            borderColor: "rgba(37, 99, 235, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (val) => "Rp " + val.toLocaleString("id-ID"),
            },
          },
        },
      },
    });
  } catch (err) {
    console.error("Sales chart error:", err);
    showToast("Gagal memuat grafik penjualan.");
  }
}

// ================================
// ✅ Logout Handler
// ================================
document.getElementById("logout")?.addEventListener("click", () => {
  localStorage.clear();
  showToast("Berhasil logout", "success");
  setTimeout(() => (window.location.href = "/"), 800);
});

// ================================
// ✅ Init
// ================================
document.addEventListener("DOMContentLoaded", loadDashboard);
