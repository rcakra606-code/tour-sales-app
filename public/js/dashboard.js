// dashboard.js

// Ambil token dari localStorage
const token = localStorage.getItem('token');

// Jika token tidak ada, redirect ke login
if (!token) {
  alert('Token tidak ditemukan. Silakan login ulang.');
  window.location.href = '/login';
}

// Fungsi render dashboard
function renderDashboard(data) {
  if (!data) return;

  // Contoh: menampilkan total sales dan total tours
  document.getElementById('totalSales').textContent = data.totalSales || 0;
  document.getElementById('totalTours').textContent = data.totalTours || 0;

  // Tambahkan render elemen lain sesuai kebutuhan
}

// Fetch data dashboard
function loadDashboard() {
  fetch('/api/dashboard', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      console.log('Dashboard data:', data);

      if (data.success) {
        renderDashboard(data.data);
      } else {
        throw new Error(data.message || 'Gagal memuat data dashboard');
      }
    })
    .catch(err => {
      console.error(err);
      alert(`❌ Error loading dashboard: ${err.message}`);

      // Hapus token dan redirect ke login jika bermasalah
      if (err.message.includes('401') || err.message.includes('Token') || err.message.includes('403')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    });
}

// Jalankan loadDashboard saat halaman siap
document.addEventListener('DOMContentLoaded', loadDashboard);
