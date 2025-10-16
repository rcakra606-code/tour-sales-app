// public/js/regions.js
const regionTable = document.getElementById("regionTable");
const regionForm = document.getElementById("regionForm");
const regionId = document.getElementById("regionId");
const regionName = document.getElementById("regionName");
const regionDesc = document.getElementById("regionDesc");

async function loadRegions() {
  try {
    const res = await fetch(`${API_BASE}/regions`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const regions = await res.json();
    regionTable.innerHTML = "";

    regions.forEach((r) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="p-2 border">${r.name}</td>
        <td class="p-2 border">${r.description || "-"}</td>
        <td class="p-2 border text-center">
          <button onclick="editRegion(${r.id}, '${r.name}', '${r.description || ""}')" class="text-blue-600 hover:underline mr-2">Edit</button>
          <button onclick="deleteRegion(${r.id})" class="text-red-600 hover:underline">Hapus</button>
        </td>
      `;
      regionTable.appendChild(tr);
    });
  } catch (err) {
    console.error(err);
    showError("Gagal memuat region");
  }
}

regionForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const method = regionId.value ? "PUT" : "POST";
    const url = regionId.value
      ? `${API_BASE}/regions/${regionId.value}`
      : `${API_BASE}/regions`;

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        name: regionName.value.trim(),
        description: regionDesc.value.trim(),
      }),
    });

    if (!res.ok) throw new Error("Gagal menyimpan region");
    showSuccess("Region berhasil disimpan");
    regionForm.reset();
    regionId.value = "";
    loadRegions();
  } catch (err) {
    showError(err.message);
  }
});

function editRegion(id, name, description) {
  regionId.value = id;
  regionName.value = name;
  regionDesc.value = description;
}

async function deleteRegion(id) {
  if (!confirm("Hapus region ini?")) return;
  try {
    const res = await fetch(`${API_BASE}/regions/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (!res.ok) throw new Error("Gagal menghapus region");
    showSuccess("Region berhasil dihapus");
    loadRegions();
  } catch (err) {
    showError(err.message);
  }
}

function initRegionManagement() {
  loadRegions();
}
