// ===============================
// ✅ Global Configuration
// ===============================

// Gunakan Immediately Invoked Function Expression (IIFE) agar aman dari duplikasi global
(() => {
  // Deteksi environment otomatis
  const isLocal = window.location.origin.includes("localhost");

  // Cegah duplikasi definisi APP_CONFIG
  if (!window.APP_CONFIG) {
    window.APP_CONFIG = {
      API_BASE_URL: isLocal ? "http://localhost:3000" : window.location.origin,
      ENV: isLocal ? "development" : "production",
    };

    console.log(`✅ Config initialized for ${window.APP_CONFIG.ENV} mode`);
  } else {
    console.log("⚠️ APP_CONFIG already exists — skipping redefine");
  }
})();
