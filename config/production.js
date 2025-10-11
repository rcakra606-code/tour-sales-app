// ===============================
// ✅ Production Configuration
// ===============================

module.exports = {
  cors: {
    origin: [
      'http://localhost:3000', // untuk local dev
      'https://tour-sales-app.onrender.com', // ganti dengan domain Render kamu
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  },

  backup: {
    enabled: false, // ubah ke true kalau kamu punya cron
    schedule: '0 3 * * *', // setiap jam 3 pagi
  },
};
