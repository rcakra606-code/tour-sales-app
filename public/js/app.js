// app.js
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (token) initializeApp();
});
