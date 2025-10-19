// public/js/dashboard.js
const sidebar = document.getElementById("sidebar");
const sidebarToggle = document.getElementById("sidebarToggle");
const themeToggle = document.getElementById("themeToggle");
const main = document.getElementById("main");
const yearSpan = document.getElementById("year");

yearSpan.textContent = new Date().getFullYear();

// toggle collapsed/expanded
sidebarToggle.addEventListener("click", (e) => {
  // if mobile -> toggle overlay open/close
  if (window.innerWidth <= 900) {
    sidebar.classList.toggle("open");
  } else {
    sidebar.classList.toggle("collapsed");
    // adjust main margin left via CSS sibling selector
  }
});

// close sidebar when clicking outside on mobile
document.addEventListener("click", (e) => {
  if (window.innerWidth <= 900) {
    if (!sidebar.contains(e.target) && !sidebar.classList.contains("open")) return;
    if (!sidebar.contains(e.target) && sidebar.classList.contains("open")) {
      sidebar.classList.remove("open");
    }
  }
});

// theme toggle
themeToggle.addEventListener("click", () => {
  const body = document.body;
  body.classList.toggle("theme-dark");
  body.classList.toggle("theme-light");
  const theme = body.classList.contains("theme-dark") ? "dark" : "light";
  localStorage.setItem("td_theme", theme);
});

// persist theme
(function initTheme() {
  const saved = localStorage.getItem("td_theme");
  if (saved === "dark") {
    document.body.classList.add("theme-dark");
  } else {
    document.body.classList.add("theme-light");
  }
})();

// minimal fetch to populate summary (you can extend with real endpoints)
async function loadSummary() {
  try {
    const res = await fetch("/api/dashboard/summary");
    if (!res.ok) return;
    const data = await res.json();
    document.getElementById("totalSales").textContent = data.total_sales?.toLocaleString() ?? "0";
    document.getElementById("totalProfit").textContent = data.total_profit?.toLocaleString() ?? "0";
    document.getElementById("totalTours").textContent = data.total_tours ?? "0";
    document.getElementById("totalTargets").textContent = data.total_targets ?? "0";
    // placeholders for panels
    document.getElementById("tourSummary").textContent = "Tour summary siap (lihat detail pada Report Tour).";
    document.getElementById("salesSummary").textContent = "Sales performance siap (lihat Report Sales).";
  } catch (err) {
    console.warn("Gagal load summary:", err);
  }
}
loadSummary();