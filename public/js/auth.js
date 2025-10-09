// ===========================
// ✅ AUTH HANDLER (Frontend)
// ===========================

// Base URL otomatis menyesuaikan environment (local atau render)
const API_BASE = window.location.origin.includes('localhost')
  ? 'http://localhost:3000'
  : window.location.origin;

// ===========================
// ✅ Login Handler
// ===========================
async function handleLogin(event) {
  event.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!username || !password) {
    showErrorToast('Masukkan username dan password.');
    return;
  }

  try {
    toggleLoading(true);

    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      showErrorToast(data.message || 'Login gagal.');
      return;
    }

    // Simpan token dan username
    localStorage.setItem('token', data.token);
    localStorage.setItem('username', data.username);

    showSuccessToast('Login berhasil!');
    setTimeout(() => {
      window.location.href = '/dashboard.html'; // arahkan ke dashboard utama
    }, 800);
  } catch (err) {
    console.error('Login error:', err);
    showErrorToast('Tidak dapat terhubung ke server.');
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
  showSuccessToast('Berhasil logout');
  setTimeout(() => (window.location.href = '/'), 700);
}

// ===========================
// ✅ Route Protection
// ===========================
function checkAuth() {
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  const isLoginPage = window.location.pathname === '/' || window.location.pathname.endsWith('index.html');

  // Jika belum login & buka halaman selain index.html → paksa balik ke login
  if (!token && !isLoginPage) {
    console.warn('User belum login. Redirect ke login page.');
    window.location.href = '/';
    return false;
  }

  // Jika sudah login & masih di halaman login → langsung ke dashboard
  if (token && isLoginPage) {
    console.log('User sudah login. Redirect ke dashboard.');
    window.location.href = '/dashboard.html';
    return false;
  }

  // Jika sudah login di halaman dashboard → tampilkan info user
  if (token && username) {
    const info = document.getElementById('userInfo');
    if (info) info.innerText = `Selamat datang, ${username}`;
  }

  return true;
}

// Jalankan proteksi saat halaman dimuat
window.addEventListener('DOMContentLoaded', checkAuth);

// ===========================
// ✅ Helper Toast & Loading
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
  } else {
    alert(message);
  }
}

function showSuccessToast(message) {
  const toast = document.getElementById('successToast');
  const msg = document.getElementById('successMessage');
  if (toast && msg) {
    msg.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
  } else {
    console.log(message);
  }
}
