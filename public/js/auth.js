async function handleLogin(event) {
  event.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  const API_BASE = window.location.origin.includes('localhost')
    ? 'http://localhost:3000'
    : 'https://tour-sales-app.onrender.com'; // ganti dengan URL Render kamu

  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok) {
      showErrorToast(data.message || 'Login gagal');
      return;
    }

    // Simpan token dan arahkan ke dashboard
    localStorage.setItem('token', data.token);
    showSuccessToast('Login berhasil!');
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    document.getElementById('userInfo').innerText = `Selamat datang, ${data.username}`;
  } catch (err) {
    console.error('Login error:', err);
    showErrorToast('Tidak dapat terhubung ke server.');
  }
}
