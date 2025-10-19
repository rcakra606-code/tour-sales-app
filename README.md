# 🌍 Travel Dashboard Enterprise v5.0

Sistem Dashboard Manajemen Tour & Sales berbasis Node.js + PostgreSQL (NeonDB)  
dengan frontend modern (HTML, CSS, JS) + Dark Mode + Role-based Access.  

---

## ⚙️ Fitur Utama

### 🔐 Authentication
- Login JWT-based (`/api/auth/login`)
- Role: `super`, `semi`, `basic`
- Akses halaman berdasarkan role

### 📊 Dashboard & Reporting
- Dashboard ringkasan Sales, Profit, Tours
- Target bulanan per user
- Chart perbandingan Target vs Realisasi (Chart.js)
- Sidebar global collapsible
- Dark/Light mode sinkron otomatis

### 🧾 Modul CRUD
| Modul | Endpoint | Deskripsi |
|--------|-----------|-----------|
| **Sales** | `/api/report/sales` | Tambah, lihat data sales & profit |
| **Tour** | `/api/report/tour` | Data tour lengkap dengan visa & dokumen |
| **Document** | `/api/report/document` | Input dokumen (tgl terima, tamu, booking, remarks) |
| **Target** | `/api/targets` | Target bulanan per user |
| **Users** | `/api/users` | Kelola user (khusus role `super`) |
| **Profile** | `/api/profile` | Lihat & ubah password user login |

---

## 🧱 Struktur Proyek

# 🌍 Travel Dashboard Enterprise v5.0

Sistem Dashboard Manajemen Tour & Sales berbasis Node.js + PostgreSQL (NeonDB)  
dengan frontend modern (HTML, CSS, JS) + Dark Mode + Role-based Access.  

---

## ⚙️ Fitur Utama

### 🔐 Authentication
- Login JWT-based (`/api/auth/login`)
- Role: `super`, `semi`, `basic`
- Akses halaman berdasarkan role

### 📊 Dashboard & Reporting
- Dashboard ringkasan Sales, Profit, Tours
- Target bulanan per user
- Chart perbandingan Target vs Realisasi (Chart.js)
- Sidebar global collapsible
- Dark/Light mode sinkron otomatis

### 🧾 Modul CRUD
| Modul | Endpoint | Deskripsi |
|--------|-----------|-----------|
| **Sales** | `/api/report/sales` | Tambah, lihat data sales & profit |
| **Tour** | `/api/report/tour` | Data tour lengkap dengan visa & dokumen |
| **Document** | `/api/report/document` | Input dokumen (tgl terima, tamu, booking, remarks) |
| **Target** | `/api/targets` | Target bulanan per user |
| **Users** | `/api/users` | Kelola user (khusus role `super`) |
| **Profile** | `/api/profile` | Lihat & ubah password user login |

---

## 🧱 Struktur Proyek

Travel-Dashboard-Enterprise/
│
├── config/
│ ├── database.js
│ ├── logger.js
│ └── production.js
│
├── controllers/
│ ├── authController.js
│ ├── dashboardController.js
│ ├── reportTourController.js
│ ├── reportSalesController.js
│ ├── reportDocumentController.js
│ ├── targetController.js
│ └── userController.js
│
├── middleware/
│ ├── authMiddleware.js
│ ├── roleCheck.js
│ ├── errorHandler.js
│ └── log.js
│
├── public/
│ ├── css/
│ │ ├── style.css
│ │ └── sidebar.css
│ ├── js/
│ │ ├── sidebar.js
│ │ ├── theme.js
│ │ └── app.js
│ ├── sidebar.html
│ ├── dashboard.html
│ ├── login.html
│ ├── report_sales.html
│ ├── report_tour.html
│ ├── report_document.html
│ ├── user-management.html
│ ├── profile.html
│ └── target_management.html
│
├── routes/
│ ├── auth.js
│ ├── dashboard.js
│ ├── reportSales.js
│ ├── reportTour.js
│ ├── reportDocument.js
│ ├── targets.js
│ ├── users.js
│ └── profile.js
│
├── scripts/
│ ├── initDatabase.js
│ ├── setup-cron.js
│ └── check-db.js
│
├── server.js
├── Dockerfile
├── render.yaml
├── package.json
└── .env
