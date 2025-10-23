#!/usr/bin/env bash
set -euo pipefail

# apply_update_ui_v58.sh
# Usage:
#   chmod +x apply_update_ui_v58.sh
#   ./apply_update_ui_v58.sh
#
# Script will:
# - create a branch fix/ui-v58
# - backup any existing files to ./backup-ui-v58/
# - overwrite a set of frontend & scripts files (style, ui.js, login/index/dashboard/report files)
# - add an initDatabase script for Neon reset
# - update package.json scripts (postinstall)
# - commit changes and create a patch file update-ui-v58.patch in repo root
#
# Review script before running. This will overwrite the specified files.

BRANCH="fix/ui-v58"
BACKUP_DIR="backup-ui-v58-$(date +%s)"

echo "1) Ensure you're on main and up-to-date. If not, switch/pull first."
current_branch=$(git rev-parse --abbrev-ref HEAD)
if [ "$current_branch" != "main" ]; then
  echo "Switching to main..."
  git checkout main
  git pull origin main
fi

echo "2) Creating new branch: $BRANCH"
git checkout -b "$BRANCH"

echo "3) Creating backup directory: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# Helper to backup existing file before overwriting
backup_and_write() {
  target="$1"
  tmpfile="$2"
  if [ -f "$target" ]; then
    echo "  Backing up existing $target -> $BACKUP_DIR/"
    mkdir -p "$(dirname "$BACKUP_DIR/$target")"
    cp "$target" "$BACKUP_DIR/$target"
  fi
  mkdir -p "$(dirname "$target")"
  cat > "$target" <<'EOF'
__FILE_CONTENT_PLACEHOLDER__
EOF
  echo "  Wrote $target"
}

echo "4) Overwriting frontend + scripts files..."

# ============================
# public/css/style.css
# ============================
cat > public/css/style.css <<'CSS_EOF'
/* =====================================================
   Travel Dashboard Enterprise - Corporate Blue Theme v5.8
   ===================================================== */

/* === CSS Variables === */
:root {
  --accent: #0077cc;
  --accent-light: #0090e0;
  --accent-dark: #005fa3;
  --bg: #f5f7fa;
  --card-bg: #ffffff;
  --text: #222;
  --text-light: #555;
  --border: #d8dde3;
  --shadow: 0 2px 6px rgba(0,0,0,0.08);
  --radius: 10px;
  --transition: all 0.3s ease;
}

/* === Dark Mode === */
body.theme-dark {
  --bg: #1e1f24;
  --card-bg: #2a2c33;
  --text: #e9e9e9;
  --text-light: #bbb;
  --border: #3d4049;
  --shadow: 0 2px 6px rgba(0,0,0,0.4);
}

/* === Base === */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: "Inter", sans-serif;
  background: var(--bg);
  color: var(--text);
  transition: var(--transition);
  min-height: 100vh;
}

/* === Layout === */
.app {
  display: flex;
  min-height: 100vh;
}

main {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

/* === Sidebar === */
.sidebar {
  width: 240px;
  background: var(--card-bg);
  border-right: 1px solid var(--border);
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  transition: var(--transition);
}

.sidebar.collapsed {
  width: 70px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  font-weight: 600;
  font-size: 1.1rem;
  color: var(--accent);
}

.sidebar .brand {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar nav li {
  border-bottom: 1px solid var(--border);
}

.sidebar nav a {
  display: block;
  padding: 12px 18px;
  color: var(--text);
  text-decoration: none;
  transition: var(--transition);
}

.sidebar nav a:hover,
.sidebar nav a.active {
  background: var(--accent);
  color: #fff;
}

.sidebar.collapsed nav a {
  text-align: center;
  font-size: 0.9rem;
}

.sidebar .has-children > ul {
  display: none;
  background: var(--bg);
}

.sidebar .has-children.expanded > ul {
  display: block;
}

.theme-area {
  padding: 14px;
  margin-top: auto;
  font-size: 0.9rem;
  color: var(--text-light);
  border-top: 1px solid var(--border);
}

/* === Header === */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.header .left h1 {
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--accent-dark);
}

.toggle {
  background: var(--accent);
  border: none;
  color: #fff;
  font-size: 1.2rem;
  border-radius: var(--radius);
  padding: 6px 10px;
  cursor: pointer;
}

/* === Card === */
.card {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 20px;
  margin-bottom: 20px;
}

.card h2 {
  font-size: 1.2rem;
  color: var(--accent-dark);
  margin-bottom: 14px;
}

/* === Form === */
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px 20px;
}

.form-row {
  display: flex;
  flex-direction: column;
}

.form-row.full-row {
  grid-column: 1 / -1;
}

.form-row label {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-light);
  margin-bottom: 6px;
}

.form-row input,
.form-row select,
.form-row textarea {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 10px;
  font-size: 0.95rem;
  background: var(--bg);
  color: var(--text);
  transition: var(--transition);
}

.form-row input:focus,
.form-row select:focus,
.form-row textarea:focus {
  border-color: var(--accent);
  outline: none;
  background: #fff;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 10px;
}

/* === Buttons === */
.btn {
  padding: 10px 16px;
  border-radius: var(--radius);
  border: none;
  cursor: pointer;
  font-weight: 600;
  transition: var(--transition);
}

.btn.primary {
  background: var(--accent);
  color: #fff;
}

.btn.primary:hover {
  background: var(--accent-dark);
}

.btn.secondary {
  background: #e8edf2;
  color: var(--accent-dark);
}

.btn.secondary:hover {
  background: var(--accent-light);
  color: #fff;
}

/* === Tables === */
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}

.table thead {
  background: var(--accent);
  color: #fff;
}

.table th,
.table td {
  border: 1px solid var(--border);
  padding: 10px;
  text-align: left;
}

.table tbody tr:hover {
  background: rgba(0,119,204,0.08);
}

/* === Login Page === */
.login-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 90vh;
}

.login-card {
  width: 100%;
  max-width: 380px;
  background: var(--card-bg);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 26px;
}

.login-card h2 {
  color: var(--accent-dark);
  margin-bottom: 10px;
  text-align: center;
}

.note {
  text-align: center;
  font-size: 0.9rem;
  color: var(--text-light);
  margin-bottom: 20px;
}

/* === Toast === */
.toast-wrap {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toast {
  padding: 12px 16px;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  color: #fff;
  font-size: 0.9rem;
  animation: fadeInUp 0.3s ease;
}

.toast.info { background: var(--accent-light); }
.toast.success { background: #2ecc71; }
.toast.error { background: #e74c3c; }

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* === Footer === */
footer {
  margin-top: 30px;
  text-align: center;
  font-size: 0.85rem;
  color: var(--text-light);
}

/* === Responsive === */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    z-index: 999;
    height: 100%;
    left: -240px;
  }
  .sidebar.expanded {
    left: 0;
  }
  main {
    padding: 16px;
  }
}
CSS_EOF

# ============================
# public/js/ui.js
# ============================
cat > public/js/ui.js <<'JS_EOF'
/* public/js/ui.js — v5.7 Corporate Blue
   Sidebar toggle, theme, secureFetch (auto refresh token)
*/
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

  safe(()=>{
    document.querySelectorAll(".has-children > a").forEach(a=>{
      a.addEventListener("click", e=>{
        e.preventDefault();
        const p=a.parentElement;
        p.classList.toggle("expanded");
      });
    });
  });

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

  safe(()=>{
    const current = location.pathname.split("/").pop();
    document.querySelectorAll(".sidebar nav a").forEach(a=>{
      const h=a.getAttribute("href")||"";
      if(h.endsWith(current)) a.classList.add("active");
      else a.classList.remove("active");
    });
  });

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
JS_EOF

# ============================
# public/index.html
# ============================
cat > public/index.html <<'HTML_EOF'
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Travel Dashboard | Memuat Sistem</title>
  <link rel="stylesheet" href="./css/style.css" />
  <style>
    body {
      display:flex;
      justify-content:center;
      align-items:center;
      height:100vh;
      background:var(--bg);
      transition:background 0.3s ease;
    }
    .loader-wrap { text-align:center; color:var(--text); font-family:'Inter',sans-serif; animation:fadeIn 0.4s ease-in; }
    .loader { border:6px solid var(--border); border-top:6px solid var(--accent); border-radius:50%; width:70px;height:70px; margin:auto; animation:spin 1s linear infinite; }
    @keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
    @keyframes fadeIn { from{opacity:0} to{opacity:1} }
    .title { font-size:1.3rem; margin-top:20px; font-weight:600; }
    .note { opacity:0.6; font-size:0.9rem; }
  </style>
</head>
<body>
  <div class="loader-wrap">
    <div class="loader"></div>
    <div class="title">Memuat Sistem Travel Dashboard...</div>
    <div class="note">Silakan tunggu sebentar</div>
  </div>

  <script>
    setTimeout(() => {
      const token = localStorage.getItem("token");
      if (token) {
        window.location.href = "dashboard.html";
      } else {
        window.location.href = "login.html";
      }
    }, 900);
  </script>
</body>
</html>
HTML_EOF

# ============================
# public/login.html
# ============================
cat > public/login.html <<'HTML_EOF'
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Login | Travel Dashboard</title>
  <link rel="stylesheet" href="./css/style.css" />
</head>
<body>
  <div class="app">
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="brand">TravelDashboard</div>
        <button class="btn-compact" data-toggle="sidebar">☰</button>
      </div>
      <nav>
        <ul>
          <li><a href="index.html">Home</a></li>
          <li><a href="login.html" class="active">Login</a></li>
        </ul>
      </nav>
      <div class="theme-area">
        <label style="display:inline-flex;align-items:center;gap:8px">
          <input type="checkbox" id="themeSwitch" /> 🌙 Dark Mode
        </label>
      </div>
    </aside>

    <main>
      <div class="login-wrap">
        <div class="login-card card">
          <h2 class="center">Selamat Datang</h2>
          <p class="center note">Masuk ke sistem Travel Dashboard</p>

          <form id="loginForm">
            <div class="form-row">
              <label for="username">Username</label>
              <input id="username" name="username" type="text" placeholder="Masukkan username" required />
            </div>
            <div class="form-row">
              <label for="password">Password</label>
              <input id="password" name="password" type="password" placeholder="Masukkan password" required />
            </div>

            <div class="form-actions">
              <button type="submit" class="btn primary submit" style="width:100%">LOGIN</button>
            </div>
            <p id="loginMessage" class="note center"></p>
          </form>
        </div>
      </div>

      <footer>© 2025 Travel Dashboard Enterprise</footer>
    </main>
  </div>

  <div class="toast-wrap" id="toastWrap"></div>
  <script src="./js/ui.js"></script>
  <script>
    const toastWrap = document.getElementById("toastWrap");
    const toast = (msg, type="info", t=3200) => {
      const el = document.createElement("div");
      el.className = "toast " + (type === "success" ? "success" : type === "error" ? "error" : "info");
      el.textContent = msg;
      toastWrap.appendChild(el);
      setTimeout(() => el.remove(), t);
    };

    document.getElementById("loginForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value.trim();

      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Login gagal");

        localStorage.setItem("token", data.token);
        if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);

        toast("Login berhasil", "success");
        setTimeout(() => { window.location.href = "dashboard.html"; }, 600);
      } catch (err) {
        toast(err.message, "error");
        document.getElementById("loginMessage").textContent = err.message;
      }
    });
  </script>
</body>
</html>
HTML_EOF

# ============================
# public/dashboard.html
# ============================
cat > public/dashboard.html <<'HTML_EOF'
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Dashboard | Travel Dashboard</title>
  <link rel="stylesheet" href="./css/style.css" />
</head>
<body>
  <div class="app">
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="brand">TravelDashboard</div>
        <button class="btn-compact" data-toggle="sidebar">☰</button>
      </div>
      <nav>
        <ul>
          <li><a href="dashboard.html" class="active">Dashboard</a></li>
          <li class="has-children expanded">
            <a href="#">Reports</a>
            <ul>
              <li><a href="report_tour.html">Tour Report</a></li>
              <li><a href="report_sales.html">Sales Report</a></li>
              <li><a href="report_document.html">Document Report</a></li>
            </ul>
          </li>
          <li class="has-children">
            <a href="#">Management</a>
            <ul>
              <li><a href="user-management.html">User Management</a></li>
              <li><a href="region_management.html">Region Management</a></li>
              <li><a href="target_management.html">Target Management</a></li>
              <li><a href="tour_form.html">Tour Management</a></li>
            </ul>
          </li>
          <li><a href="executive-dashboard.html">Executive Dashboard</a></li>
          <li><a href="audit_log.html">Audit Log</a></li>
          <li><a href="profile.html">Profile</a></li>
          <li><a href="logout.html">Logout</a></li>
        </ul>
      </nav>
      <div class="theme-area">
        <label><input type="checkbox" id="themeSwitch" /> 🌙 Dark Mode</label>
      </div>
    </aside>

    <main>
      <div class="header">
        <div class="left">
          <button class="toggle" data-toggle="sidebar">☰</button>
          <h1>Dashboard</h1>
        </div>
        <div class="right">
          <span id="currentUser" class="note"></span>
        </div>
      </div>

      <section class="card">
        <h2>Ringkasan Utama</h2>
        <div id="summaryCards" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px"></div>
      </section>

      <section class="card">
        <h2>Performa Bulanan</h2>
        <canvas id="dashboardChart" height="180"></canvas>
      </section>

      <section class="card">
        <h2>Aktivitas Terbaru</h2>
        <table class="table" id="recentTable">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Kategori</th>
              <th>Deskripsi</th>
              <th>Staff</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </section>

      <footer>© 2025 Travel Dashboard Enterprise</footer>
    </main>
  </div>

  <div class="toast-wrap" id="toastWrap"></div>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script src="./js/ui.js"></script>
  <script src="./js/dashboard.js"></script>
</body>
</html>
HTML_EOF

# 