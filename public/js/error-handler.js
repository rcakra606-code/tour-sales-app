// ============================
// ✅ ERROR HANDLER FRONTEND
// ============================

// Sembunyikan semua halaman yang ada (jika ada di DOM)
function hideAllPages() {
  const ids = [
    'loginPage',
    'mainApp',
    'networkErrorPage',
    'serverErrorPage',
    'notFoundPage'
  ];

  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el && el.classList) el.classList.add('hidden');
  });
}

// Tampilkan halaman error jaringan
function showNetworkError() {
  hideAllPages();
  const el = document.getElementById('networkErrorPage');
  if (el) el.classList.remove('hidden');
}

// Tampilkan halaman error server
function showServerError() {
  hideAllPages();
  const el = document.getElementById('serverErrorPage');
  if (el) el.classList.remove('hidden');
}

// Tampilkan halaman 404
function showNotFound() {
  hideAllPages();
  const el = document.getElementById('notFoundPage');
  if (el) el.classList.remove('hidden');
}

// Retry koneksi (refresh halaman)
function retryConnection() {
  window.location.reload();
}

// Navigasi kembali ke home
function goHome() {
  window.location.href = '/';
}
