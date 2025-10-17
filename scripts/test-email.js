// scripts/test-email.js
require('dotenv').config();
const nodemailer = require('nodemailer');

(async () => {
  try {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_TO } = process.env;

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      console.error('❌ Missing SMTP configuration in .env');
      process.exit(1);
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    });

    const info = await transporter.sendMail({
      from: `"Travel Dashboard" <${SMTP_USER}>`,
      to: SMTP_TO || SMTP_USER,
      subject: '✅ Test Email dari Travel Dashboard',
      text: 'Halo! Ini adalah email percobaan dari sistem Travel Dashboard.',
      html: '<h3>✅ Test Email Travel Dashboard</h3><p>Berhasil dikirim menggunakan Nodemailer.</p>'
    });

    console.log('✅ Email test sent:', info.messageId);
  } catch (err) {
    console.error('❌ Email test failed:', err.message);
  }
})();
