// ===============================
// ✅ Tours CRUD
// ===============================
window.Tours = {
  list: async function() {
    const res = await Api.request("/tours");
    return res.data || [];
  },
  create: async function(data) {
    return await Api.request("/tours", "POST", data);
  },
  update: async function(id, data) {
    return await Api.request("/tours/" + id, "PUT", data);
  },
  remove: async function(id) {
    return await Api.request("/tours/" + id, "DELETE");
  }
};

// DOM Binding
document.addEventListener("DOMContentLoaded", function() {
  const tourForm = document.getElementById("tourForm");
  const tourTable = document.getElementById("tourTable");
  const resetBtn = document.getElementById("resetBtn");

  async function loadTours() {
    if (!tourTable) return;
    tourTable.innerHTML = "";
    const tours = await window.Tours.list();
    tours.forEach(t => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="p-2">${t.title}</td>
        <td class="p-2">${t.description}</td>
        <td class="p-2">${t.price}</td>
        <td class="p-2">${t.date}</td>
        <td class="p-2 text-center">
          <button onclick="window.Tours.edit(${t.id})" class="bg-yellow-400 px-2 py-1 rounded">Edit</button>
          <button onclick="window.Tours.delete(${t.id})" class="bg-red-600 px-2 py-1 rounded text-white">Hapus</button>
        </td>
      `;
      tourTable.appendChild(tr);
    });
  }

  tourForm && tourForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("tourId").value;
    const data = {
      title: document.getElementById("title").value.trim(),
      description: document.getElementById("description").value.trim(),
      price: parseFloat(document.getElementById("price").value),
      date: document.getElementById("date").value
    };
    try {
      window.App.toggleLoading(true);
      if (id) await window.Tours.update(id, data);
      else await window.Tours.create(data);
      window.App.showSuccessToast("Data tersimpan");
      resetForm();
      loadTours();
    } catch(err) {
      window.App.showErrorToast(err.message);
    } finally {
      window.App.toggleLoading(false);
    }
  });

  resetBtn && resetBtn.addEventListener("click", resetForm);

  function resetForm() {
    document.getElementById("tourId").value = "";
    document.getElementById("title").value = "";
    document.getElementById("description").value = "";
    document.getElementById("price").value = "";
    document.getElementById("date").value = "";
  }

  window.Tours.edit = function(id) {
    const row = Array.from(tourTable.children).find(r => r.children[0].textContent && r.children[0].textContent === id);
    const tour = Array.from(tourTable.children).find(r => r.dataset.id == id);
    if (!tour) return;
    document.getElementById("tourId").value = id;
    document.getElementById("title").value = tour.children[0].textContent;
    document.getElementById("description").value = tour.children[1].textContent;
    document.getElementById("price").value = tour.children[2].textContent;
    document.getElementById("date").value = tour.children[3].textContent;
  }

  window.Tours.delete = async function(id) {
    if (!confirm("Hapus data ini?")) return;
    try {
      window.App.toggleLoading(true);
      await window.Tours.remove(id);
      window.App.showSuccessToast("Data dihapus");
      loadTours();
    } catch(err) {
      window.App.showErrorToast(err.message);
    } finally {
      window.App.toggleLoading(false);
    }
  }

  window.Tours.loadTours = loadTours;
});
