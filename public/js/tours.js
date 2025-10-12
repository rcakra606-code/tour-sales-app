// public/js/tours.js
const token = localStorage.getItem("token");

async function loadTours() {
  const res = await fetch("/api/tours", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();

  const table = document.getElementById("tourTable");
  table.innerHTML = "";

  data.tours.forEach((t) => {
    const row = `
      <tr>
        <td>${t.title}</td>
        <td>${t.description || "-"}</td>
        <td>Rp ${t.price?.toLocaleString("id-ID")}</td>
        <td>${t.date || "-"}</td>
      </tr>`;
    table.innerHTML += row;
  });
}

document.addEventListener("DOMContentLoaded", loadTours);
