// Error handling and UI feedback functions
let connectionCheckInterval;
function showLoading(){ document.getElementById('loadingOverlay').classList.remove('hidden'); }
function hideLoading(){ document.getElementById('loadingOverlay').classList.add('hidden'); }
function showErrorToast(message){ const toast=document.getElementById('errorToast'); document.getElementById('errorMessage').textContent = message; toast.classList.remove('hidden'); setTimeout(hideErrorToast,5000); }
function hideErrorToast(){ document.getElementById('errorToast').classList.add('hidden'); }
function showSuccessToast(message){ const t=document.getElementById('successToast'); document.getElementById('successMessage').textContent = message; t.classList.remove('hidden'); setTimeout(hideSuccessToast,3000); }
function hideSuccessToast(){ document.getElementById('successToast').classList.add('hidden'); }
function showNetworkError(){ hideAllPages(); document.getElementById('networkErrorPage').classList.remove('hidden'); updateConnectionStatus(false); }
function showServerError(){ hideAllPages(); document.getElementById('serverErrorPage').classList.remove('hidden'); updateConnectionStatus(false); }
function showNotFoundError(){ hideAllPages(); document.getElementById('notFoundPage').classList.remove('hidden'); }
function hideAllPages(){ const pages=['loginPage','mainApp','networkErrorPage','serverErrorPage','notFoundPage']; pages.forEach(id=>document.getElementById(id).classList.add('hidden')); }
function updateConnectionStatus(isConnected){ const s = document.getElementById('connectionStatus'); if(!s) return; if(isConnected){ s.className='w-3 h-3 bg-green-500 rounded-full'; s.title='Terhubung'; } else { s.className='w-3 h-3 bg-red-500 rounded-full'; s.title='Tidak terhubung'; } }
async function retryConnection(){ showLoading(); try{ const response = await fetch(window.APP_CONFIG.API_BASE_URL + '/health'); if(response.ok){ hideLoading(); updateConnectionStatus(true); const token = localStorage.getItem('token'); if(token){ hideAllPages(); document.getElementById('mainApp').classList.remove('hidden'); await initializeApp(); } else { hideAllPages(); document.getElementById('loginPage').classList.remove('hidden'); } } else { throw new Error('Server error'); } } catch (error){ hideLoading(); if (error.name === 'TypeError' || error.message.includes('fetch')) showNetworkError(); else showServerError(); } }
function goHome(){ hideAllPages(); const token=localStorage.getItem('token'); if(token){ document.getElementById('mainApp').classList.remove('hidden'); showPage('dashboard'); } else { document.getElementById('loginPage').classList.remove('hidden'); } }
function startConnectionMonitoring(){ connectionCheckInterval = setInterval(async ()=>{ try{ const resp = await fetch(window.APP_CONFIG.API_BASE_URL + '/health',{ method: 'GET', cache: 'no-cache' }); updateConnectionStatus(resp.ok); } catch(e){ updateConnectionStatus(false); } },30000); }
function stopConnectionMonitoring(){ if(connectionCheckInterval) clearInterval(connectionCheckInterval); }
window.addEventListener('error', (e)=>{ console.error('Global error', e); showErrorToast('Terjadi kesalahan pada aplikasi'); });
window.addEventListener('unhandledrejection', (event)=>{ console.error('Unhandled rejection', event.reason); if(event.reason && event.reason.message){ if(event.reason.message.includes('fetch')||event.reason.message.includes('network')) showNetworkError(); else if(event.reason.message.includes('token')||event.reason.message.includes('Unauthorized')) logout(); else showErrorToast('Terjadi kesalahan: '+event.reason.message); } else showErrorToast('Terjadi kesalahan yang tidak diketahui'); });
window.addEventListener('online', ()=>{ updateConnectionStatus(true); showSuccessToast('Koneksi internet tersambung kembali'); });
window.addEventListener('offline', ()=>{ updateConnectionStatus(false); showErrorToast('Koneksi internet terputus'); });
document.addEventListener('DOMContentLoaded', ()=>{ startConnectionMonitoring(); retryConnection(); });
