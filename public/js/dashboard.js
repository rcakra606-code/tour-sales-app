/**
 * ==========================================================
 * 📁 public/js/dashboard.js
 * Travel Dashboard Enterprise v5.0
 * ==========================================================
 * Fitur:
 * - Sidebar toggle (desktop & mobile)
 * - Dark/Light theme toggle
 * - Fetch summary dashboard
 * - Render Tour Summary (per bulan, per region)
 * ==========================================================
 */

// ======== ELEMENT SELECTORS ========
const sidebar = document.getElementById("sidebar");
const sidebarToggle = document.getElementById("sidebarToggle");
const themeToggle = document.getElementById("themeToggle");
const yearSpan = document.getElementById("year");
const totalSalesEl = document.getElementById("totalSales");
const totalProfitEl = document.getElementById("totalProfit");
const totalToursEl = document.getElementById("totalTours");
const totalTargetsEl = document.getElementById("totalTargets");
const totalPaxEl = document.getElementById("totalPax");

// ======== INIT =========
yearSpan.textContent = new Date().getFullYear();

// ======== SIDEBAR TOGGLE =========
sidebarToggle.addEventListener("click", () => {
  if (window.innerWidth <= 900) {
    sidebar.classList.toggle("open");
  } else {
    sidebar.classList.toggle("collapsed");
  }
});

// Tutup sidebar jika klik di luar area (mobile)
document.addEventListener("click", (e) => {
  if (window.innerWidth <= 900) {
    if (!sidebar.contains(e.target) && sidebar.classList.contains("open")) {
      sidebar.classList.remove("open");
    }
  }
});

// ======== THEME TOGGLE =========
themeToggle.addEventListener("click", () => {
  const body = document.body;
  body.classList.toggle("theme-dark");
  body.classList.toggle("theme-light");
  const theme = body.classList.contains("theme-dark") ? "dark" : "light";
  localStorage.setItem("td_theme", theme);
});

// Inisialisasi theme dari localStorage
(function initTheme() {
  const saved = localStorage.getItem("td_theme");
  document.body.classList.add(saved === "dark" ? "theme-dark" : "theme-light");
})();

// ======== FETCH DASHBOARD DATA =========
async function loadSummary() {
  try {
    const res = await fetch("/api/dashboard/summary");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // Update summary cards
    totalSalesEl.textContent = formatRupiah(data.total_sales);
    totalProfitEl.textContent = formatRupiah(data.total_profit);
    totalToursEl.textContent = data.total_tours.toLocaleString("id-ID");
    totalTargetsEl.textContent = data.total_targets.toLocaleString("id-ID");
    totalPaxEl.textContent = data.total_pax.toLocaleString("id-ID");

    // Render Tour Summary (bulan & region)
    renderTourTables(data);
  } catch (err) {
    console.error("❌ Gagal memuat summary dashboard:", err.message);
  }
}

// ======== RENDER TABLES =========
function renderTourTables(data) {
  const monthTable = document.querySelector("#tourByMonth tbody");
  const regionTable = document.querySelector("#tourByRegion tbody");

  if (!data.month_breakdown || !data.region_breakdown) {
    monthTable.innerHTML =
      '<tr><td colspan="4" class="text-center">Tidak ada data tour</td></tr>';
    regionTable.innerHTML =
      '<tr><td colspan="3" class="text-center">Tidak ada data region</td></tr>';
    return;
  }

  // Per Bulan
  monthTable.innerHTML = data.month_breakdown
    .map(
      (m) => `
        <tr>
          <td>${getMonthName(m.month)}</td>
          <td>${m.year}</td>
          <td>${m.tour_count.toLocaleString("id-ID")}</td>
          <td>${m.pax_count.toLocaleString("id-ID")}</td>
        </tr>`
    )
    .join("");

  // Per Region
  regionTable.innerHTML = data.region_breakdown
    .map(
      (r) => `
        <tr>
          <td>${r.region}</td>
          <td>${r.tour_count.toLocaleString("id-ID")}</td>
          <td>${r.pax_count.toLocaleString("id-ID")}</td>
        </tr>`
    )
    .join("");
}

// ======== UTILITIES =========
function getMonthName(num) {
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  return months[num - 1] || "-";
}

function formatRupiah(num) {
  if (isNaN(num)) return "Rp 0";
  return "Rp " + Number(num).toLocaleString("id-ID");
}

// ======== INITIALIZE =========
loadSummary();