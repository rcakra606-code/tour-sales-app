// ================================
// ✅ Token & Auth
// ================================
const token = localStorage.getItem("token");
const username = localStorage.getItem("username");

if (!token) {
  alert("Sesi login berakhir. Silakan login kembali.");
  window.location.href = "/";
}

// ================================
// ✅ Toast Utility
// ================================
function showToast(msg, type = "error") {
  const color = type === "success" ? "bg-green-500" : "bg-red-500";
  const toast = document.createElement("div");
  toast.className = `${color} text-white px-4 py-2 rounded shadow-lg fixed top-4 right-4 z-50 animate-fadeIn`;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ================================
// ✅ Load Dashboard Data
// ================================
async function loadDashboard() {
  try {
    const res = await fetch("/api/dashboard", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Gagal mengambil data dashboard");
    const data = await res.json();

    if (!data.success) throw new Error(data.message);
    renderSummary(data.data);
    await loadRecentTours();
    await loadSalesChart();
  } catch (err) {
    console.error("Dashboard Error:", err);
    showToast("Gagal memuat dashboard.");
  }
}

// ================================
// ✅ Render Summary
// ================================
function renderSummary(data) {
  document.getElementById("totalSales").textContent = data.totalSales || 0;
  document.getElementById("totalTours").textContent = data.totalTours || 0;

  // Hitung total revenue dari sales bila tersedia
  if (data.totalRevenue !== undefined) {
    document.getElementById("totalRevenue").textContent =
      "Rp " + Number(data.totalRevenue).toLocaleString("id-ID");
  } else {
    document.getElementById("totalRevenue").textContent = "Rp 0";
  }
}

// ================================
// ✅ Load Recent Tours
// ================================
async function loadRecentTours() {
  try {
    const res = await fetch("/api/tours", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Gagal memuat tour");
    const data = await res.json();
    const tours = data?.tours || [];

    const tbody = document.getElementById("tourTable");
    if (!tbody) return;

    tbody.innerHTML = "";

    tours.slice(-5).reverse().forEach((t) => {
      const tr = document.createElement("tr");
      tr.className =
        "border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700";
      tr.innerHTML = `
        <td class="py-2 px-4">${t.lead_passenger || "-"}</td>
        <td class="py-2 px-4">${t.tour_code || "-"}</td>
        <td class="py-2 px-4">${t.region || "-"}</td>
        <td class="py-2 px-4">${t.departure_date || "-"}</td>
        <td class="py-2 px-4 text-right">Rp ${Number(
          t.price || 0
        ).toLocaleString("id-ID")}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Load tours error:", err);
    showToast("Gagal memuat data tour.");
  }
}

// ================================
// ✅ Sales Chart
// ================================
async function loadSalesChart() {
  try {
    const res = await fetch("/api/sales", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Gagal memuat data sales");
    const data = await res.json();
    const sales = data?.sales || [];

    const recent = sales.slice(-7).reverse();
    const labels = recent.map((s) => s.sale_date || "N/A");
    const values = recent.map((s) => s.amount || 0);

    const ctx = document.getElementById("salesChart");
    if (!ctx) return;

    new Chart(ctx.getContext("2d"), {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Penjualan (Rp)",
            data: values,
            backgroundColor: "rgba(59,130,246,0.6)",
            borderColor: "rgba(37,99,235,1)",
            borderWidth: 1,
            borderRadius: 5,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (val) => "Rp " + val.toLocaleString("id-ID"),
            },
          },
        },
        plugins: {
          legend: { display: false },
        },
      },
    });
  } catch (err) {
    console.error("Sales chart error:", err);
    showToast("Gagal memuat grafik penjualan.");
  }
}

// ================================
// ✅ Logout
// ================================
document.getElementById("logout")?.addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  showToast("Logout berhasil", "success");
  setTimeout(() => (window.location.href = "/"), 1000);
});

// ================================
// 🌙 Theme Toggle
// ================================
document.getElementById("toggleTheme")?.addEventListener("click", () => {
  document.documentElement.classList.toggle("dark");
  localStorage.setItem(
    "theme",
    document.documentElement.classList.contains("dark") ? "dark" : "light"
  );
});

// Restore theme preference
if (localStorage.getItem("theme") === "dark") {
  document.documentElement.classList.add("dark");
}

// ================================
// 🚀 Init
// ================================
document.addEventListener("DOMContentLoaded", () => {
  if (username) {
    const el = document.getElementById("username");
    if (el) el.textContent = username;
  }
  loadDashboard();
});
