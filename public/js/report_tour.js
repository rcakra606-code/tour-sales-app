// ==========================================================
// ✈️ Report Tour Logic v5.3.4
// CRUD + Search + Export + Region Data Integration
// ==========================================================
document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (!token || token === "undefined") return (window.location.href = "/login.html");

  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  document.getElementById("year").textContent = new Date().getFullYear();
  document.getElementById("activeUser").textContent = `${user.staff_name || user.username} (${user.role})`;

  const form = document.getElementById("tourForm");
  const tableBody = document.querySelector("#tourTable tbody");
  const searchInput = document.getElementById("searchInput");
  const regionList = document.getElementById("regionList");

  // Load region list
  try {
    const res = await fetch("/api/regions", { headers });
    const regions = await res.json();
    regionList.innerHTML = regions.map(r => `<option value="${r.name}">`).join("");
  } catch {
    console.warn("⚠️ Gagal memuat region list");
  }

  // Load tour data
  async function loadTours() {
    const res = await fetch("/api/tours", { headers });
    const data = await res.json();
    renderTable(data);
  }

  function renderTable(data) {
    tableBody.innerHTML = "";
    data.forEach((t) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${t.registrationDate || "-"}</td>
        <td>${t.leadPassenger || "-"}</td>
        <td>${t.tourCode || "-"}</td>
        <td>${t.region || "-"}</td>
        <td>${t.staff || "-"}</td>
        <td>${t.departureStatus || "-"}</td>
        <td>
          <button class="btn small" data-id="${t.id}" data-action="edit">✏️</button>
          <button class="btn small danger" data-id="${t.id}" data-action="delete">🗑️</button>
        </td>`;
      tableBody.appendChild(tr);
    });
  }

  // Simpan data baru
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = {
      registrationDate: form.registrationDate.value,
      leadPassenger: form.leadPassenger.value,
      allPassengers: form.allPassengers.value,
      tourCode: form.tourCode.value,
      region: form.region.value,
      departureDate: form.departureDate.value,
      bookingCode: form.bookingCode.value,
      tourPrice: parseFloat(form.tourPrice.value) || 0,
      staff: form.staff.value,
      departureStatus: form.departureStatus.value,
    };

    await fetch("/api/tours", {
      method: "POST",
      headers,
      body: JSON.stringify(formData),
    });

    form.reset();
    loadTours();
  });

  // Search filter
  searchInput.addEventListener("input", () => {
    const q = searchInput.value.toLowerCase();
    const rows = tableBody.querySelectorAll("tr");
    rows.forEach((r) => {
      r.style.display = r.innerText.toLowerCase().includes(q) ? "" : "none";
    });
  });

  // Delete / Edit
  tableBody.addEventListener("click", async (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const id = btn.dataset.id;
    const action = btn.dataset.action;

    if (action === "delete") {
      if (!confirm("Hapus data ini?")) return;
      await fetch(`/api/tours/${id}`, { method: "DELETE", headers });
      loadTours();
    }
  });

  // Export CSV
  document.getElementById("exportCSV").addEventListener("click", () => {
    const rows = [["Tanggal", "Lead Passenger", "Tour Code", "Region", "Staff", "Status"]];
    document.querySelectorAll("#tourTable tbody tr").forEach((tr) => {
      const cols = Array.from(tr.children).map((td) => td.innerText);
      rows.push(cols.slice(0, 6));
    });

    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tour-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  });

  loadTours();
});