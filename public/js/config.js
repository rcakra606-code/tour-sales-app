// =====================================================
// ✅ Global Configuration File
//    Digunakan oleh semua modul frontend (auth, api, dll)
// =====================================================

// Deteksi environment otomatis (local atau production)
(function () {
  // Jika berjalan di localhost
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  // Base URL API backend (tanpa /api di akhir)
  const API_BASE_URL = isLocal
    ? 'http://localhost:3000'        // Untuk development lokal
    : window.location.origin;        // Untuk deploy di Render / domain produksi

  // Logging hanya untuk debug lokal
  if (isLocal) console.log('🌍 [CONFIG] Base API URL:', API_BASE_URL);

  // Inject konfigurasi global agar bisa dipakai di semua script
  window.APP_CONFIG = {
    APP_NAME: 'Tour & Sales Management System',
    ENV: isLocal ? 'development' : 'production',
    API_BASE_URL,
    VERSION: '1.0.0',

    // Pengaturan tambahan opsional
    SETTINGS: {
      enableDebugLog: isLocal,  // true hanya di local
      requestTimeout: 15000,    // 15 detik default timeout
      dateFormat: 'DD/MM/YYYY'
    }
  };
})();
