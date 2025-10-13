window.sales = {
  loadSales: async function () {
    try {
      const token = localStorage.getItem("token");
      const data = await window.api.request("/api/sales", "GET", null, token);
      console.log("Sales loaded:", data.sales);
      // TODO: render ke table atau chart
    } catch (err) {
      window.auth.showError(err.message);
    }
  }
};
