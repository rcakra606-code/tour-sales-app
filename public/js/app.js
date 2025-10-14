function showErrorToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

function toggleLoading(state) {
  document.body.style.cursor = state ? "wait" : "default";
}

function initializeApp() {
  document.getElementById("loginSection").classList.add("hidden");
  document.getElementById("dashboardSection").classList.remove("hidden");
  document.getElementById("userControls").classList.remove("hidden");
  document.getElementById("usernameDisplay").textContent =
    localStorage.getItem("username") || "";

  loadTours();
  loadSales();
}
