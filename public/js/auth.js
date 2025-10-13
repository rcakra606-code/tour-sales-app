// ===============================
// ✅ LOGIN HANDLER
// ===============================
async function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    showErrorToast("Username & password wajib diisi");
    return;
  }

  try {
    toggleLoading(true);
    const res = await apiPost("/api/auth/login", { username, password });
    if (res.success) {
      localStorage.setItem("token", res.token);
      localStorage.setItem("username", res.user.username);
      showSuccessToast(res.message || "Login berhasil");
      initializeApp();
    } else {
      showErrorToast(res.message || "Login gagal");
    }
  } catch (err) {
    console.error(err);
    showErrorToast(err.message || "Terjadi kesalahan saat login");
  } finally {
    toggleLoading(false);
  }
}
