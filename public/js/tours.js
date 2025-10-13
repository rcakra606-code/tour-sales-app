window.Tours = {
  loadTours: async function() {
    try {
      const data = await window.Api.get("/tours");
      return data.tours || [];
    } catch (err) {
      console.error("Gagal load tours:", err);
      return [];
    }
  },

  createTour: async function(tour) {
    return await window.Api.post("/tours", tour);
  },

  updateTour: async function(id, tour) {
    return await window.Api.put(`/tours/${id}`, tour);
  },

  deleteTour: async function(id) {
    return await window.Api.delete(`/tours/${id}`);
  },

  bindForm: function() {
    const form = document.getElementById("tourForm");
    const resetBtn = document.getElementById("resetBtn");

    if (!form) return;

    form.addEventListener("submit", async function(e) {
      e.preventDefault();

      const id = document.getElementById("tourId").value;
      const title = document.getElementById("title").value.trim();
      const description = document.getElementById("description").value.trim();
      const price = parseFloat(document.getElementById("price").value);
      const date = document.getElementById("date").value;

      if (!title || !description || !price || !date) {
        window.App.showErrorToast("Semua field harus diisi dengan benar");
        return;
      }

      const tourData = { title, description, price, date };

      try {
        let res;
        if (id) {
          res = await window.Tours.updateTour(id, tourData);
        } else {
          res = await window.Tours.createTour(tourData);
        }

        if (res.success) {
          window.App.showSuccessToast("Data tour berhasil disimpan");
          form.reset();
          document.getElementById("tourId").value = "";
          window.App.init();
        } else {
          window.App.showErrorToast(res.message || "Gagal menyimpan data");
        }
      } catch (err) {
        console.error(err);
        window.App.showErrorToast(err.message || "Error submit tour");
      }
    });

    resetBtn.addEventListener("click", function() {
      form.reset();
      document.getElementById("tourId").value = "";
    });
  }
};
