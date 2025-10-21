// ==========================================================
// 🪵 Audit Log v5.3.4
// Tracks and displays all user activities
// ==========================================================
document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (!token || token === "undefined") return (window.location.href = "/login.html");

  // Hanya Admin dan SemiAdmin yang bisa mengakses log
  if (!["admin", "semiadmin"].includes(user.role)) {
    alert("❌ Hanya Admin atau Semi Admin yang dapat melihat audit log.");
    return (window.location.href = "/dashboard.html");
  }

  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  document.getElementById("year").textContent = new Date().getFullYear();
  document.getElementById("activeUser").textContent = `${user.staff_name || user.username} (${user.role})`;

  const tableBody = document.querySelector("#auditTable tbody");
  const searchInput = document.getElementById("searchAudit");

  // Load data audit
  async function loadAuditLogs() {
    try {
      const res = await fetch("/api/logs", { headers });
      const data = await res.json();
      renderLogs(data);
    } catch (err) {
      console.error("❌ Error load audit logs:", err);
    }
  }

  function renderLogs(data) {
    tableBody.innerHTML = "";
    data.forEach((log) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${new Date(log.timestamp).toLocaleString("id-ID")}</td>
        <td>${log.username}</td>
        <td>${log.role}</td>
        <td>${log.action}</td>
        <td>${log.module}</td>
        <td>${log.description || "-"}</td>
      `;
      tableBody.appendChild(tr);
    });
  }

  // Filter pencarian
  searchInput.addEventListener("input", () => {
    const q = searchInput.value.toLowerCase();
    const rows = tableBody.querySelectorAll("tr");
    rows.forEach((r) => {
      r.style.display = r.innerText.toLowerCase().includes(q) ? "" : "none";
    });
  });

  // Export CSV
  document.getElementById("exportAudit").addEventListener("click", () => {
    const rows = [["Waktu", "Username", "Role", "Aksi", "Modul", "Deskripsi"]];
    document.querySelectorAll("#auditTable tbody tr").forEach((tr) => {
      const cols = Array.from(tr.children).map((td) => td.innerText);
      rows.push(cols);
    });

    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  });

  loadAuditLogs();
});