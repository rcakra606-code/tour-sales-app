async function loadTours(){
  try {
    const res = await ToursAPI.getAll();
    const tbody = document.getElementById('tourTableBody');
    tbody.innerHTML = '';
    if (!res || !res.tours) return;
    res.tours.forEach(t => {
      const tr = document.createElement('tr');
      tr.innerHTML = '<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">'+ (t.reg_date||'') +'</td>'+
                     '<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">'+ (t.lead_passenger||'') +'</td>'+
                     '<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">'+ (t.pax_count||'') +'</td>'+
                     '<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">'+ (t.tour_code||'') +'</td>'+
                     '<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">'+ (t.region||'') +'</td>'+
                     '<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">'+ (t.price||'') +'</td>'+
                     '<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>';
      tbody.appendChild(tr);
    });
  } catch(e){ showErrorToast(e.message||'Gagal load tours'); }
}

function openTourModal(){ document.getElementById('tourModal').classList.remove('hidden'); }
function closeTourModal(){ document.getElementById('tourModal').classList.add('hidden'); }

async function saveTour(e){
  e.preventDefault();
  const payload = {
    reg_date: document.getElementById('regDate').value,
    lead_passenger: document.getElementById('leadPassenger').value,
    all_passengers: document.getElementById('allPassengers').value,
    pax_count: parseInt(document.getElementById('paxCount').value,10),
    tour_code: document.getElementById('tourCode').value,
    region: document.getElementById('region').value,
    departure_date: document.getElementById('departureDate').value,
    booking_code: document.getElementById('bookingCode').value,
    price: parseInt(document.getElementById('price').value,10),
    departure_status: document.getElementById('departureStatus').value
  };
  try {
    await ToursAPI.create(payload);
    showSuccessToast('Tour tersimpan');
    closeTourModal();
    loadTours();
  } catch (e) { showErrorToast(e.message||'Gagal simpan tour'); }
}
