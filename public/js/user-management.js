// ==========================================================
// 👥 User Management — v5.3.6
// ==========================================================
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("userForm");
  const tableBody = document.querySelector("#userTable tbody");
  const searchInput = document.getElementById("searchUser");
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  async function loadUsers() {
    try {
      const res = await fetch("/api/users", { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal memuat data user");
      renderTable(data);
    } catch (err) {
      console.error("❌ loadUsers error:", err);
    }
  }

  function renderTable(data) {
    const query = searchInput.value.toLowerCase();
    const filtered = data.filter(
      (u) =>
        u.username.toLowerCase().includes(query) ||
        (u.staff_name && u.staff_name.toLowerCase().includes(query))
    );

    tableBody.innerHTML = "";
    filtered.forEach((u) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${u.id}</td>
        <td>${u.username}</td>
        <td>${u.staff_name || "-"}</td>
        <td>${u.role}</td>
        <td>
          <button class="btn danger small" data-id="${u.id}">🗑️ Hapus</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });

    tableBody.querySelectorAll(".btn.danger").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const id = e.target.dataset.id;
        if (!confirm("Yakin ingin menghapus user ini?")) return;
        try {
          const res = await fetch(`/api/users/${id}`, { method: "DELETE", headers });
          const result = await res.json();
          if (!res.ok) throw new Error(result.message);
          alert("✅ User berhasil dihapus");
          loadUsers();
        } catch (err) {
          alert("❌ Gagal menghapus user: " + err.message);
        }
      });
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value.trim();
    const staff_name = document.getElementById("staffName").value.trim();
    const password = document.getElementById("password").value.trim();
    const role = document.getElementById("role").value;

    if (!username || !password || !role)
      return alert("Username, password, dan role wajib diisi");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers,
        body: JSON.stringify({ username, staff_name, password, role }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      alert("✅ User berhasil ditambahkan");
      form.reset();
      loadUsers();
    } catch (err) {
      alert("❌ Gagal menambahkan user: " + err.message);
    }
  });

  searchInput.addEventListener("input", loadUsers);
  loadUsers();
});