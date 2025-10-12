// public/js/tours.js
const token = localStorage.getItem('token');
if (!token) {
  // jika tidak ada token, biarkan auth.js meng-handle redirect
  console.warn('Token tidak ditemukan (tours.js)');
}

// element refs
const tourTableBody = document.getElementById('tourTableBody');
const tourModal = document.getElementById('tourModal');
const tourForm = tourModal?.querySelector('form');

// menyimpan edit id saat edit
let editingTourId = null;

async function loadTours() {
  try {
    const res = await fetch('/api/tours', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.status === 401) {
      alert('Sesi berakhir. Silakan login ulang.');
      localStorage.removeItem('token');
      window.location.href = '/';
      return;
    }
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Gagal memuat tours');
    renderTours(data.tours || []);
  } catch (e) {
    console.error('Load Tours error:', e);
    showErrorToast(e.message || 'Gagal memuat tours');
  }
}

function renderTours(tours) {
  if (!tourTableBody) return;
  tourTableBody.innerHTML = '';
  tours.forEach(t => {
    const tr = document.createElement('tr');
    tr.className = 'bg-white';
    tr.innerHTML = `
      <td class="px-6 py-4 text-sm text-gray-500">${t.reg_date||t.date||'-'}</td>
      <td class="px-6 py-4 text-sm text-gray-900">${t.lead_passenger||t.title||'-'}</td>
      <td class="px-6 py-4 text-sm text-gray-500">${t.pax_count||'-'}</td>
      <td class="px-6 py-4 text-sm text-gray-500">${t.tour_code||'-'}</td>
      <td class="px-6 py-4 text-sm text-gray-500">${t.region||'-'}</td>
      <td class="px-6 py-4 text-sm text-gray-500">Rp ${Number(t.price||0).toLocaleString('id-ID')}</td>
      <td class="px-6 py-4 text-right">
        <button class="edit-btn mr-2 text-sm px-3 py-1 bg-yellow-200 rounded" data-id="${t.id}">Edit</button>
        <button class="delete-btn text-sm px-3 py-1 bg-red-200 rounded" data-id="${t.id}">Hapus</button>
      </td>
    `;
    tourTableBody.appendChild(tr);
  });

  // attach handlers
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      openEditTour(id);
    });
  });
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      if (confirm('Yakin ingin menghapus tour ini?')) deleteTour(id);
    });
  });
}

function openTourModal() {
  editingTourId = null;
  if (!tourModal) return;
  tourModal.classList.remove('hidden');
  // reset form fields
  if (tourForm) tourForm.reset();
  document.getElementById('tourModalTitle').textContent = 'Tambah Data Tour';
}

function closeTourModal() {
  if (!tourModal) return;
  tourModal.classList.add('hidden');
}

async function openEditTour(id) {
  try {
    const res = await fetch(`/api/tours`, { headers: { 'Authorization': `Bearer ${token}` }});
    const data = await res.json();
    const tour = (data.tours || []).find(t => String(t.id) === String(id));
    if (!tour) return showErrorToast('Tour tidak ditemukan');
    editingTourId = id;
    if (tourForm) {
      document.getElementById('tourId').value = tour.id || '';
      document.getElementById('regDate').value = tour.reg_date || tour.date || '';
      document.getElementById('leadPassenger').value = tour.lead_passenger || tour.title || '';
      document.getElementById('allPassengers').value = tour.all_passengers || '';
      document.getElementById('paxCount').value = tour.pax_count || '';
      document.getElementById('tourCode').value = tour.tour_code || '';
      document.getElementById('region').value = tour.region || '';
      document.getElementById('departureDate').value = tour.departure_date || '';
      document.getElementById('bookingCode').value = tour.booking_code || '';
      document.getElementById('price').value = tour.price || 0;
      document.getElementById('departureStatus').value = tour.departure_status || 'belum_jalan';
    }
    document.getElementById('tourModalTitle').textContent = 'Edit Data Tour';
    tourModal.classList.remove('hidden');
  } catch (e) {
    console.error('Open edit tour error', e);
    showErrorToast('Gagal membuka data tour');
  }
}

async function saveTour(e) {
  e.preventDefault();
  const payload = {
    reg_date: document.getElementById('regDate').value,
    lead_passenger: document.getElementById('leadPassenger').value,
    all_passengers: document.getElementById('allPassengers').value,
    pax_count: parseInt(document.getElementById('paxCount').value, 10) || 0,
    tour_code: document.getElementById('tourCode').value,
    region: document.getElementById('region').value,
    departure_date: document.getElementById('departureDate').value,
    booking_code: document.getElementById('bookingCode').value,
    price: parseInt(document.getElementById('price').value, 10) || 0,
    departure_status: document.getElementById('departureStatus').value
  };

  try {
    let res;
    if (editingTourId) {
      res = await fetch(`/api/tours/${editingTourId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
    } else {
      res = await fetch('/api/tours', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Gagal menyimpan tour');
    showSuccessToast('Tour tersimpan');
    closeTourModal();
    loadTours();
  } catch (e) {
    console.error('Save tour error', e);
    showErrorToast(e.message || 'Gagal menyimpan tour');
  }
}

async function deleteTour(id) {
  try {
    const res = await fetch(`/api/tours/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Gagal menghapus');
    showSuccessToast('Tour dihapus');
    loadTours();
  } catch (e) {
    console.error('Delete tour error', e);
    showErrorToast(e.message || 'Gagal menghapus tour');
  }
}

// attach save handler
if (tourForm) tourForm.addEventListener('submit', saveTour);

// export small utilities (optional)
window.openTourModal = openTourModal;
window.closeTourModal = closeTourModal;

// initial load
document.addEventListener('DOMContentLoaded', loadTours);
