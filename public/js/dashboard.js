(async function(){
  try{
    const res = await secureFetch('/api/dashboard/summary');
    if(!res.ok) throw new Error('Gagal memuat summary');
    const data = await res.json();

    const cards = document.getElementById('summaryCards');
    const makeCard = (title, value) => {
      const c = document.createElement('div'); c.className='card';
      c.innerHTML = `<strong style="font-size:18px">${value}</strong><div class="muted">${title}</div>`;
      return c;
    };
    cards.appendChild(makeCard('Total Tours', data.total_tours));
    cards.appendChild(makeCard('Total Sales', data.total_sales));
    cards.appendChild(makeCard('Total Profit', data.total_profit));
    cards.appendChild(makeCard('Total Documents', data.total_documents));
    cards.appendChild(makeCard('Target Sales', data.target_sales));
    cards.appendChild(makeCard('Target Profit', data.target_profit));

    // chart (monthly sales) - minimal example plotting 12 months zeros if none
    const ctx = document.getElementById('dashboardChart');
    if(ctx){
      const chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
          datasets: [{ label:'Sales', data: new Array(12).fill(0) }]
        }
      });
    }
  }catch(err){
    console.error('❌ Dashboard load error:', err);
  }
})();
