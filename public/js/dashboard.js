// ================================
// ✅ Dashboard Frontend Script
// ================================

// Pastikan user sudah login
const token = localStorage.getItem('token');
if (!token) {
  alert('Sesi login berakhir. Silakan login kembali.');
  window.location.href = '/';
}

// ================================
// ✅ Utility Toast
// ================================
function showToast(message, type = 'error') {
  const color = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  const toast = document.createElement('div');
  toast.className = `${color} text-white px-4 py-2 rounded shadow-lg fixed top-4 right-4 z-50 animate-fadeIn`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// ================================
// ✅ Load Dashboard Data
// ================================
async function loadDashboard() {
  try {
    const response = await fetch('/api/dashboard', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      showToast('Sesi berakhir. Silakan login ulang.');
      localStorage.removeItem('token');
      setTimeout(() => (window.location.href = '/'), 1200);
      return;
    }

    const data = await response.json();
    if (!data.success) throw new Error(data.message || 'Gagal memuat dashboard');

    // Render ringkasan dashboard
    renderSummary(data.data);
    await loadRecentTours();
    await loadSalesChart();

  } catch (err) {
    console.error('Dashboard Error:', err);
    showToast(`Gagal memuat data dashboard: ${err.message}`);
  }
}

// ================================
// ✅ Render Ringkasan
// ================================
function renderSummary(data) {
  document.getElementById('totalSales').textContent = data.totalSales || 0;
  document.getElementById('totalTours').textContent = data.totalTours || 0;
}

// ================================
// ✅ Load Recent Tours Table
// ================================
async function loadRecentTours() {
  try {
    const res = await fetch('/api/tours', {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    const toursData = await res.json();
    const tours = toursData?.tours || [];

    const tbody = document.getElementById('tourTable');
    tbody.innerHTML = '';

    tours.slice(-5).reverse().forEach(t => {
      const tr = document.createElement('tr');
      tr.className = 'border-b hover:bg-gray-50';
      tr.innerHTML = `
        <td class="py-2 px-4">${t.lead_passenger || '-'}</td>
        <td class="py-2 px-4">${t.tour_code || '-'}</td>
        <td class="py-2 px-4">${t.region || '-'}</td>
        <td class="py-2 px-4">${t.departure_date || '-'}</td>
        <td class="py-2 px-4 text-right">Rp ${t.price?.toLocaleString('id-ID') || '0'}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Load tours error:', err);
    showToast('Gagal memuat daftar tour.');
  }
}

// ================================
// ✅ Sales Chart
// ================================
async function loadSalesChart() {
  try {
    const res = await fetch('/api/sales', {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    const salesData = await res.json();
    const sales = salesData?.sales || [];

    // Ambil 7 data terakhir
    const last7 = sales.slice(-7).reverse();
    const labels = last7.map(s => s.transaction_date || 'N/A');
    const values = last7.map(s => s.sales_amount || 0);

    const ctx = document.getElementById('salesChart').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Penjualan (Rp)',
            data: values,
            backgroundColor: 'rgba(37, 99, 235, 0.5)',
            borderColor: 'rgba(37, 99, 235, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (val) => 'Rp ' + val.toLocaleString('id-ID'),
            },
          },
        },
      },
    });
  } catch (err) {
    console.error('Sales chart error:', err);
    showToast('Gagal memuat grafik penjualan.');
  }
}

// ================================
// ✅ Logout Handler
// ================================
document.getElementById('logout')?.addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  showToast('Berhasil logout', 'success');
  setTimeout(() => (window.location.href = '/'), 800);
});

// Jalankan saat halaman dimuat
document.addEventListener('DOMContentLoaded', loadDashboard);
