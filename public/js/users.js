// public/js/users.js

// Load semua user (admin view)
async function loadUsersTable() {
  try {
    const users = await apiFetch("/users");
    const tbody = document.getElementById("usersTableBody");
    tbody.innerHTML = "";
    users.forEach(u => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="p-2">${u.name}</td>
        <td class="p-2">${u.username}</td>
        <td class="p-2">${u.type}</td>
        <td class="p-2 text-center">
          <button class="bg-yellow-500 text-white px-3 py-1 rounded" onclick="resetUserPassword(${u.id})">Reset Password</button>
          <button class="bg-blue-600 text-white px-3 py-1 rounded" onclick="editUser(${u.id})">Edit</button>
          <button class="bg-red-600 text-white px-3 py-1 rounded" onclick="deleteUser(${u.id})">Hapus</button>
        </td>`;
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error("loadUsersTable error:", err);
  }
}

// Tambah / Update user
document.getElementById("userForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("userId").value;
  const body = {
    name: document.getElementById("userName").value,
    username: document.getElementById("userUsername").value,
    email: document.getElementById("userEmail").value,
    password: document.getElementById("userPassword").value,
    type: document.getElementById("userType").value
  };
  try {
    if (id) {
      await apiFetch(`/users/${id}`, { method: "PUT", body: JSON.stringify(body) });
      alert("User berhasil diperbarui");
    } else {
      await apiFetch("/users", { method: "POST", body: JSON.stringify(body) });
      alert("User baru berhasil ditambahkan");
    }
    e.target.reset();
    loadUsersTable();
  } catch (err) {
    alert(err.message || "Gagal menyimpan user");
  }
});

// Reset password user (admin only)
async function resetUserPassword(id) {
  if (!confirm("Reset password user ini ke 'password123'?")) return;
  try {
    await apiFetch(`/users/${id}/reset-password`, { method: "POST", body: JSON.stringify({ newPassword: "password123" }) });
    alert("Password berhasil direset ke 'password123'");
  } catch (err) {
    alert("Gagal reset password");
  }
}

// Edit user
async function editUser(id) {
  try {
    const user = await apiFetch(`/users/${id}`);
    document.getElementById("userId").value = user.id;
    document.getElementById("userName").value = user.name;
    document.getElementById("userUsername").value = user.username;
    document.getElementById("userEmail").value = user.email;
    document.getElementById("userType").value = user.type;
    window.scrollTo(0, document.getElementById("userForm").offsetTop);
  } catch (err) {
    console.error(err);
  }
}

// Hapus user
async function deleteUser(id) {
  if (!confirm("Yakin ingin menghapus user ini?")) return;
  try {
    await apiFetch(`/users/${id}`, { method: "DELETE" });
    alert("User dihapus");
    loadUsersTable();
  } catch (err) {
    alert("Gagal menghapus user");
  }
}

// Ganti password mandiri
document.getElementById("changePasswordForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const oldPassword = document.getElementById("oldPassword").value;
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (newPassword !== confirmPassword) {
    alert("Password baru dan konfirmasi tidak cocok");
    return;
  }

  try {
    await apiFetch("/users/change-password", {
      method: "POST",
      body: JSON.stringify({ oldPassword, newPassword }),
    });
    alert("Password berhasil diubah");
    e.target.reset();
  } catch (err) {
    alert("Gagal mengganti password: " + (err.message || ""));
  }
});
