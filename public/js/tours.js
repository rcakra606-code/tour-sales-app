// public/js/tours.js
document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Silakan login terlebih dahulu.");
    window.location.href = "/index.html";
    return;
  }

  const tableBody = document.getElementById("tourTableBody");

  try {
    const data = await api.get("/tours");
    if (!data || data.error) {
      console.error("Error fetching tours:", data?.error);
      alert("Gagal memuat data tour.");
      return;
    }

    tableBody.innerHTML = "";
    data.forEach(tour => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${tour.id}</td>
        <td>${tour.name}</td>
        <td>${tour.destination}</td>
        <td>${tour.price}</td>
        <td>${tour.duration}</td>
      `;
      tableBody.appendChild(row);
    });
  } catch (err) {
    console.error("Error:", err);
    alert("Terjadi kesalahan saat mengambil data tour.");
  }
});
