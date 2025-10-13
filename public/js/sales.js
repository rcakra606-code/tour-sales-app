import { apiFetch } from "./api.js";

async function loadSales() {
  const res = await apiFetch("/sales");
  // Render ke tabel sales sesuai struktur kamu
  console.log(res.sales); // sementara
}

export { loadSales };
