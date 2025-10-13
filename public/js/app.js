// ===============================
// ✅ APP MAIN HANDLER
// ===============================

// Toggle loading overlay
function toggleLoading(show) {
  const overlay = document.getElementById("loadingOverlay");
  if (overlay) overlay.classList.toggle("hidden", !show);
}

// Toast helpers
function showErrorToast(message) {
  const toast = document.getElementById("errorToast");
  const msg = document.getElementById("errorMessage");
  if (toast && msg) {
    msg.textContent = message;
    toast.classList.remove("hidden");
    setTimeout(function() {
      toast.classList.add("hidden");
    }, 4000);
  } else {
    alert(message);
  }
}

function showSuccessToast(message) {
  const toast = document.getElementById("successToast");
  const msg = document.getElementById("successMessage");
  if (toast && msg) {
    msg.textContent = message;
    toast.classList.remove("hidden");
    setTimeout(function() {
      toast.classList.add("hidden");
    }, 3000);
  } else {
    console.log(message);
  }
}

// ===============================
// ✅ PAGE NAVIGATION
// ===============================
function showPage(page) {
  var pages = {
    dashboard: "dashboardPage",
    tourDataEntry: "tourDataEntryPage",
    salesDashboard: "salesDashboardPage",
    salesDataEntry: "salesDataEntryPage"
  };

  Object.values(pages).forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.classList.add("hidden");
  });

  var current = document.getElementById(pages[page] || "dashboardPage");
  if (current) current.classList.remove("hidden");

  var pageTitle = document.getElementById("pageTitle");
  if (pageTitle) {
    var titleMap = {
      dashboard: "Dashboard Tour",
      tourDataEntry: "Input Data Tour",
      salesDashboard: "Dashboard Sales",
      salesDataEntry: "Input Data Sales"
    };
    pageTitle.textContent = titleMap[page] || "Dashboard";
  }
}

// ===============================
// ✅ API HELPER
// ===============================
function getAuthHeaders() {
  var token = localStorage.getItem("token");
  return token ? { "Authorization": "Bearer " + token, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
}

function apiGet(url) {
  return fetch(url, { headers: getAuthHeaders() }).then(res => res.json());
}

function apiPost(url, data) {
  return fetch(url, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  }).then(res => res.json());
}

function apiPut(url, data) {
  return fetch(url, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  }).then(res => res.json());
}

function apiDelete(url) {
  return fetch(url, {
    method: "DELETE",
    headers: getAuthHeaders()
  }).then(res => res.json());
}

// ===============================
// ✅ LOGIN / LOGOUT
// ===============================
function handleLogin(e) {
  e.preventDefault();
  var username = document.getElementById("username").value;
  var password = document.getElementById("password").value;

  toggleLoading(true);

  apiPost("/api/auth/login", { username: username, password: password })
    .then(function(res) {
      if (res.success) {
        localStorage.setItem("token", res.token);
        localStorage.setItem("username", res.user.username);
        initializeDashboard();
      } else {
        showErrorToast(res.message || "Login gagal");
      }
    })
    .catch(function(err) {
      console.error(err);
      showErrorToast("Login gagal: " + err.message);
    })
    .finally(function() {
      toggleLoading(false);
    });
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  window.location.reload();
}

// ===============================
// ✅ INITIALIZE DASHBOARD
// ===============================
function initializeDashboard() {
  var username = localStorage.getItem("username") || "User";
  var userInfo = document.getElementById("userInfo");
  if (userInfo) userInfo.textContent = "Selamat datang, " + username;

  var loginPage = document.getElementById("loginPage");
  var mainApp = document.getElementById("mainApp");
  if (loginPage) loginPage.classList.add("hidden");
  if (mainApp) mainApp.classList.remove("hidden");

  // Tampilkan menu khusus admin jika username admin
  var salesMenu = document.getElementById("salesMenuItems");
  if (salesMenu && username.toLowerCase() === "admin") {
    salesMenu.classList.remove("hidden");
  }

  try {
    toggleLoading(true);
    // Load semua data awal
    if (typeof loadTours === "function") loadTours();
    if (typeof loadSales === "function") loadSales();
  } catch (err) {
    console.error(err);
    showErrorToast("Gagal memuat data dashboard");
  } finally {
    toggleLoading(false);
  }
}

// ===============================
// ✅ DOM CONTENT LOADED
// ===============================
document.addEventListener("DOMContentLoaded", function() {
  // Form login
  var loginForm = document.getElementById("loginForm");
  if (loginForm) loginForm.addEventListener("submit", handleLogin);

  // Logout button
  var logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.addEventListener("click", logout);

  // Close toast buttons
  var closeError = document.getElementById("closeErrorToast");
  if (closeError) closeError.addEventListener("click", function() {
    document.getElementById("errorToast").classList.add("hidden");
  });

  var closeSuccess = document.getElementById("closeSuccessToast");
  if (closeSuccess) closeSuccess.addEventListener("click", function() {
    document.getElementById("successToast").classList.add("hidden");
  });

  // Jika token ada, langsung inisialisasi dashboard
  var token = localStorage.getItem("token");
  if (token) initializeDashboard();
});
