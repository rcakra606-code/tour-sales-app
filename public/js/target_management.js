document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const staffSelect = document.getElementById("staff_name");
  const form = document.getElementById("targetForm");
  const msg = document.getElementById("targetMsg");

  // ===== LOAD STAFF DROPDOWN =====
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
      .map(u => `<option value="${u.staff_name}">${u.staff_name} (${u.role})</option>`)
      .join("");
  }

  await loadStaffOptions();

  // ===== SUBMIT TARGET =====
  form.addEventListener("submit", async e => {
    e.preventDefault();
    msg.textContent = "";

    const body = {
      staff_name: staffSelect.value,
      month: document.getElementById("month").value,
      year: document.getElementById("year").value,
      target_sales: document.getElementById("target_sales").value,
      target_profit: document.getElementById("target_profit").value
    };

    const res = await fetch("/api/targets", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    msg.textContent = data.message || (res.ok ? "Berhasil menyimpan target!" : "Gagal menyimpan.");
  });
});