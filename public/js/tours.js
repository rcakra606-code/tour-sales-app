// tours.js
window.tours = {
  form: document.getElementById("tourForm"),
  table: document.getElementById("tourTable"),
  idInput: document.getElementById("tourId"),
  titleInput: document.getElementById("title"),
  descInput: document.getElementById("description"),
  priceInput: document.getElementById("price"),
  dateInput: document.getElementById("date"),

  loadTours: async function () {
    try {
      const token = localStorage.getItem("token");
      const data = await window.api.request("/api/tours", "GET", null, token);
      this.table.innerHTML = "";

      data.tours.forEach((t) => {
        const tr = document.createElement("tr");
        tr.className = "border-b";
        tr.innerHTML = `
          <td class="p-2">${t.title}</td>
          <td class="p-2">${t.description || "-"}</td>
          <td class="p-2">Rp ${t.price?.toLocaleString("id-ID")}</td>
          <td class="p-2">${t.date || "-"}</td>
          <td class="p-2 text-center">
            <button onclick="window.tours.edit(${t.id})" class="text-blue-500 hover:underline">Edit</button>
            <button onclick="window.tours.delete(${t.id})" class="text-red-500 hover:underline ml-2">Hapus</button>
          </td>
        `;
        this.table.appendChild(tr);
      });
    } catch (err) {
      window.auth.showError(err.message);
    }
  },

  submitHandler: async function (e) {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const payload = {
        title: this.titleInput.value.trim(),
        description: this.descInput.value.trim(),
        price: parseFloat(this.priceInput.value),
        date: this.dateInput.value
      };
      const id = this.idInput.value;
      const url = id ? `/api/tours/${id}` : "/api/tours";
      const method = id ? "PUT" : "POST";

      const data = await window.api.request(url, method, payload, token);
      window.auth.showSuccess(data.message || "Berhasil disimpan");
      this.form.reset();
      this.idInput.value = "";
      this.loadTours();
    } catch (err) {
      window.auth.showError(err.message);
    }
  },

  edit: async function (id) {
    try {
      const token = localStorage.getItem("token");
      const data = await window.api.request(`/api/tours/${id}`, "GET", null, token);
      const t = data.tour;
      this.idInput.value = t.id;
      this.titleInput.value = t.title;
      this.descInput.value = t.description;
      this.priceInput.value = t.price;
      this.dateInput.value = t.date;
      window.auth.showSuccess("Mode edit aktif");
    } catch (err) {
      window.auth.showError(err.message);
    }
  },

  delete: async function (id) {
    if (!confirm("Yakin ingin menghapus tour ini?")) return;
    try {
      const token = localStorage.getItem("token");
      const data = await window.api.request(`/api/tours/${id}`, "DELETE", null, token);
      window.auth.showSuccess("Tour dihapus");
      this.loadTours();
    } catch (err) {
      window.auth.showError(err.message);
    }
  },

  resetForm: function () {
    this.form.reset();
    this.idInput.value = "";
  },

  init: function () {
    if (!this.form) return;
    this.form.addEventListener("submit", this.submitHandler.bind(this));
    const resetBtn = document.getElementById("resetBtn");
    if (resetBtn) resetBtn.addEventListener("click", this.resetForm.bind(this));
    document.addEventListener("DOMContentLoaded", () => this.loadTours());
  }
};

window.tours.init();
