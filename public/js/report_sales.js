// public/js/report_sales.js — v5.8 Corporate Blue
// CRUD Sales Data + Filter + Export CSV + Toast Notification

(async () => {
  const token = localStorage.getItem("token");
  const toastWrap = document.getElementById("toastWrap");

  const toast = (msg, type="info", t=3000) => {
    const el=document.createElement("div");
    el.className="toast "+(type==="success"?"success":type==="error"?"error":"info");
    el.textContent=msg;
    toastWrap.appendChild(el);
    setTimeout(()=>el.remove(),t);
  };

  const tbody = document.querySelector("#salesTable tbody");
  const staffSelect = document.getElementById("staffSelect");
  const filterStaff = document.getElementById("filterStaff");

  // === Load Staff ===
  async function loadStaff(){
    try {
      const res = await secureFetch("/api/users");
      const data = await res.json();
      staffSelect.innerHTML = `<option value="">Pilih Staff</option>`;
      filterStaff.innerHTML = `<option value="">Semua Staff</option>`;
      data.forEach(u=>{
        staffSelect.innerHTML += `<option value="${u.staff_name||u.username}">${u.staff_name||u.username}</option>`;
        filterStaff.innerHTML += `<option value="${u.staff_name||u.username}">${u.staff_name||u.username}</option>`;
      });
    } catch { toast("Gagal memuat staff","error"); }
  }

  // === Load Sales Data ===
  async function loadSales(){
    try{
      const month = document.getElementById("filterMonth").value;
      const year = document.getElementById("filterYear").value;
      const staff = document.getElementById("filterStaff").value;
      const res = await secureFetch(`/api/sales?month=${month}&year=${year}&staff=${staff}`);
      const data = await res.json();
      tbody.innerHTML="";
      data.forEach(s=>{
        const tr=document.createElement("tr");
        tr.innerHTML=`
          <td>${s.transaction_date||"-"}</td>
          <td>${s.staff_name||"-"}</td>
          <td>${s.invoice_no||"-"}</td>
          <td>${Number(s.sales_amount||0).toLocaleString("id-ID")}</td>
          <td>${Number(s.profit_amount||0).toLocaleString("id-ID")}</td>
          <td>
            <button class="btn secondary btn-sm" data-edit="${s.id}">✏️</button>
            <button class="btn error btn-sm" data-del="${s.id}">🗑️</button>
          </td>`;
        tbody.appendChild(tr);
      });
    }catch(err){
      toast("Gagal memuat data sales","error");
    }
  }

  // === Add Sales ===
  document.getElementById("salesForm").addEventListener("submit", async e=>{
    e.preventDefault();
    const f = e.target;
    const fd = new FormData(f);
    const obj={}; fd.forEach((v,k)=>obj[k]=v);
    try{
      const res = await secureFetch(f.dataset.endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(obj)});
      const d = await res.json();
      if(!res.ok) throw new Error(d.message||"Gagal tambah data");
      toast("Data sales berhasil ditambahkan","success");
      f.reset(); loadSales();
    }catch(err){ toast(err.message,"error"); }
  });

  // === Delete Sales ===
  tbody.addEventListener("click", async e=>{
    const id = e.target.dataset.del;
    if(id && confirm("Hapus data ini?")){
      try{
        const res = await secureFetch(`/api/sales/${id}`,{method:"DELETE"});
        if(!res.ok) throw new Error("Gagal hapus data");
        toast("Data terhapus","success");
        loadSales();
      }catch(err){ toast(err.message,"error"); }
    }
  });

  // === Filter ===
  document.getElementById("filterBtn").addEventListener("click",e=>{
    e.preventDefault(); loadSales();
  });

  // === Export CSV ===
  document.getElementById("exportCSV").addEventListener("click",()=>{
    const rows=[["Tanggal","Staff","Invoice","Sales","Profit"]];
    document.querySelectorAll("#salesTable tbody tr").forEach(tr=>{
      rows.push(Array.from(tr.children).map(td=>td.textContent));
    });
    const csv=rows.map(r=>r.join(",")).join("\n");
    const blob=new Blob([csv],{type:"text/csv"});
    const a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download="sales_report.csv";
    a.click();
  });

  await loadStaff();
  await loadSales();
})();