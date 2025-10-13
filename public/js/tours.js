window.Tours = {
  loadTours: async function() {
    const data = await window.Api.get("/tours");
    return data.tours || [];
  },

  createTour: async function(tour) {
    return await window.Api.post("/tours", tour);
  },

  updateTour: async function(id, tour) {
    return await window.Api.put(`/tours/${id}`, tour);
  },

  deleteTour: async function(id) {
    return await window.Api.delete(`/tours/${id}`);
  }
};
