const token = localStorage.getItem('token');
if (!token) {
  window.location.href = '/';
}

document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('username').textContent = 'Loading user info...';

  try {
    const res = await fetch('/api/sales', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) throw new Error('Failed to load sales data');
    const data = await res.json();

    document.getElementById('username').textContent = 'Logged in successfully';
    document.getElementById('sales').innerHTML = `
      <h2 class="text-xl font-semibold mb-2">Sales Overview</h2>
      <pre>${JSON.stringify(data, null, 2)}</pre>
    `;
  } catch (err) {
    console.error(err);
    document.getElementById('sales').textContent = 'Error loading data.';
  }
});

document.getElementById('logout').addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = '/';
});
