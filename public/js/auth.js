async function handleLogin(e){
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  try {
    const res = await AuthAPI.login(username, password);
    if (res && res.token) {
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      showSuccessToast('Login berhasil');
      hideAllPages();
      document.getElementById('mainApp').classList.remove('hidden');
      await initializeApp();
    }
  } catch (err) {
    showErrorToast(err.message || 'Login gagal');
  }
}

function logout(){
  localStorage.removeItem('token'); localStorage.removeItem('user');
  hideAllPages(); document.getElementById('loginPage').classList.remove('hidden');
}
