// ==========================================================
// 💰 Sales Management — Travel Dashboard Enterprise v5.4.9
// ==========================================================

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const staffSelect = document.getElementById("staff_name");
  const form = document.getElementById("salesForm");
  const msg = document.getElementById("salesMsg");
  const tableBody = document.getElementById("salesTableBody");

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

  // ===== LOAD SALES =====
  async function loadSales() {
    const res = await fetch("/api/sales", {
      headers: { Authorization: "Bearer " + token }
    });
    const data = await res.json();

    tableBody.innerHTML = data
      .map(
        (s, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${s.transaction_date ? s.transaction_date.split("T")[0] : "-"}</td>
          <td>${s.invoice_number}</td>
          <td>${s.customer_name}</td>
          <td>${s.sales_category}</td>
          <td>${s.sales_amount}</td>
          <td>${s.profit_amount}</td>
          <td>${s.staff_name}</td>
          <td><button class="delete-btn" data-id="${s.id}">🗑️</button></td>
        </tr>`
      )
      .join("");

    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const id = e.target.dataset.id;
        if (!confirm("Hapus data penjualan ini?")) return;
        await fetch(`/api/sales/${id}`, {
          method: "DELETE",
          headers: { Authorization: "Bearer " + token }
        });
        loadSales();
      });
    });
  }

  await loadStaffOptions();
  await loadSales();

  // ===== SUBMIT FORM =====
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";

    const body = {
      transaction_date: form.transaction_date.value,
      invoice_number: form.invoice_number.value,
      customer_name: form.customer_name.value,
      sales_category: form.sales_category.value,
      sales_amount: parseFloat(form.sales_amount.value) || 0,
      profit_amount: parseFloat(form.profit_amount.value) || 0,
      staff_name: staffSelect.value
    };

    const res = await fetch("/api/sales", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    msg.textContent = data.message || (res.ok ? "Data sales berhasil disimpan." : "Gagal menyimpan data sales.");
    form.reset();
    loadSales();
  });
});