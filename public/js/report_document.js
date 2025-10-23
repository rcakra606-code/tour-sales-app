// ==========================================================
// 📑 Document Management — Travel Dashboard Enterprise v5.4.9
// ==========================================================

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const staffSelect = document.getElementById("staff_name");
  const form = document.getElementById("documentForm");
  const msg = document.getElementById("documentMsg");
  const tableBody = document.getElementById("documentTableBody");

  // ===== LOAD STAFF =====
  async function loadStaffOptions() {
    if (role === "staff") {
      const staff = localStorage.getItem("staff_name");
      staffSelect.innerHTML = `<option selected>${staff}</option>`;
      staffSelect.disabled = true;
      return;
    }

    const res = await fetch("/api/users/staff-list", {
      headers: { Authorization: "Bearer " + token }
    });
    const data = await res.json();
    staffSelect.innerHTML = data
      .map((u) => `<option value="${u.staff_name}">${u.staff_name} (${u.role})</option>`)
      .join("");
  }

  // ===== LOAD DOCUMENTS =====
  async function loadDocuments() {
    const res = await fetch("/api/report/documents", {
      headers: { Authorization: "Bearer " + token }
    });
    const data = await res.json();

    tableBody.innerHTML = data
      .map(
        (d, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${d.receive_date ? d.receive_date.split("T")[0] : "-"}</td>
        <td>${d.send_date ? d.send_date.split("T")[0] : "-"}</td>
        <td>${d.guest_name}</td>
        <td>${d.passport_visa}</td>
        <td>${d.process_type}</td>
        <td>${d.booking_code_dms}</td>
        <td>${d.invoice_number}</td>
        <td>${d.phone_number}</td>
        <td>${d.estimated_finish ? d.estimated_finish.split("T")[0] : "-"}</td>
        <td>${d.staff_name}</td>
        <td><button class="delete-btn" data-id="${d.id}">🗑️</button></td>
      </tr>`
      )
      .join("");

    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const id = e.target.dataset.id;
        if (!confirm("Hapus data dokumen ini?")) return;
        await fetch(`/api/report/documents/${id}`, {
          method: "DELETE",
          headers: { Authorization: "Bearer " + token }
        });
        loadDocuments();
      });
    });
  }

  await loadStaffOptions();
  await loadDocuments();

  // ===== SUBMIT FORM =====
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";

    const body = {
      receive_date: form.receive_date.value,
      send_date: form.send_date.value,
      guest_name: form.guest_name.value,
      passport_visa: form.passport_visa.value,
      process_type: form.process_type.value,
      booking_code_dms: form.booking_code_dms.value,
      invoice_number: form.invoice_number.value,
      phone_number: form.phone_number.value,
      estimated_finish: form.estimated_finish.value,
      staff_name: staffSelect.value,
      tour_code: form.tour_code.value,
      document_remarks: form.document_remarks.value
    };

    const res = await fetch("/api/report/documents", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    msg.textContent = data.message || (res.ok ? "Dokumen berhasil disimpan." : "Gagal menyimpan dokumen.");
    form.reset();
    loadDocuments();
  });
});