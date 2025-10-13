// public/js/login.js
import { apiPost } from "./api.js";

const form = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");

// ==============================
// Toast helper
// ==============================
function showToast(msg, type = "success") {
  const div = document.createElement("div");
  div.textContent = msg;
  div.className = `fixed top-4 right-4 px-4 py-2 rounded text-white z-50 ${type === "error" ? "bg-red-500" : "bg-green-600"}`;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}

// ==============================
// Submit Login Form
// ==============================
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    username: usernameInput.value.trim(),
    password: passwordInput.value.trim(),
  };

  try {
    const res = await apiPost("/auth/login", payload);
    if (!res.success) return showToast(res.message || "Login gagal", "error");

    // ✅ Simpan token dan user info di localStorage
    localStorage.setItem("token", res.token);
    localStorage.setItem("user", JSON.stringify(res.user));

    showToast(res.message || "Login berhasil");

    // Redirect ke halaman tours/dashboard
    window.location.href = "/tours.html";
  } catch (err) {
    showToast(err.message, "error");
  }
});
