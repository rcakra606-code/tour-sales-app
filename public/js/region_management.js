// ==========================================================
// 🌍 Region Management v5.3.4
// CRUD + Search + Export CSV
// ==========================================================
document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (!token || token === "undefined") return (window.location.href = "/login.html");

  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  document.getElementById("year").textContent = new Date().getFullYear();
  document.getElementById("activeUser").textContent = `${user.staff_name || user.username} (${user.role})`;

  const form = document.getElementById("regionForm");
  const tableBody = document.querySelector("#regionTable tbody");
  const searchInput = document.getElementById("searchRegion");

  async function loadRegions() {
    const res = await fetch("/api/regions", { headers });
    const data = await res.json();
    renderTable(data);
  }

  function renderTable(data) {
    tableBody.innerHTML = "";
    data.forEach((r) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${r.code || "-"}</td>
        <td>${r.name || "-"}</td>
        <td>
          <button class="btn small danger" data-id="${r.id}" data-action="delete">🗑️</button>
        </td>`;
      tableBody.appendChild(tr);
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const region = {
      code: form.regionCode.value,
      name: form.regionName.value,
    };

    await fetch("/api/regions", {
      method: "POST",
      headers,
      body: JSON.stringify(region),
    });

    form.reset();
    loadRegions();
  });

  // Delete region
  tableBody.addEventListener("click", async (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const id = btn.dataset.id;
    if (btn.dataset.action === "delete" && confirm("Hapus region ini?")) {
      await fetch(`/api/regions/${id}`, { method: "DELETE", headers });
      loadRegions();
    }
  });

  // Search filter
  searchInput.addEventListener("input", () => {
    const q = searchInput.value.toLowerCase();
    const rows = tableBody.querySelectorAll("tr");
    rows.forEach((r) => {
      r.style.display = r.innerText.toLowerCase().includes(q) ? "" : "none";
    });
  });

  // Export CSV
  document.getElementById("exportRegion").addEventListener("click", () => {
    const rows = [["Kode", "Nama Region"]];
    document.querySelectorAll("#regionTable tbody tr").forEach((tr) => {
      const cols = Array.from(tr.children).map((td) => td.innerText);
      rows.push(cols.slice(0, 2));
    });

    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `region-data-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  });

  loadRegions();
});