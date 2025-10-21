// ==========================================================
// 🌍 Region Management — v5.3.6
// ==========================================================
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("regionForm");
  const tableBody = document.querySelector("#regionTable tbody");
  const searchInput = document.getElementById("searchRegion");

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  async function loadRegions() {
    try {
      const res = await fetch("/api/regions", { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal memuat data region");
      renderTable(data);
    } catch (err) {
      console.error("❌ loadRegions error:", err);
    }
  }

  function renderTable(data) {
    const query = searchInput.value.toLowerCase();
    const filtered = data.filter(r => r.name.toLowerCase().includes(query));

    tableBody.innerHTML = "";
    filtered.forEach((r) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${r.id}</td>
        <td>${r.name}</td>
        <td>${r.description || "-"}</td>
        <td>
          <button class="btn danger small" data-id="${r.id}">🗑️ Hapus</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });

    // Tambahkan event delete
    tableBody.querySelectorAll(".btn.danger").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const id = e.target.dataset.id;
        if (!confirm("Yakin ingin menghapus region ini?")) return;
        try {
          const res = await fetch(`/api/regions/${id}`, {
            method: "DELETE",
            headers,
          });
          const result = await res.json();
          if (!res.ok) throw new Error(result.message);
          alert("✅ Region berhasil dihapus");
          loadRegions();
        } catch (err) {
          alert("❌ Gagal menghapus region: " + err.message);
        }
      });
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("regionName").value.trim();
    const description = document.getElementById("regionDesc").value.trim();

    if (!name) return alert("Nama region wajib diisi");

    try {
      const res = await fetch("/api/regions", {
        method: "POST",
        headers,
        body: JSON.stringify({ name, description }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      alert("✅ Region berhasil ditambahkan");
      form.reset();
      loadRegions();
    } catch (err) {
      alert("❌ Gagal menambahkan region: " + err.message);
    }
  });

  searchInput.addEventListener("input", loadRegions);

  loadRegions();
});