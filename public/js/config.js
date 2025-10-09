// ===============================
// ✅ Global Configuration
// ===============================
window.APP_CONFIG = {
  API_BASE_URL: window.location.origin.includes("localhost")
    ? "http://localhost:3000"
    : window.location.origin,
  
  // Pastikan hanya didefinisikan sekali (hindari error redeclare)
  if (!window.APP_CONFIG) {
    window.APP_CONFIG = {
      API_BASE_URL,
      ENV: isLocal ? 'development' : 'production',
    };

    console.log(`✅ Config initialized for ${window.APP_CONFIG.ENV}`);
  } else {
    console.log('⚠️ APP_CONFIG already exists, skipping redefine');
  }
})();
