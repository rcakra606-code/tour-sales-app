window.Sales = {
  loadSales: async function() {
    const data = await window.Api.get("/sales");
    return data.sales || [];
  },

  createSale: async function(sale) {
    return await window.Api.post("/sales", sale);
  },

  updateSale: async function(id, sale) {
    return await window.Api.put(`/sales/${id}`, sale);
  },

  deleteSale: async function(id) {
    return await window.Api.delete(`/sales/${id}`);
  }
};
