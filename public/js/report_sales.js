// ==========================================================
// 💼 Report Sales Logic v5.3.6
// CRUD + Target + Delete + Export CSV + Role Based
// ==========================================================
document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (!token || token === "undefined") return (window.location.href = "/login.html");

  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  document.getElementById("year").textContent = new Date().getFullYear();
  document.getElementById("activeUser").textContent = `${user.staff_name || user.username} (${user.role})`;

  const salesForm = document.getElementById("salesForm");
  const targetForm = document.getElementById("targetForm");
  const salesTableBody = document.querySelector("#salesTable tbody");
  const searchInput = document.getElementById("searchSales");

  // ==========================================================
  // LOAD FUNCTIONS
  // ==========================================================
  async function loadSales() {
    try {
      const res = await fetch("/api/sales", { headers });
      if (!res.ok) throw new Error("Gagal memuat data sales");
      const data = await res.json();
      renderSales(data);
    } catch (err) {
      console.error("❌ Load sales error:", err);
    }
  }

  async function loadTargets() {
    try {
      const res = await fetch("/api/reportSales/targets", { headers });
      if (!res.ok) throw new Error("Gagal memuat target");
      const data = await res.json();
      console.log("🎯 Target loaded:", data);
    } catch (err) {
      console.error("❌ Load target error:", err);
    }
  }

  // ==========================================================
  // RENDER TABLE
  // ==========================================================
  function renderSales(data) {
    salesTableBody.innerHTML = "";
    data.forEach((s) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${s.transactionDate || "-"}</td>
        <td>${s.staffName || "-"}</td>
        <td>${s.invoiceNumber || "-"}</td>
        <td>${s.salesAmount ? s.salesAmount.toLocaleString("id-ID") : 0}</td>
        <td>${s.profitAmount ? s.profitAmount.toLocaleString("id-ID") : 0}</td>
        <td>${s.remarks || "-"}</td>
        <td>
          ${
            user.role === "admin" || user.role === "semiadmin"
              ? `<button class="btn small danger" data-id="${s.id}" data-action="delete">🗑️</button>`
              : "-"
          }
        </td>`;
      salesTableBody.appendChild(tr);
    });
  }

  // ==========================================================
  // HANDLE SUBMIT SALES FORM
  // ==========================================================
  salesForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      transactionDate: salesForm.transactionDate.value,
      staffName: salesForm.staffName.value,
      invoiceNumber: salesForm.invoiceNumber.value,
      salesAmount: parseFloat(salesForm.salesAmount.value) || 0,
      profitAmount: parseFloat(salesForm.profitAmount.value) || 0,
      remarks: salesForm.remarks.value,
    };

    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Gagal menyimpan data sales");
      salesForm.reset();
      await loadSales();
      alert("✅ Data sales berhasil disimpan!");
    } catch (err) {
      console.error("❌ Save sales error:", err);
      alert("❌ Gagal menyimpan data sales.");
    }
  });

  // ==========================================================
  // HANDLE DELETE SALES
  // ==========================================================
  salesTableBody.addEventListener("click", async (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const id = btn.dataset.id;
    const action = btn.dataset.action;

    if (action === "delete" && confirm("Hapus data ini?")) {
      try {
        const res = await fetch(`/api/sales/${id}`, {
          method: "DELETE",
          headers,
        });

        if (!res.ok) throw new Error("Gagal menghapus data");
        await loadSales();
        alert("🗑️ Data sales berhasil dihapus!");
      } catch (err) {
        console.error("❌ Delete error:", err);
      }
    }
  });

  // ==========================================================
  // HANDLE TARGET FORM
  // ==========================================================
  targetForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      staff_name: targetForm.targetStaff.value,
      target_sales: parseFloat(targetForm.targetSales.value) || 0,
      target_profit: parseFloat(targetForm.targetProfit.value) || 0,
      month: targetForm.targetMonth.value,
    };

    try {
      const res = await fetch("/api/reportSales/targets", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Gagal menyimpan target sales");
      targetForm.reset();
      await loadTargets();
      alert("✅ Target sales berhasil disimpan!");
    } catch (err) {
      console.error("❌ Save target error:", err);
      alert("❌ Gagal menyimpan target sales.");
    }
  });

  // ==========================================================
  // SEARCH FILTER
  // ==========================================================
  searchInput.addEventListener("input", () => {
    const q = searchInput.value.toLowerCase();
    const rows = salesTableBody.querySelectorAll("tr");
    rows.forEach((r) => {
      r.style.display = r.innerText.toLowerCase().includes(q) ? "" : "none";
    });
  });

  // ==========================================================
  // EXPORT CSV
  // ==========================================================
  document.getElementById("exportSales").addEventListener("click", () => {
    const rows = [["Tanggal", "Staff", "Invoice", "Sales", "Profit", "Keterangan"]];
    document.querySelectorAll("#salesTable tbody tr").forEach((tr) => {
      const cols = Array.from(tr.children).map((td) => td.innerText);
      rows.push(cols.slice(0, 6));
    });

    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  });

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================
  await loadSales();
  await loadTargets();
});