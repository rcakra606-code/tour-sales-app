// ==========================================================
// 👥 User Management v5.3.6
// Fix: Staff Name display + CRUD sync with backend
// ==========================================================
document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (!token || token === "undefined") return (window.location.href = "/login.html");

  // Hanya admin yang boleh akses
  if (user.role !== "admin") {
    alert("❌ Akses hanya untuk Admin");
    return (window.location.href = "/dashboard.html");
  }

  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  document.getElementById("year").textContent = new Date().getFullYear();
  document.getElementById("activeUser").textContent = `${user.staff_name || user.username} (${user.role})`;

  const form = document.getElementById("userForm");
  const tableBody = document.querySelector("#userTable tbody");
  const searchInput = document.getElementById("searchUser");

  // ==========================================================
  // LOAD USERS
  // ==========================================================
  async function loadUsers() {
    try {
      const res = await fetch("/api/users", { headers });
      if (!res.ok) throw new Error("Gagal memuat user");
      const data = await res.json();
      renderUsers(data);
    } catch (err) {
      console.error("❌ Load users error:", err);
    }
  }

  function renderUsers(users) {
    tableBody.innerHTML = "";
    users.forEach((u) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${u.username}</td>
        <td>${u.staff_name || "-"}</td>
        <td>${u.role}</td>
        <td>
          <button class="btn small danger" data-id="${u.id}" data-action="delete">🗑️</button>
        </td>`;
      tableBody.appendChild(tr);
    });
  }

  // ==========================================================
  // ADD USER
  // ==========================================================
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      username: form.username.value.trim(),
      staff_name: form.staffName.value.trim(),
      password: form.password.value,
      role: form.role.value,
    };

    if (!payload.username || !payload.password) {
      return alert("⚠️ Username dan Password wajib diisi!");
    }

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menambah user");

      alert("✅ User berhasil dibuat!");
      form.reset();
      await loadUsers();
    } catch (err) {
      console.error("❌ Add user error:", err);
      alert(err.message);
    }
  });

  // ==========================================================
  // DELETE USER
  // ==========================================================
  tableBody.addEventListener("click", async (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const id = btn.dataset.id;
    if (btn.dataset.action === "delete" && confirm("Hapus user ini?")) {
      try {
        const res = await fetch(`/api/users/${id}`, {
          method: "DELETE",
          headers,
        });
        if (!res.ok) throw new Error("Gagal menghapus user");
        alert("🗑️ User berhasil dihapus!");
        await loadUsers();
      } catch (err) {
        console.error("❌ Delete user error:", err);
        alert("❌ Gagal menghapus user.");
      }
    }
  });

  // ==========================================================
  // SEARCH FILTER
  // ==========================================================
  searchInput.addEventListener("input", () => {
    const q = searchInput.value.toLowerCase();
    const rows = tableBody.querySelectorAll("tr");
    rows.forEach((r) => {
      r.style.display = r.innerText.toLowerCase().includes(q) ? "" : "none";
    });
  });

  // ==========================================================
  // INIT
  // ==========================================================
  await loadUsers();
});