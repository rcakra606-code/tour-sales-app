/**
 * ==========================================================
 * app.js — Travel Dashboard Enterprise v3.3 Final
 * ==========================================================
 * ✅ Global UI Utility for All Pages
 * ✅ Toasts, Loader, Auth Verify, CSV/XLSX Export
 * ✅ Used by dashboard.html, report_tour.html, report_sales.html, report_document.html
 * ==========================================================
 */

// Base API URL
const API_BASE = "/api";

/* ==========================================================
   AUTH HANDLING
   ========================================================== */
async function verifyAuth() {
  const token = localStorage.getItem("token");
  if (!token) {
    location.href = "/login.html";
    return null;
  }
  try {
    const res = await fetch(`${API_BASE}/auth/verify`, {
      headers: { "Authorization": `Bearer ${token}` },
    });
    const data = await res.json();
    if (!data.ok) {
      localStorage.removeItem("token");
      location.href = "/login.html";
      return null;
    }
    document.getElementById("currentUser")?.textContent = `${data.user.name} (${data.user.type})`;
    return data.user;
  } catch (err) {
    console.error("Auth verify error:", err);
    localStorage.removeItem("token");
    location.href = "/login.html";
  }
}

// Logout handler
document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.removeItem("token");
  location.href = "/login.html";
});

/* ==========================================================
   TOAST SYSTEM
   ========================================================== */
function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;
  const toast = document.createElement("div");
  const color =
    type === "success"
      ? "bg-green-500"
      : type === "error"
      ? "bg-red-500"
      : type === "warning"
      ? "bg-yellow-500"
      : "bg-gray-700";
  toast.className = `${color} text-white px-4 py-2 rounded-lg shadow-md animate-fade-in-up`;
  toast.innerHTML = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("opacity-0", "translate-y-2");
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

/* ==========================================================
   GLOBAL LOADER
   ========================================================== */
function showLoader(show = true, message = "Memuat data...") {
  const loader = document.getElementById("globalLoader");
  const loaderMsg = document.getElementById("loaderMessage");
  if (!loader) return;
  loaderMsg.textContent = message;
  if (show) loader.classList.remove("hidden");
  else loader.classList.add("hidden");
}

/* ==========================================================
   EXPORT TO CSV & EXCEL
   ========================================================== */
function exportTableToCSV(filename, tableSelector) {
  const rows = document.querySelectorAll(`${tableSelector} tr`);
  const csv = [];
  for (let row of rows) {
    const cols = row.querySelectorAll("td, th");
    const rowData = [];
    for (let col of cols) {
      let text = col.innerText.replace(/,/g, " ");
      rowData.push(`"${text}"`);
    }
    csv.push(rowData.join(","));
  }
  const csvString = csv.join("\n");
  const blob = new Blob([csvString], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function exportTableToExcel(filename, tableSelector) {
  const table = document.querySelector(tableSelector);
  if (!table) return showToast("Tabel tidak ditemukan", "error");
  const wb = XLSX.utils.table_to_book(table, { sheet: "Sheet1" });
  XLSX.writeFile(wb, filename);
}

/* ==========================================================
   NOTIFICATION DUMMY (Future real-time integration)
   ========================================================== */
function simulateNotification(countTours = 0, countLogs = 0) {
  const badgeTours = document.getElementById("notifBadge");
  const badgeLogs = document.getElementById("notifBadgeLogs");
  if (badgeTours) {
    badgeTours.textContent = countTours;
    badgeTours.classList.toggle("hidden", countTours === 0);
  }
  if (badgeLogs) {
    badgeLogs.textContent = countLogs;
    badgeLogs.classList.toggle("hidden", countLogs === 0);
  }
}

/* ==========================================================
   AUTO INIT ON PAGE LOAD (Optional)
   ========================================================== */
window.addEventListener("DOMContentLoaded", async () => {
  // Run auth verify on load (for pages that need login)
  if (document.getElementById("currentUser")) await verifyAuth();

  // Attach export buttons globally if present
  if (document.getElementById("exportTourCSV"))
    document.getElementById("exportTourCSV").onclick = () =>
      exportTableToCSV("tour_report.csv", "#tourTable");
  if (document.getElementById("exportTourXLSX"))
    document.getElementById("exportTourXLSX").onclick = () =>
      exportTableToExcel("tour_report.xlsx", "#tourTable");

  if (document.getElementById("exportSalesCSV"))
    document.getElementById("exportSalesCSV").onclick = () =>
      exportTableToCSV("sales_report.csv", "#salesTable");
  if (document.getElementById("exportSalesXLSX"))
    document.getElementById("exportSalesXLSX").onclick = () =>
      exportTableToExcel("sales_report.xlsx", "#salesTable");

  if (document.getElementById("exportDocCSV"))
    document.getElementById("exportDocCSV").onclick = () =>
      exportTableToCSV("document_report.csv", "#documentTable");
  if (document.getElementById("exportDocXLSX"))
    document.getElementById("exportDocXLSX").onclick = () =>
      exportTableToExcel("document_report.xlsx", "#documentTable");
});

/* ==========================================================
   SMALL CSS ANIMATION FOR TOAST
   ========================================================== */
const style = document.createElement("style");
style.textContent = `
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up {
  animation: fadeInUp 0.3s ease forwards;
}
`;
document.head.appendChild(style);
