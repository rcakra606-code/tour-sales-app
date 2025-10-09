async function loadSales(){
  try {
    const res = await SalesAPI.getAll();
    const tbody = document.getElementById('salesTableBody');
    tbody.innerHTML = '';
    if (!res || !res.sales) return;
    res.sales.forEach(s => {
      const tr = document.createElement('tr');
      tr.innerHTML = '<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">'+ (s.transaction_date||'') +'</td>'+
                     '<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">'+ (s.invoice_number||'') +'</td>'+
                     '<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">'+ (s.sales_amount||'') +'</td>'+
                     '<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">'+ (s.profit_amount||'') +'</td>'+
                     '<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">'+ (s.staff_name||'') +'</td>'+
                     '<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>';
      tbody.appendChild(tr);
    });
  } catch(e){ showErrorToast(e.message||'Gagal load sales'); }
}

function openSalesModal(){ document.getElementById('salesModal').classList.remove('hidden'); }
function closeSalesModal(){ document.getElementById('salesModal').classList.add('hidden'); }

async function saveSales(e){
  e.preventDefault();
  const payload = {
    transaction_date: document.getElementById('transactionDate').value,
    invoice_number: document.getElementById('invoiceNumber').value,
    sales_amount: parseInt(document.getElementById('salesAmount').value,10),
    profit_amount: parseInt(document.getElementById('profitAmount').value,10),
    discount_amount: parseInt(document.getElementById('discountAmount').value,10)||0,
    discount_remarks: document.getElementById('discountRemarks').value,
    staff_name: document.getElementById('staffName').value
  };
  try {
    await SalesAPI.create(payload);
    showSuccessToast('Sales tersimpan');
    closeSalesModal();
    loadSales();
  } catch (e) { showErrorToast(e.message||'Gagal simpan sales'); }
}
