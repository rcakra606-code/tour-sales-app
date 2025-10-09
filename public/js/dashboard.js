const token = localStorage.getItem('token');
if (!token) {
  window.location.href = '/';
}

document.addEventListener('DOMContentLoaded', async () => {
  const totalSalesEl = document.getElementById('totalSales');
  const activeToursEl = document.getElementById('activeTours');
  const pendingBookingsEl = document.getElementById('pendingBookings');
  const tourTable = document.getElementById('tourTable');

  try {
    // Ambil data dari API
    const [salesRes, toursRes] = await Promise.all([
      fetch('/api/sales', { headers: { 'Authorization': `Bearer ${token}` } }),
      fetch('/api/tours', { headers: { 'Authorization': `Bearer ${token}` } })
    ]);

    if (!salesRes.ok || !toursRes.ok) throw new Error('Failed to fetch data');

    const salesData = await salesRes.json();
    const toursData = await toursRes.json();

    // Hitung ringkasan
    totalSalesEl.textContent = salesData?.length || 0;
    activeToursEl.textContent = toursData?.filter(t => t.status === 'active').length || 0;
    pendingBookingsEl.textContent = toursData?.filter(t => t.status === 'pending').length || 0;

    // Tabel tours
    tourTable.innerHTML = toursData.slice(0, 10).map(t => `
      <tr>
        <td class="py-2 px-4 border-b">${t.name}</td>
        <td class="py-2 px-4 border-b">${new Date(t.date).toLocaleDateString()}</td>
        <td class="py-2 px-4 border-b">${t.participants || 0}</td>
        <td class="py-2 px-4 border-b">
          <span class="px-2 py-1 rounded text-xs ${
            t.status === 'active' ? 'bg-green-100 text-green-700' :
            t.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
            'bg-gray-100 text-gray-600'
          }">${t.status}</span>
        </td>
      </tr>
    `).join('');

    // Chart
    const ctx = document.getElementById('salesChart').getContext('2d');
    const chartData = salesData.slice(0, 7).map(s => s.amount || Math.random() * 1000);
    const chartLabels = salesData.slice(0, 7).map((s, i) => s.date || `Day ${i + 1}`);

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: chartLabels,
        datasets: [{
          label: 'Sales Amount',
          data: chartData,
          backgroundColor: 'rgba(37, 99, 235, 0.5)',
          borderColor: 'rgba(37, 99, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: { y: { beginAtZero: true } }
      }
    });

  } catch (error) {
    console.error('Error loading dashboard:', error);
    alert('Failed to load dashboard data. Please re-login.');
    localStorage.removeItem('token');
    window.location.href = '/';
  }
});

// Logout
document.getElementById('logout').addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = '/';
});
