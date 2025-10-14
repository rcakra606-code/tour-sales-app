// auth.js
async function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    toggleLoading(true);
    const data = await request("/auth/login", "POST", { username, password });
    localStorage.setItem("token", data.token);
    localStorage.setItem("username", data.user.username);
    initializeApp();
  } catch (err) {
    showErrorToast(err.message);
  } finally {
    toggleLoading(false);
  }
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  location.reload();
}
