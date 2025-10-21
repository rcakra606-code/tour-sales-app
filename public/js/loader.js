// ==========================================================
// 🚀 Travel Dashboard Loader Redirect // ==========================================================
// 🚀 Travel Dashboard Loader Redirect v5.3.4
// Safe redirect for first load (fix undefined-token bug)
// ==========================================================

window.addEventListener("DOMContentLoaded", () => {
  console.log("🔄 Checking authentication...");

  try {
    const token = localStorage.getItem("token");

    // token valid = string panjang JWT, bukan null/undefined/empty
    const isValid =
      token &&
      token !== "undefined" &&
      token !== "null" &&
      token.trim().length > 20;

    if (isValid) {
      console.log("✅ Valid token found, redirecting to dashboard...");
      window.location.replace("/dashboard.html");
    } else {
      console.log("➡️ No valid token found, redirecting to login...");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.replace("/login.html");
    }
  } catch (err) {
    console.error("❌ Redirect failed:", err);
    window.location.replace("/login.html");
  }
}); authentication...");
  try {
    const token = localStorage.getItem("token");
    if (token && token !== "undefined") {
      console.log("✅ Token found, redirecting to dashboard...");
      window.location.replace("/dashboard.html");
    } else {
      console.log("➡️ No token found, redirecting to login...");
      window.location.replace("/login.html");
    }
  } catch (e) {
    console.error("❌ Redirect failed:", e);
    window.location.replace("/login.html");
  }
});