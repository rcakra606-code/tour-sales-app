// public/js/ui.js — v5.7 Corporate Blue
// ✅ Sidebar (2 toggle) + Dark mode (sidebar only)
// ✅ Auto JWT refresh & redirect to login on expiry
// ✅ Active link sync

(function(){
  "use strict";

  const body = document.body;
  const sidebar = document.querySelector(".sidebar");
  const sideToggleBtns = document.querySelectorAll("[data-toggle='sidebar']");
  const themeCheckbox = document.getElementById("themeSwitch");
  const SIDEBAR_KEY = "td_sidebar_state";
  const THEME_KEY = "td_theme_mode";
  const TOKEN_KEY = "token";
  const REFRESH_KEY = "refreshToken";

  // ===== Helper =====
  function safe(fn){ try{ fn(); }catch(e){} }
  function toast(msg,type='info',t=3000){
    const tw = document.getElementById('toastWrap');
    if(!tw) return;
    const el=document.createElement('div');
    el.className='toast '+(type==='success'?'success':type==='error'?'error':'info');
    el.textContent=msg;
    tw.appendChild(el);
    setTimeout(()=>el.remove(),t);
  }

  // ===== Sidebar =====
  safe(()=>{
    const s = localStorage.getItem(SIDEBAR_KEY);
    if(s==='collapsed') sidebar?.classList.add("collapsed");
  });

  sideToggleBtns.forEach(btn=>{
    btn.addEventListener("click", e=>{
      e.preventDefault();
      sidebar?.classList.toggle("collapsed");
      localStorage.setItem(SIDEBAR_KEY, sidebar?.classList.contains("collapsed") ? "collapsed" : "expanded");
    });
  });

  // ===== Submenu expand =====
  safe(()=>{
    document.querySelectorAll(".has-children > a").forEach(a=>{
      a.addEventListener("click", e=>{
        e.preventDefault();
        const p=a.parentElement;
        p.classList.toggle("expanded");
      });
    });
  });

  // ===== Theme toggle (sidebar only) =====
  safe(()=>{
    const mode = localStorage.getItem(THEME_KEY);
    if(mode==='dark') body.classList.add("theme-dark");
    if(themeCheckbox){
      themeCheckbox.checked = mode==='dark';
      themeCheckbox.addEventListener("change",()=>{
        if(themeCheckbox.checked){
          body.classList.add("theme-dark");
          localStorage.setItem(THEME_KEY,"dark");
        }else{
          body.classList.remove("theme-dark");
          localStorage.setItem(THEME_KEY,"light");
        }
      });
    }
  });

  // ===== Active link sync =====
  safe(()=>{
    const current = location.pathname.split("/").pop();
    document.querySelectorAll(".sidebar nav a").forEach(a=>{
      const h=a.getAttribute("href")||"";
      if(h.endsWith(current)) a.classList.add("active");
      else a.classList.remove("active");
    });
  });

  // ===== JWT Handling =====
  async function refreshToken(){
    const rt = localStorage.getItem(REFRESH_KEY);
    if(!rt) return false;
    try{
      const res = await fetch("/api/auth/refresh", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ refreshToken: rt })
      });
      const data = await res.json();
      if(!res.ok) throw new Error(data.message || "Refresh gagal");
      localStorage.setItem(TOKEN_KEY, data.token);
      if(data.refreshToken) localStorage.setItem(REFRESH_KEY, data.refreshToken);
      return true;
    }catch(e){
      console.warn("Token refresh gagal:", e);
      return false;
    }
  }

  // Wrapper untuk fetch() agar auto-refresh token
  window.secureFetch = async function(url, options={}){
    const token = localStorage.getItem(TOKEN_KEY);
    options.headers = options.headers || {};
    if(token) options.headers["Authorization"] = "Bearer " + token;

    let res = await fetch(url, options);
    if(res.status===401){
      console.warn("Token expired, mencoba refresh...");
      const ok = await refreshToken();
      if(ok){
        const newToken = localStorage.getItem(TOKEN_KEY);
        options.headers["Authorization"] = "Bearer " + newToken;
        res = await fetch(url, options); // ulang sekali
      }else{
        toast("Sesi Anda telah berakhir","error");
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_KEY);
        setTimeout(()=>location.href="login.html",1200);
      }
    }
    return res;
  };

  // ===== Auto redirect ke login jika tidak ada token =====
  safe(()=>{
    const page = location.pathname.split("/").pop();
    const isAuthPage = ["login.html","logout.html","index.html"].includes(page);
    const token = localStorage.getItem(TOKEN_KEY);
    if(!token && !isAuthPage){
      location.href = "login.html";
    }
  });

  console.log("✅ UI Core Loaded v5.7");
})();