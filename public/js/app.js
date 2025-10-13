// ===============================
// ✅ APP MAIN HANDLER
// ===============================
window.App = {
  init: async function() {
    const token = localStorage.getItem("token");
    if (!token) return;

    const username = localStorage.getItem("username") || "User";
    const userInfo = document.getElementById("userInfo");
    if (userInfo) userInfo.textContent = `Selamat datang, ${username}`;

    // Jika admin tampilkan menu sales
    const salesMenuItems = document.getElementById("salesMenuItems");
    if (salesMenuItems && username.toLowerCase() === "admin") {
      salesMenuItems.classList.remove("hidden");
    }

    try {
      window.App.toggleLoading(true);
      const tours = await window.Tours.loadTours();
      window.App.renderTourTable(tours);
      // Sales load
      await window.Sales.loadSales();
    } catch (err) {
      console.error(err);
      window.App.showErrorToast(err.message || "Gagal memuat data");
    } finally {
      window.App.toggleLoading(false);
    }
  },

  showPage: function(page) {
    const pages = {
      dashboard: "dashboardPage",
      dataEntry: "dataEntryPage",
      salesDashboard: "salesDashboardPage",
      salesDataEntry: "salesDataEntryPage"
    };
    Object.values(pages).forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add("hidden");
    });
    const current = document.getElementById(pages[page] || "dashboardPage");
    if (current) current.classList.remove("hidden");
  },

  toggleLoading: function(show) {
    const overlay = document.getElementById("loadingOverlay");
    if (overlay) overlay.classList.toggle("hidden", !show);
  },

  showErrorToast: function(message) {
    const toast = document.getElementById("errorToast");
    const msg = document.getElementById("errorMessage");
    if (toast && msg) {
      msg.textContent = message;
      toast.classList.remove("hidden");
      setTimeout(() => toast.classList.add("hidden"), 4000);
    } else alert(message);
  },

  showSuccessToast: function(message) {
    const toast = document.getElementById("successToast");
    const msg = document.getElementById("successMessage");
    if (toast && msg) {
      msg.textContent = message;
      toast.classList.remove("hidden");
      setTimeout(() => toast.classList.add("hidden"), 3000);
    } else console.log(message);
  },

  renderTourTable: function(tours) {
    const tbody = document.getElementById("tourTable");
    if (!tbody) return;
    tbody.innerHTML = "";
    tours.forEach(t => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="p-2">${t.title}</td>
        <td class="p-2">${t.description}</td>
        <td class="p-2">${t.price}</td>
        <td class="p-2">${t.date}</td>
        <td class="p-2 text-center">
          <button onclick="window.App.editTour('${t.id}')">✏️</button>
          <button onclick="window.App.deleteTour('${t.id}')">🗑️</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  },

  editTour: function(id) {
    const tour = window.Tours.loadTours().then(list => {
      const t = list.find(x => x.id === id);
      if (!t) return;
      document.getElementById("tourId").value = t.id;
      document.getElementById("title").value = t.title;
      document.getElementById("description").value = t.description;
      document.getElementById("price").value = t.price;
      document.getElementById("date").value = t.date;
    });
  },

  deleteTour: async function(id) {
    if (!confirm("Hapus tour ini?")) return;
    const res = await window.Tours.deleteTour(id);
    if (res.success) {
      window.App.showSuccessToast("Tour berhasil dihapus");
      window.App.init();
    } else {
      window.App.showErrorToast(res.message || "Gagal menghapus tour");
    }
  }
};

// ===============================
// ✅ Event Listeners
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  // Login
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async e => {
      e.preventDefault();
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
      try {
        const res = await window.Auth.login(username, password);
        if (res.success) {
          localStorage.setItem("token", res.token);
          localStorage.setItem("username", res.user.username);
          document.getElementById("loginPage").classList.add("hidden");
          document.getElementById("mainApp").classList.remove("hidden");
          window.App.init();
        } else {
          window.App.showErrorToast(res.message || "Login gagal");
        }
      } catch (err) {
        window.App.showErrorToast(err.message || "Login error");
      }
    });
  }

  // Logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.addEventListener("click", () => window.Auth.logout());

  // Close Toasts
  const closeError = document.getElementById("closeErrorToast");
  if (closeError) closeError.addEventListener("click", () => document.getElementById("errorToast").classList.add("hidden"));
  const closeSuccess = document.getElementById("closeSuccessToast");
  if (closeSuccess) closeSuccess.addEventListener("click", () => document.getElementById("successToast").classList.add("hidden"));

  // Init app if already logged in
  if (window.Auth.isLoggedIn()) window.App.init();
});
