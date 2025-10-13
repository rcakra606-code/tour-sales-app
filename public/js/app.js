import { loadTours } from "./tours.js";
import { loadSales } from "./sales.js";
import { verifyToken, logout } from "./auth.js";

function toggleLoading(show) {
  const overlay = document.getElementById("loadingOverlay");
  if (overlay) overlay.classList.toggle("hidden", !show);
}

function showErrorToast(msg) {
  const toast = document.getElementById("errorToast");
  const errorMessage = document.getElementById("errorMessage");
  if (toast && errorMessage) {
    errorMessage.textContent = msg;
    toast.classList.remove("hidden");
    setTimeout(() => toast.classList.add("hidden"), 4000);
  }
}

async function initializeApp() {
  toggleLoading(true);
  try {
    const valid = await verifyToken();
    if (!valid) return;
    await Promise.all([loadTours(), loadSales()]);
  } catch (err) {
    showErrorToast(err.message);
  } finally {
    toggleLoading(false);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.addEventListener("click", logout);
});
