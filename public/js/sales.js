window.Sales = {
  loadSales: async function() {
    try {
      const data = await window.Api.get("/sales");
      return data.sales || [];
    } catch (err) {
      console.error("Gagal load sales:", err);
      return [];
    }
  },

  createSale: async function(sale) {
    return await window.Api.post("/sales", sale);
  },

  updateSale: async function(id, sale) {
    return await window.Api.put(`/sales/${id}`, sale);
  },

  deleteSale: async function(id) {
    return await window.Api.delete(`/sales/${id}`);
  },

  bindForm: function(formId, resetBtnId) {
    const form = document.getElementById(formId);
    const resetBtn = document.getElementById(resetBtnId);

    if (!form) return;

    form.addEventListener("submit", async function(e) {
      e.preventDefault();

      const id = form.querySelector("#saleId")?.value;
      const customer = form.querySelector("#customer")?.value.trim();
      const amount = parseFloat(form.querySelector("#amount")?.value);
      const date = form.querySelector("#saleDate")?.value;

      if (!customer || !amount || !date) {
        window.App.showErrorToast("Semua field harus diisi dengan benar");
        return;
      }

      const saleData = { customer, amount, date };

      try {
        let res;
        if (id) {
          res = await window.Sales.updateSale(id, saleData);
        } else {
          res = await window.Sales.createSale(saleData);
        }

        if (res.success) {
          window.App.showSuccessToast("Data sales berhasil disimpan");
          form.reset();
          if (form.querySelector("#saleId")) form.querySelector("#saleId").value = "";
          window.App.init();
        } else {
          window.App.showErrorToast(res.message || "Gagal menyimpan sales");
        }
      } catch (err) {
        console.error(err);
        window.App.showErrorToast(err.message || "Error submit sales");
      }
    });

    if (resetBtn) {
      resetBtn.addEventListener("click", function() {
        form.reset();
        if (form.querySelector("#saleId")) form.querySelector("#saleId").value = "";
      });
    }
  }
};
