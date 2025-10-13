// ===============================
// ✅ Tours Frontend Handler
// ===============================
const tourTable = document.getElementById("tourTable");
const tourForm = document.getElementById("tourForm");
const resetBtn = document.getElementById("resetBtn");

async function loadTours() {
  try {
    const tours = await apiGet("/tours");
    renderTours(tours);
  } catch (err) {
    console.error(err);
    showErrorToast("Gagal memuat data tours");
  }
}

function renderTours(tours) {
  if (!tourTable) return;
  tourTable.innerHTML = "";
  tours.forEach(tour => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="p-2">${tour.title}</td>
      <td class="p-2">${tour.description}</td>
      <td class="p-2">${tour.price}</td>
      <td class="p-2">${tour.date}</td>
      <td class="p-2 text-center">
        <button onclick="editTour(${tour.id})" class="bg-yellow-500 text-white px-2 py-1 rounded">Edit</button>
        <button onclick="deleteTour(${tour.id})" class="bg-red-600 text-white px-2 py-1 rounded">Hapus</button>
      </td>
    `;
    tourTable.appendChild(tr);
  });
}

async function submitTour(event) {
  event.preventDefault();
  const id = document.getElementById("tourId").value;
  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;
  const price = parseFloat(document.getElementById("price").value);
  const date = document.getElementById("date").value;

  try {
    if (id) {
      await apiPut("/tours", { id, title, description, price, date });
      showSuccessToast("Tour diperbarui");
    } else {
      await apiPost("/tours", { title, description, price, date });
      showSuccessToast("Tour ditambahkan");
    }
    resetTourForm();
    loadTours();
  } catch (err) {
    console.error(err);
    showErrorToast("Gagal menyimpan data tour");
  }
}

function editTour(id) {
  const row = Array.from(tourTable.children).find(tr => tr.querySelector("button")?.onclick.toString().includes(`editTour(${id})`));
  if (!row) return;
  document.getElementById("tourId").value = id;
  document.getElementById("title").value = row.children[0].textContent;
  document.getElementById("description").value = row.children[1].textContent;
  document.getElementById("price").value = row.children[2].textContent;
  document.getElementById("date").value = row.children[3].textContent;
}

async function deleteTour(id) {
  if (!confirm("Yakin ingin menghapus tour ini?")) return;
  try {
    await apiDelete("/tours", { id });
    showSuccessToast("Tour dihapus");
    loadTours();
  } catch (err) {
    console.error(err);
    showErrorToast("Gagal menghapus tour");
  }
}

function resetTourForm() {
  if (!tourForm) return;
  tourForm.reset();
  document.getElementById("tourId").value = "";
}

if (tourForm) tourForm.addEventListener("submit", submitTour);
if (resetBtn) resetBtn.addEventListener("click", resetTourForm);
