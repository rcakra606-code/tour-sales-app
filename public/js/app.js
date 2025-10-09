async function initializeApp(){
  const user = JSON.parse(localStorage.getItem('user')||'null');
  if (user) {
    document.getElementById('userInfo').textContent = 'Selamat datang, ' + (user.name||user.username);
    // show sales menu for non-basic roles
    if (user.role !== 'basic') document.getElementById('salesMenuItems').classList.remove('hidden');
  }
  await loadTours();
  await loadSales();
  showPage('dashboard');
}

function showPage(page){
  const pages = { dashboard: 'dashboardPage', dataEntry: 'dataEntryPage', salesDashboard:'salesDashboardPage', salesDataEntry:'salesDataEntryPage' };
  Object.values(pages).forEach(id => document.getElementById(id).classList.add('hidden'));
  const map = { dashboard:'dashboardPage', dataEntry:'dataEntryPage', salesDashboard:'salesDashboardPage', salesDataEntry:'salesDataEntryPage' };
  const id = map[page] || 'dashboardPage';
  document.getElementById(id).classList.remove('hidden');
  document.getElementById('pageTitle').textContent = page.charAt(0).toUpperCase() + page.slice(1);
}
