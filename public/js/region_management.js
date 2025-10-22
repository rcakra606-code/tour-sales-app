// ==========================================================
// 🌍 Region Management — Travel Dashboard Enterprise v5.4.9
// ==========================================================

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const tableBody = document.getElementById("regionTableBody");
  const form = document.getElementById("regionForm");
  const msg = document.getElementById("regionMsg");

  // ===== LOAD REGIONS =====
  async function loadRegions() {
    const res = await fetch("/api/regions", {
      headers: { Authorization: "Bearer " + token }
    });
    const data = await res.json();

    tableBody.innerHTML = data
      .map(
        (r, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${r.region_name}</td>
        ${
          role === "admin" || role === "semiadmin"
            ? `<td><button class="delete-btn" data-id="${r.id}">Hapus</button></td>`
            : `<td>-</td>`
        }
      </tr>`
      )
      .join("");

    // Delete buttons
    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const id = e.target.dataset.id;
        if (!confirm("Hapus region ini?")) return;
        await fetch(`/api/regions/${id}`, {
          method: "DELETE",
          headers: { Authorization: "Bearer " + token }
        });
        loadRegions();
      });
    });
  }

  await loadRegions();

  // ===== ADD REGION =====
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";

    const region_name = document.getElementById("region_name").value.trim();
    if (!region_name) return (msg.textContent = "Nama region wajib diisi.");

    const res = await fetch("/api/regions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ region_name })
    });

    const data = await res.json();
    msg.textContent = data.message || (res.ok ? "Region berhasil ditambahkan." : "Gagal menambahkan region.");
    form.reset();
    loadRegions();
  });
});