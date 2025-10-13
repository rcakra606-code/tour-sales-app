import { apiFetch } from "./api.js";
import { setToken, removeToken } from "./config.js";

async function login(username, password) {
  const res = await apiFetch("/auth/login", "POST", { username, password });
  setToken(res.token);
  localStorage.setItem("username", res.user.username);
  return res.user;
}

function logout() {
  removeToken();
  localStorage.removeItem("username");
  location.reload();
}

async function verifyToken() {
  try {
    const res = await apiFetch("/auth/verify");
    return res.valid;
  } catch {
    logout();
    return false;
  }
}

export { login, logout, verifyToken };
