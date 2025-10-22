// ==========================================================
// ✈️ Tour Management — Travel Dashboard Enterprise v5.4.9
// ==========================================================

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const form = document.getElementById("tourForm");
  const msg = document.getElementById("tourMsg");
  const staffSelect = document.getElementById("staff_name");
  const regionSelect = document.getElementById("region");
  const tableBody = document.getElementById("tourTableBody");

  // ===== LOAD STAFF OPTIONS =====
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

  // ===== LOAD REGIONS =====
  async function loadRegions() {
    const res = await fetch("/api/regions", {
      headers: { Authorization: "Bearer " + token }
    });
    const data = await res.json();
    regionSelect.innerHTML = data
      .map((r) => `<option value="${r.region_name}">${r.region_name}</option>`)
      .join("");
  }

  await loadStaffOptions();
  await loadRegions();

  // ===== LOAD TOURS =====
  async function loadTours() {
    const res = await fetch("/api/tours", {
      headers: { Authorization: "Bearer " + token }
    });
    const data = await res.json();

    tableBody.innerHTML = data
      .map(
        (t, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${t.lead_passenger}</td>
        <td>${t.region}</td>
        <td>${t.departure_date ? t.departure_date.split("T")[0] : "-"}</td>
        <td>${t.sales_amount}</td>
        <td>${t.profit_amount}</td>
        <td>${t.departure_status}</td>
        <td>
          <button class="delete-btn" data-id="${t.id}">🗑️</button>
        </td>
      </tr>`
      )
      .join("");

    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const id = e.target.dataset.id;
        if (!confirm("Hapus data tour ini?")) return;
        await fetch(`/api/tours/${id}`, {
          method: "DELETE",
          headers: { Authorization: "Bearer " + token }
        });
        loadTours();
      });
    });
  }

  await loadTours();

  // ===== ADD TOUR =====
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";

    const body = {
      registrationDate: form.registration_date.value,
      leadPassenger: form.lead_passenger.value,
      allPassengers: form.all_passengers.value,
      tourCode: form.tour_code.value,
      region: form.region.value,
      departureDate: form.departure_date.value,
      bookingCode: form.booking_code.value,
      tourPrice: parseFloat(form.tour_price.value) || 0,
      discountRemarks: form.discount_remarks.value,
      paymentProof: form.payment_proof.value,
      documentReceived: form.document_received.value,
      visaProcessStart: form.visa_start.value,
      visaProcessEnd: form.visa_end.value,
      documentRemarks: form.document_remarks.value,
      staff_name: staffSelect.value,
      salesAmount: parseFloat(form.sales_amount.value) || 0,
      profitAmount: parseFloat(form.profit_amount.value) || 0,
      departureStatus: form.departure_status.value
    };

    const res = await fetch("/api/tours", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    msg.textContent = data.message || (res.ok ? "Tour berhasil ditambahkan!" : "Gagal menambahkan tour.");
    form.reset();
    loadTours();
  });
});