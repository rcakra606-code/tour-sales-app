// ===============================
// ✅ Auth Handlers
// ===============================
window.loginUser = async function(username, password) {
  try {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    localStorage.setItem("token", data.token);
    localStorage.setItem("username", data.user.username);
    return data;
  } catch (err) {
    throw err;
  }
};

window.logoutUser = function() {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  window.location.reload();
};
