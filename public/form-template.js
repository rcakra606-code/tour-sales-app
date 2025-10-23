<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Form Template | Travel Dashboard</title>
  <link rel="stylesheet" href="./css/style.css" />
</head>
<body>
  <div class="app">
    <!-- paste your sidebar here (same as previous) -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="brand">TravelDashboard</div>
        <button class="btn-compact" data-toggle="sidebar">☰</button>
      </div>
      <nav>
        <ul>
          <li><a href="dashboard.html">Dashboard</a></li>
          <li class="has-children">
            <a href="#">Reports</a>
            <ul>
              <li><a href="report_tour.html">Tour</a></li>
              <li><a href="report_sales.html">Sales</a></li>
            </ul>
          </li>
        </ul>
      </nav>
      <div class="theme-area">
        <label style="display:inline-flex;align-items:center;gap:8px">
          <input type="checkbox" id="themeSwitch" /> Dark Mode
        </label>
      </div>
    </aside>

    <main>
      <div class="header">
        <div class="left">
          <button class="toggle" data-toggle="sidebar">☰</button>
          <h1>Form Input — Contoh Tour</h1>
        </div>
      </div>

      <section class="card">
        <h2>Tambah Tour</h2>
        <form id="genericForm" class="form-grid" data-endpoint="/api/tours" data-method="POST">
          <div class="form-row">
            <label>Registration Date</label>
            <input type="date" name="registrationDate" />
          </div>

          <div class="form-row">
            <label>Lead Passenger</label>
            <input type="text" name="lead_passenger" placeholder="Nama lead passenger" />
          </div>

          <div class="form-row">
            <label>All Passengers (comma separated)</label>
            <input type="text" name="all_passengers" placeholder="Nama1, Nama2, ..." />
          </div>

          <div class="form-row">
            <label>Tour Code</label>
            <input type="text" name="tour_code" />
          </div>

          <div class="form-row">
            <label>Region</label>
            <select name="region_id" id="regionSelect"><option value="">-- pilih region --</option></select>
          </div>

          <div class="form-row">
            <label>Departure Date</label>
            <input type="date" name="departure_date" />
          </div>

          <div class="form-row">
            <label>Booking Code</label>
            <input type="text" name="booking_code" />
          </div>

          <div class="form-row">
            <label>Tour Price</label>
            <input type="number" name="tour_price" step="0.01" />
          </div>

          <div class="form-row full-row">
            <label>Remarks</label>
            <textarea name="remarks" rows="3"></textarea>
          </div>

          <div class="form-row full-row form-actions">
            <div style="flex:1"></div>
            <button type="reset" class="btn secondary">Reset</button>
            <button type="submit" class="btn primary">Simpan</button>
          </div>
        </form>
      </section>

      <footer>© 2025 Travel Dashboard</footer>
    </main>
  </div>

  <div class="toast-wrap" id="toastWrap"></div>

  <script src="./js/ui.js"></script>
  <script>
    // generic toast
    const toastWrap = document.getElementById('toastWrap');
    function toast(msg,type='info',t=3200){
      const el=document.createElement('div'); el.className='toast '+(type==='success'?'success':type==='error'?'error':'info'); el.textContent=msg; toastWrap.appendChild(el);
      setTimeout(()=>el.remove(),t);
    }

    // load regions into select
    async function loadRegions() {
      try {
        const res = await fetch('/api/regions', {headers:{'Authorization':'Bearer ' + localStorage.getItem('token')}});
        if(!res.ok) throw new Error('Gagal memuat regions');
        const data = await res.json();
        const sel = document.getElementById('regionSelect');
        data.forEach(r=>{
          const opt=document.createElement('option'); opt.value=r.id; opt.textContent=r.region_name || r.name || r.region; sel.appendChild(opt);
        });
      } catch(e) {
        // ignore non-fatal
      }
    }

    // generic form submit handler (works for POST / PUT)
    document.getElementById('genericForm').addEventListener('submit', async function(e){
      e.preventDefault();
      const form = e.target;
      const ep = form.dataset.endpoint;
      const method = (form.dataset.method||'POST').toUpperCase();
      const fd = new FormData(form);
      const obj = {};
      fd.forEach((v,k)=>{ obj[k]=v; });
      // convert empty strings to null for numeric fields if desired
      try {
        const res = await fetch(ep, {
          method,
          headers: {'Content-Type':'application/json','Authorization':'Bearer '+localStorage.getItem('token')},
          body: JSON.stringify(obj)
        });
        const data = await res.json();
        if(!res.ok) throw new Error(data.message || 'Gagal menyimpan');
        toast('Berhasil disimpan','success');
        form.reset();
      } catch(err){
        toast(err.message||'Gagal','error');
      }
    });

    // init
    loadRegions();
  </script>
</body>
</html>