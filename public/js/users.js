// ==========================================================
// 👥 User Management v5.3.4
// CRUD + Search + Export CSV + Role Access
// ==========================================================
document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (!token || token === "undefined") return (window.location.href = "/login.html");

  // Cegah akses jika bukan admin
  if (user.role !== "admin") {
    alert("❌ Hanya Admin yang dapat mengakses halaman ini.");
    return (window.location.href = "/dashboard.html");
  }

  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  document.getElementById("year").textContent = new Date().getFullYear();
  document.getElementById("activeUser").textContent = `${user.staff_name || user.username} (${user.role})`;

  const form = document.getElementById("userForm");
  const tableBody = document.querySelector("#userTable tbody");
  const searchInput = document.getElementById("searchUser");

  async function loadUsers() {
    const res = await fetch("/api/users", { headers });
    const data = await res.json();
    renderUsers(data);
  }

  function renderUsers(data) {
    tableBody.innerHTML = "";
    data.forEach((u) => {
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

  // Tambah user baru
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const userData = {
      username: form.username.value,
      staff_name: form.staffName.value,
      password: form.password.value,
      role: form.role.value,
    };

    await fetch("/api/users", {
      method: "POST",
      headers,
      body: JSON.stringify(userData),
    });

    form.reset();
    loadUsers();
  });

  // Hapus user
  tableBody.addEventListener("click", async (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const id = btn.dataset.id;
    if (btn.dataset.action === "delete" && confirm("Hapus user ini?")) {
      await fetch(`/api/users/${id}`, { method: "DELETE", headers });
      loadUsers();
    }
  });

  // Pencarian
  searchInput.addEventListener("input", () => {
    const q = searchInput.value.toLowerCase();
    const rows = tableBody.querySelectorAll("tr");
    rows.forEach((r) => {
      r.style.display = r.innerText.toLowerCase().includes(q) ? "" : "none";
    });
  });

  // Export CSV
  document.getElementById("exportUsers").addEventListener("click", () => {
    const rows = [["Username", "Nama Staff", "Role"]];
    document.querySelectorAll("#userTable tbody tr").forEach((tr) => {
      const cols = Array.from(tr.children).map((td) => td.innerText);
      rows.push(cols.slice(0, 3));
    });

    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `user-data-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  });

  loadUsers();
});