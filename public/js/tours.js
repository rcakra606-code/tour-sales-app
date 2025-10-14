// tours.js
async function loadTours() {
  const table = document.getElementById("tourTable");
  if (!table) return;

  try {
    const data = await request("/tours");
    table.innerHTML = data.data.map(t => `
      <tr>
        <td class="border px-2 py-1">${t.title}</td>
        <td class="border px-2 py-1">${t.description}</td>
        <td class="border px-2 py-1">${t.price}</td>
        <td class="border px-2 py-1">${t.date}</td>
        <td class="border px-2 py-1 text-center">-</td>
      </tr>
    `).join("");
  } catch (err) {
    showErrorToast(err.message);
  }
}
