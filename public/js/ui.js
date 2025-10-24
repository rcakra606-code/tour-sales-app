(function(){
  "use strict";
  const body = document.body;
  const SIDEBAR_KEY = "td_sidebar_state";
  const THEME_KEY = "td_theme_mode";
  const TOKEN_KEY = "token";
  const REFRESH_KEY = "refreshToken";

  // sidebar toggle (buttons with data-toggle="sidebar")
  document.querySelectorAll('[data-toggle="sidebar"]').forEach(btn=>{
    btn.addEventListener('click', e=>{
      e.preventDefault();
      const sidebar = document.querySelector('.sidebar');
      if(!sidebar) return;
      sidebar.classList.toggle('collapsed');
      localStorage.setItem(SIDEBAR_KEY, sidebar.classList.contains('collapsed') ? 'collapsed' : 'expanded');
    });
  });

  // restore sidebar state
  try{
    const s = localStorage.getItem(SIDEBAR_KEY);
    if(s==='collapsed'){ document.querySelectorAll('.sidebar').forEach(sb=>sb.classList.add('collapsed')); }
  }catch(e){}

  // theme switch (element with id themeSwitch inside sidebar)
  const themeSwitch = document.getElementById('themeSwitch');
  try{
    const mode = localStorage.getItem(THEME_KEY) || 'light';
    if(mode==='dark') document.documentElement.classList.add('theme-dark');
    if(themeSwitch) themeSwitch.checked = (mode==='dark');
    if(themeSwitch) themeSwitch.addEventListener('change', ()=>{
      if(themeSwitch.checked){ document.documentElement.classList.add('theme-dark'); localStorage.setItem(THEME_KEY,'dark'); }
      else { document.documentElement.classList.remove('theme-dark'); localStorage.setItem(THEME_KEY,'light'); }
    });
  }catch(e){}

  // current user indicator (.current-user)
  (async function showCurrentUser(){
    const nodes = document.querySelectorAll('.current-user');
    if(nodes.length===0) return;
    const token = localStorage.getItem(TOKEN_KEY);
    if(!token) return;
    try{
      const res = await fetch('/api/profile', { headers: { Authorization: 'Bearer '+token }});
      if(!res.ok) return;
      const u = await res.json();
      nodes.forEach(n => n.textContent = `👤 ${u.staff_name || u.username} (${u.role})`);
    }catch(e){}
  })();

  // secureFetch with refresh attempt
  async function refreshToken(){
    const rt = localStorage.getItem(REFRESH_KEY);
    if(!rt) return false;
    try{
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ refreshToken: rt })
      });
      const data = await res.json();
      if(!res.ok) return false;
      localStorage.setItem(TOKEN_KEY, data.token);
      if(data.refreshToken) localStorage.setItem(REFRESH_KEY, data.refreshToken);
      return true;
    }catch(e){
      return false;
    }
  }

  window.secureFetch = async function(url, options = {}){
    options.headers = options.headers || {};
    const token = localStorage.getItem(TOKEN_KEY);
    if(token) options.headers['Authorization'] = 'Bearer ' + token;
    let res = await fetch(url, options);
    if(res.status === 401){
      const ok = await refreshToken();
      if(ok){
        options.headers['Authorization'] = 'Bearer ' + localStorage.getItem(TOKEN_KEY);
        res = await fetch(url, options);
      } else {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_KEY);
        location.href = 'login.html';
      }
    }
    return res;
  };

  // redirect to login if no token and not on login page
  try{
    const page = location.pathname.split('/').pop();
    const whitelisted = ['login.html','index.html',''];
    if(!whitelisted.includes(page) && !localStorage.getItem(TOKEN_KEY)) {
      location.href = 'login.html';
    }
  }catch(e){}
})();
