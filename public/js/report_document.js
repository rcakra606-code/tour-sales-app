// ==========================================================
// 📄 Report Document Logic v5.3.4
// CRUD + Search + Export CSV
// ==========================================================
document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (!token || token === "undefined") return (window.location.href = "/login.html");

  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  document.getElementById("year").textContent = new Date().getFullYear();
  document.getElementById("activeUser").textContent = `${user.staff_name || user.username} (${user.role})`;

  const form = document.getElementById("documentForm");
  const tableBody = document.querySelector("#documentTable tbody");
  const searchInput = document.getElementById("searchDocument");

  async function loadDocuments() {
    const res = await fetch("/api/documents", { headers });
    const data = await res.json();
    renderDocuments(data);
  }

  function renderDocuments(data) {
    tableBody.innerHTML = "";
    data.forEach((d) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${d.receivedDate || "-"}</td>
        <td>${d.guestName || "-"}</td>
        <td>${d.bookingCode || "-"}</td>
        <td>${d.documentType || "-"}</td>
        <td>${d.processType || "-"}</td>
        <td>${d.staffName || "-"}</td>
        <td>${d.estimatedFinish || "-"}</td>
        <td>
          <button class="btn small danger" data-id="${d.id}" data-action="delete">🗑️</button>
        </td>`;
      tableBody.appendChild(tr);
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const docData = {
      receivedDate: form.receivedDate.value,
      sentDate: form.sentDate.value,
      guestName: form.guestName.value,
      documentType: form.documentType.value,
      processType: form.processType.value,
      bookingCode: form.bookingCode.value,
      invoiceNumber: form.invoiceNumber.value,
      guestPhone: form.guestPhone.value,
      estimatedFinish: form.estimatedFinish.value,
      staffName: form.staffName.value,
      tourCode: form.tourCode.value,
    };

    await fetch("/api/documents", { method: "POST", headers, body: JSON.stringify(docData) });
    form.reset();
    loadDocuments();
  });

  // Delete
  tableBody.addEventListener("click", async (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const id = btn.dataset.id;
    if (btn.dataset.action === "delete" && confirm("Hapus data dokumen ini?")) {
      await fetch(`/api/documents/${id}`, { method: "DELETE", headers });
      loadDocuments();
    }
  });

  // Search
  searchInput.addEventListener("input", () => {
    const q = searchInput.value.toLowerCase();
    const rows = tableBody.querySelectorAll("tr");
    rows.forEach((r) => {
      r.style.display = r.innerText.toLowerCase().includes(q) ? "" : "none";
    });
  });

  // Export CSV
  document.getElementById("exportDocument").addEventListener("click", () => {
    const rows = [["Tgl Terima", "Tamu", "Booking DMS", "Negara", "Proses", "Staff", "Estimasi"]];
    document