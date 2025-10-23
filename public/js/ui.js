// public/js/ui.js
// v5.6 — Sidebar (2 toggles) + Theme (sidebar-only) + active link + submenu

(function(){
  "use strict";

  const body = document.body;
  const sidebar = document.querySelector(".sidebar");
  const sideToggleBtns = document.querySelectorAll("[data-toggle='sidebar']");
  const sidebarHeaderToggle = document.querySelector(".sidebar .btn-compact");
  const themeCheckbox = document.getElementById("themeSwitch");
  const SIDEBAR_KEY = "td_sidebar_collapsed_v56";
  const THEME_KEY = "td_theme_v56";

  // safe guards
  function safe(fn){ try{ fn(); }catch(e){} }

  // restore sidebar state
  safe(() => {
    const v = localStorage.getItem(SIDEBAR_KEY);
    if(v === "1") sidebar.classList.add("collapsed");
    else if(v === "0") sidebar.classList.remove("collapsed");
    else {
      if(window.innerWidth <= 900) sidebar.classList.add("collapsed");
      else sidebar.classList.remove("collapsed");
    }
  });

  // add event to all toggle buttons (header + sidebar)
  sideToggleBtns.forEach(btn => btn.addEventListener("click", (e)=>{
    e.preventDefault();
    sidebar.classList.toggle("collapsed");
    localStorage.setItem(SIDEBAR_KEY, sidebar.classList.contains("collapsed")?"1":"0");
  }));

  // also sidebar header compact button (if exists)
  safe(()=> sidebarHeaderToggle.addEventListener("click", (e)=>{
    e.preventDefault();
    sidebar.classList.toggle("collapsed");
    localStorage.setItem(SIDEBAR_KEY, sidebar.classList.contains("collapsed")?"1":"0");
  }));

  // submenu expand
  safe(()=> document.querySelectorAll(".has-children > a").forEach(a=>{
    a.addEventListener("click", (e)=>{
      e.preventDefault();
      const parent = a.parentElement;
      parent.classList.toggle("expanded");
    });
  }));

  // theme (only toggle element is inside sidebar; other UI will not expose another)
  safe(()=>{
    const saved = localStorage.getItem(THEME_KEY);
    if(saved === "dark") body.classList.add("theme-dark");
    else body.classList.remove("theme-dark");
    if(themeCheckbox) themeCheckbox.checked = body.classList.contains("theme-dark");

    if(themeCheckbox){
      themeCheckbox.addEventListener("change", ()=>{
        if(themeCheckbox.checked){
          body.classList.add("theme-dark");
          localStorage.setItem(THEME_KEY, "dark");
        } else {
          body.classList.remove("theme-dark");
          localStorage.setItem(THEME_KEY, "light");
        }
      });
    }
  });

  // set active nav link by href (works for file names)
  safe(()=>{
    const current = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".sidebar nav a").forEach(a=>{
      const href = a.getAttribute("href") || "";
      if(href.split("/").pop() === current) {
        a.classList.add("active");
        const p = a.closest(".has-children");
        if(p) p.classList.add("expanded");
      } else a.classList.remove("active");
    });
  });

  // responsive: close sidebar on small resize
  window.addEventListener("resize", ()=> {
    if(window.innerWidth <= 900) {
      sidebar.classList.add("collapsed");
      localStorage.setItem(SIDEBAR_KEY, "1");
    } else {
      const v = localStorage.getItem(SIDEBAR_KEY);
      if(v === "0") sidebar.classList.remove("collapsed");
    }
  });
})();