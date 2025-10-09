// ===============================
// ✅ DASHBOARD INITIALIZATION
// ===============================

// Proteksi: jika tidak ada token, kembalikan ke login
const token = localStorage.getItem('token');
if (!token) {
  window.location.href = '/';
}

// Jalankan saat halaman dimuat
document.addEventListener('DOMContentLoaded', async () => {
  const totalSalesEl = document.getElementById('totalSales');
  const activeToursEl = document.getElementById('activeTours');
  const pendingBookingsEl = document.getElementById('pendingBookings');
  const tourTable = document.getElementById('tourTable');
  const logoutBtn = document.getElementById('logoutBtn');
  const overlay = document.getElementById('loadingOverlay');
  const userInfo = document.getElementById('userInfo');

  // Tampilkan username di header
  const username = localStorage.getItem('username') || 'User';
  if (userInfo) userInfo.textContent = `Halo, ${username}`;

  // Tombol logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      window.location.href = '/';
    });
  }

  // Tampilkan loading
  if (overlay) overlay.classList.remove('hidden');

  try {
    // Ambil data dari API
    const [salesRes, toursRes] = await Promise.all([
      fetch('/api/sales', { headers: { Authorization: `Bearer ${token}` } }),
      fetch('/api/tours', { headers: { Authorization: `Bearer ${token}` } })
    ]);

    if (!salesRes.ok || !toursRes.ok) {
      throw new Error('Gagal memuat data dari server');
    }

    const salesData = await salesRes.json();
    const toursData = await toursRes.json();

    // Tentukan array data sesuai struktur backend
    const sales = salesData.sales || salesData || [];
    const tours = toursData.tours || toursData || [];

    // ===============================
    // ✅ Statistik ringkasan
    // ===============================
    totalSalesEl.textContent = sales.length;
    activeToursEl.textContent = tours.filter(t => t.departure_status === 'jalan').length;
    pendingBookingsEl.textContent = tours.filter(t => t.departure_status === 'belum_jalan').length;

    // ===============================
    // ✅ Tabel recent tours
    // ===============================
    tourTable.innerHTML = '';
    tours.slice(0, 10).forEach(t => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="py-2 px-4 border-b">${t.lead_passenger || '-'}</td>
        <td class="py-2 px-4 border-b">${t.departure_date || '-'}</td>
        <td class="py-2 px-4 border-b">${t.pax_count || 0}</td>
        <td class="py-2 px-4 border-b">
          <span class="px-2 py-1 rounded text-xs ${
            t.departure_status === 'jalan' ? 'bg-green-100 text-green-700' :
            t.departure_status === 'belum_jalan' ? 'bg-yellow-100 text-yellow-700' :
            'bg-gray-100 text-gray-600'
          }">${t.departure_status || '-'}</span>
        </td>
      `;
      tourTable.appendChild(tr);
    });

    // ===============================
    // ✅ Grafik Sales Chart
    // ===============================
    const ctx = document.getElementById('salesChart').getContext('2d');
    const recentSales = sales.slice(-7); // ambil 7 terakhir
    const chartLabels = recentSales.map(s => s.transaction_date || s.date || 'N/A');
    const chartValues = recentSales.map(s => s.sales_amount || s.amount || 0);

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: chartLabels,
        datasets: [{
          label: 'Sales (Rp)',
          data: chartValues,
          backgroundColor: 'rgba(37, 99, 235, 0.5)',
          borderColor: 'rgba(37, 99, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });

  } catch (error) {
    console.error('Error loading dashboard:', error);
    alert('Gagal memuat data dashboard. Silakan login kembali.');
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = '/';
  } finally {
    if (overlay) overlay.classList.add('hidden');
  }
});
