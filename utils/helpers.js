/**
 * ==========================================================
 * 📁 utils/helpers.js (ESM version)
 * Travel Dashboard Enterprise v5.0
 * ==========================================================
 * Kumpulan fungsi helper global:
 * - Format tanggal
 * - Format Rupiah
 * - Validasi data
 * - Konversi bulan ke nama
 * ==========================================================
 */

/**
 * 🗓️ Format tanggal ke bentuk Indonesia (DD/MM/YYYY)
 */
export const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date)) return "-";
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

/**
 * 💰 Format angka ke Rupiah (Rp)
 */
export const formatRupiah = (number) => {
  if (isNaN(number) || number === null) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
};

/**
 * ✅ Cek apakah suatu nilai kosong/null/undefined
 */
export const isEmpty = (value) => {
  return (
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "") ||
    (Array.isArray(value) && value.length === 0)
  );
};

/**
 * 🗓️ Konversi angka bulan (1-12) ke nama bulan
 */
export const getMonthName = (monthNumber) => {
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  return months[monthNumber - 1] || "-";
};

/**
 * 📊 Format persentase (2 digit desimal)
 */
export const formatPercent = (value, total) => {
  if (!total || total === 0) return "0%";
  const percentage = (value / total) * 100;
  return `${percentage.toFixed(2)}%`;
};