const API_BASE_URL = window.APP_CONFIG.API_BASE_URL;

class API {
  static getAuthHeaders() {
    const token = localStorage.getItem('token');
    return { 'Content-Type': 'application/json', 'Authorization': token ? 'Bearer ' + token : '' };
  }

  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = { headers: this.getAuthHeaders(), ...options };
    try {
      showLoading();
      const res = await fetch(url, config);
      const data = await res.json().catch(()=>null);
      hideLoading();
      if (!res.ok) {
        switch(res.status){
          case 401: localStorage.removeItem('token'); localStorage.removeItem('user'); hideAllPages(); document.getElementById('loginPage').classList.remove('hidden'); throw new Error('Sesi berakhir');
          case 403: throw new Error('Anda tidak memiliki akses');
          case 404: throw new Error('Data tidak ditemukan');
          default: throw new Error((data && data.error) ? data.error : 'Terjadi kesalahan');
        }
      }
      return data;
    } catch (err) {
      hideLoading();
      if (err.name === 'TypeError' || err.message.includes('fetch')) { updateConnectionStatus(false); throw new Error('Tidak dapat terhubung ke server'); }
      throw err;
    }
  }

  static get(ep){ return this.request(ep, { method: 'GET' }); }
  static post(ep, body){ return this.request(ep, { method: 'POST', body: JSON.stringify(body) }); }
  static put(ep, body){ return this.request(ep, { method: 'PUT', body: JSON.stringify(body) }); }
  static delete(ep){ return this.request(ep, { method: 'DELETE' }); }

  static async uploadFile(file){
    const fd = new FormData(); fd.append('file', file);
    const token = localStorage.getItem('token');
    const cfg = { method: 'POST', headers: { 'Authorization': token ? 'Bearer '+token : '' }, body: fd };
    try {
      showLoading();
      const res = await fetch(API_BASE_URL + '/uploads/single', cfg);
      const data = await res.json();
      hideLoading();
      if (!res.ok) throw new Error(data.error || 'Upload gagal');
      return data;
    } catch (e) { hideLoading(); throw e; }
  }
}

const AuthAPI = {
  login: (u,p) => API.post('/auth/login', { username: u, password: p }),
  register: (d) => API.post('/auth/register', d),
  getProfile: () => API.get('/auth/profile')
};

const ToursAPI = {
  getAll: () => API.get('/tours'),
  create: (d) => API.post('/tours', d)
};

const SalesAPI = {
  getAll: () => API.get('/sales'),
  create: (d) => API.post('/sales', d)
};
