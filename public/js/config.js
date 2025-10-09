// ===========================
// ✅ Global Frontend Config
// ===========================

// Otomatis menentukan base URL tergantung environment
(function () {
  // Deteksi apakah berjalan di localhost atau production
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  // Gunakan origin untuk production (Render/Vercel), dan port 3000 di lokal
  const API_BASE_URL = isLocal
    ? 'http://localhost:3000'
    : window.location.origin;

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
