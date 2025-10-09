document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  // Tentukan URL backend
  const API_BASE = window.location.origin.includes('localhost')
    ? 'http://localhost:3000'
    : 'https://tour-sales-app.onrender.com'; // ganti dengan URL Render kamu

  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      alert(data?.message || 'Login failed');
      return;
    }

    if (!data?.token) {
      alert('Server did not return a token');
      return;
    }

    localStorage.setItem('token', data.token);
    window.location.href = '/dashboard.html';
  } catch (err) {
    console.error('Login error:', err);
    alert('Server error');
  }
});
