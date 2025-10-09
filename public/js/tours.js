// ======================================
// ✅ TOURS MODULE
// ======================================

// Load data Tour dari API
async function loadTours() {
  const tableBody = document.getElementById("tourTableBody");
  if (!tableBody) return; // Jika bukan halaman yang punya tabel Tour

  try {
    toggleLoading(true);
    const res = await ToursAPI.getAll();

    tableBody.innerHTML = "";

    if (!res || !Array.isArray(res.tours) || res.tours.length === 0) {
      tableBody.innerHTML =
        `<tr><td colspan="7" class="text-center py-4 text-gray-400">Belum ada data tour</td></tr>`;
      return;
    }

    res.tours.forEach((tour) => {
      const row = document.createElement("tr");
      row.className = "border-b hover:bg-gray-50";

      row.innerHTML = `
        <td class="px-4 py-2 text-sm text-gray-600">${tour.reg_date || "-"}</td>
        <td class="px-4 py-2 text-sm text-gray-900 font-medium">${tour.lead_passenger || "-"}</td>
        <td class="px-4 py-2 text-sm text-gray-600 text-center">${tour.pax_count || 0}</td>
        <td class="px-4 py-2 text-sm text-gray-600">${tour.tour_code || "-"}</td>
        <td class="px-4 py-2 text-sm text-gray-600">${tour.region || "-"}</td>
        <td class="px-4 py-2 text-sm text-gray-600">Rp ${Number(tour.price || 0).toLocaleString("id-ID")}</td>
        <td class="px-4 py-2 text-sm text-gray-600">${tour.departure_status || "-"}</td>
      `;

      tableBody.appendChild(row);
    });
  } catch (e) {
    console.error("Load Tours error:", e);
    showErrorToast(e.message || "Gagal memuat data tour.");
  } finally {
    toggleLoading(false);
  }
}

// ======================================
// ✅ Modal Control
// ======================================
function openTourModal() {
  const modal = document.getElementById("tourModal");
  if (modal) modal.classList.remove("hidden");
}

function closeTourModal() {
  const modal = document.getElementById("tourModal");
  if (modal) modal.classList.add("hidden");
}

// ======================================
// ✅ Save Tour (Create)
// ======================================
async function saveTour(e) {
  e.preventDefault();

  const payload = {
    reg_date: document.getElementById("regDate")?.value || "",
    lead_passenger: document.getElementById("leadPassenger")?.value || "",
    all_passengers: document.getElementById("allPassengers")?.value || "",
    pax_count: parseInt(document.getElementById("paxCount")?.value || "0", 10),
    tour_code: document.getElementById("tourCode")?.value || "",
    region: document.getElementById("region")?.value || "",
    departure_date: document.getElementById("departureDate")?.value || "",
    booking_code: document.getElementById("bookingCode")?.value || "",
    price: parseInt(document.getElementById("price")?.value || "0", 10),
    departure_status: document.getElementById("departureStatus")?.value || "Pending",
  };

  // Validasi sederhana
  if (!payload.lead_passenger || !payload.tour_code || !payload.region) {
    showErrorToast("Nama lead, kode tour, dan region wajib diisi!");
    return;
  }

  try {
    toggleLoading(true);
    await ToursAPI.create(payload);
    showSuccessToast("Data tour berhasil disimpan!");
    closeTourModal();
    await loadTours();
  } catch (e) {
    console.error("Save tour error:", e);
    showErrorToast(e.message || "Gagal menyimpan data tour.");
  } finally {
    toggleLoading(false);
  }
}

// ======================================
// ✅ Inisialisasi otomatis saat halaman dimuat
// ======================================
document.addEventListener("DOMContentLoaded", () => {
  const tourTable = document.getElementById("tourTableBody");
  if (tourTable) {
    loadTours();
  }

  const tourForm = document.getElementById("tourForm");
  if (tourForm) {
    tourForm.addEventListener("submit", saveTour);
  }
});
