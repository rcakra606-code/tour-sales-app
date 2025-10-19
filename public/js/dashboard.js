/**
 * ==========================================================
 * 📁 public/js/dashboard.js
 * Travel Dashboard Enterprise v5.0
 * ==========================================================
 * Fitur:
 * - Sidebar toggle (desktop & mobile)
 * - Dark/Light theme toggle
 * - Fetch summary & targets
 * - Render Tour, Sales, and Target panels
 * ==========================================================
 */

// ======== ELEMENT SELECTORS ========
const sidebar = document.getElementById("sidebar");
const sidebarToggle = document.getElementById("sidebarToggle");
const themeToggle = document.getElementById("themeToggle");
const yearSpan = document.getElementById("year");

// ======== INIT =========
if (yearSpan) yearSpan.textContent = new Date().getFullYear();

// ======== SIDEBAR TOGGLE =========
if (sidebarToggle) {
  sidebarToggle.addEventListener("click", () => {
    if (window.innerWidth <= 900) {
      sidebar.classList.toggle("open");
    } else {
      sidebar.classList.toggle("collapsed");
    }
  });
}

// Tutup sidebar jika klik di luar area (mobile)
document.addEventListener("click", (e) => {
  if (window.innerWidth <= 900) {
    if (!sidebar.contains(e.target) && sidebar.classList.contains("open")) {
      sidebar.classList.remove("open");
    }
  }
});

// ======== THEME TOGGLE =========
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const body = document.body;
    body.classList.toggle("theme-dark");
    body.classList.toggle("theme-light");
    const theme = body.classList.contains("theme-dark") ? "dark" : "light";
    localStorage.setItem("td_theme", theme);
  });
}

// Inisialisasi theme dari localStorage
(function initTheme() {
  const saved = localStorage.getItem("td_theme");
  document.body.classList.add(saved === "dark" ? "theme-dark" : "theme-light");
})();

// ======== FETCH DASHBOARD SUMMARY =========
async function loadSummary() {
  try {
    const res = await fetch("/api/dashboard/summary");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    updateSummaryCards(data);
    renderTourTables(data);
  } catch (err) {
    console.error("❌ Gagal memuat summary dashboard:", err.message);
  }
}

function updateSummaryCards(data) {
  setText("totalSales", formatRupiah(data.total_sales));
  setText("totalProfit", formatRupiah(data.total_profit));
  setText("totalTours", data.total_tours?.toLocaleString("id-ID"));
  setText("totalTargets", data.total_targets?.toLocaleString("id-ID"));
  setText("totalPax", data.total_pax?.toLocaleString("id-ID"));

  // untuk panel Sales
  setText("salesTotal", formatRupiah(data.total_sales));
  setText("profitTotal", formatRupiah(data.total_profit));
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val ?? "—";
}

// ======== RENDER TOUR SUMMARY TABLES =========
function renderTourTables(data) {
  const monthTable = document.querySelector("#tourByMonth tbody");
  const regionTable = document.querySelector("#tourByRegion tbody");

  if (!data.month_breakdown || !data.region_breakdown) {
    monthTable.innerHTML =
      "<tr><td colspan='4' class='text-center'>Tidak ada data tour</td></tr>";
    regionTable.innerHTML =
      "<tr><td colspan='3' class='text-center'>Tidak ada data region</td></tr>";
    return;
  }

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

// ======== FETCH & RENDER TARGET PERFORMANCE =========
async function loadTargets() {
  try {
    const res = await fetch("/api/dashboard/targets");
    if (!res.ok) throw new Error("Gagal memuat target");
    const data = await res.json();

    const container = document.getElementById("targetContainer");
    container.innerHTML = "";

    if (!data || data.length === 0) {
      container.innerHTML = "<p class='muted'>Tidak ada target aktif.</p>";
      return;
    }

    data.forEach((t) => {
      const percent = Math.min(100, Math.round((t.actual / t.target) * 100));
      const html = `
        <div class="target-item">
          <div class="target-header">
            <h5>${capitalize(t.category)}</h5>
            <span>${percent}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress" style="width:${percent}%"></div>
          </div>
          <div class="target-footer">
            <span>Target: ${formatRupiah(t.target)}</span>
            <span>Realisasi: ${formatRupiah(t.actual)}</span>
          </div>
        </div>`;
      container.insertAdjacentHTML("beforeend", html);
    });
  } catch (err) {
    console.error("❌ Gagal load target:", err.message);
    document.getElementById("targetContainer").innerHTML =
      "<p class='muted'>Gagal memuat data target.</p>";
  }
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

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// ======== INITIALIZE =========
loadSummary();
loadTargets();