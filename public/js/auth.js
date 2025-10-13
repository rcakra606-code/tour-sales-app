// ===============================
// ✅ Login Handler
// ===============================
const loginForm = document.getElementById("loginForm");

async function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    toggleLoading(true);
    const res = await apiPost("/auth/login", { username, password });
    localStorage.setItem("token", res.token);
    localStorage.setItem("username", res.user.username);
    localStorage.setItem("role", res.user.role);

    showSuccessToast("Login berhasil");
    initializeApp(); // panggil main app
  } catch (err) {
    console.error(err);
    showErrorToast("Login gagal: " + (err.message || "Periksa username/password"));
  } finally {
    toggleLoading(false);
  }
}

if (loginForm) loginForm.addEventListener("submit", handleLogin);

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  localStorage.removeItem("role");
  showPage("login");
  document.getElementById("loginPage").classList.remove("hidden");
  document.getElementById("mainApp").classList.add("hidden");
}
