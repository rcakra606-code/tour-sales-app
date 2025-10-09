// ===========================
// ✅ AUTH HANDLER (Frontend)
// ===========================

// URL API (otomatis sesuaikan untuk lokal atau Render)
const API_BASE = window.location.origin.includes('localhost')
  ? 'http://localhost:3000'
  : window.location.origin;

// Fungsi login (dipanggil dari <form onsubmit="handleLogin(event)">)
async function handleLogin(event) {
  event.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!username || !password) {
    showErrorToast('Masukkan username dan password');
    return;
  }

  try {
    // tampilkan loading overlay
    toggleLoading(true);

    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      showErrorToast(data.message || 'Login gagal');
      return;
    }

    // Simpan token sederhana di localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('username', data.username);

    showSuccessToast('Login berhasil!');
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    document.getElementById('userInfo').innerText = `Selamat datang, ${data.username}`;
  } catch (err) {
    console.error('Login error:', err);
    showErrorToast('Gagal terhubung ke server.');
    document.getElementById('networkErrorPage').classList.remove('hidden');
  } finally {
    toggleLoading(false);
  }
}

// ===========================
// ✅ Logout
// ===========================
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  document.getElementById('mainApp').classList.add('hidden');
  document.getElementById('loginPage').classList.remove('hidden');
  showSuccessToast('Berhasil logout');
}

// ===========================
// ✅ Auto-login jika token masih ada
// ===========================
window.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  if (token && username) {
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    document.getElementById('userInfo').innerText = `Selamat datang, ${username}`;
  }
});

// ===========================
// ✅ Helper functions
// ===========================
function toggleLoading(show) {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) overlay.classList.toggle('hidden', !show);
}

function showErrorToast(message) {
  const toast = document.getElementById('errorToast');
  const msg = document.getElementById('errorMessage');
  if (toast && msg) {
    msg.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 4000);
  }
}

function showSuccessToast(message) {
  const toast = document.getElementById('successToast');
  const msg = document.getElementById('successMessage');
  if (toast && msg) {
    msg.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
  }
}
