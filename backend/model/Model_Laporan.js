const db = require('../config/database');

function toNumber(value) {
  return Number(value || 0);
}

async function getRingkasanKeuangan() {
  const [[pemasukan]] = await db.query(
    'SELECT COALESCE(SUM(jumlah), 0) AS total_pemasukan FROM pemasukan'
  );

  const [[pengeluaran]] = await db.query(
    'SELECT COALESCE(SUM(jumlah), 0) AS total_pengeluaran FROM pengeluaran'
  );

  const totalPemasukan = toNumber(pemasukan.total_pemasukan);
  const totalPengeluaran = toNumber(pengeluaran.total_pengeluaran);

  return {
    total_pemasukan: totalPemasukan,
    total_pengeluaran: totalPengeluaran,
    saldo: totalPemasukan - totalPengeluaran,
  };
}

async function getLaporanKeuangan(limit = 10) {
  const [rows] = await db.query(
    `SELECT
       lk.id,
       lk.periode,
       lk.total_pemasukan,
       lk.total_pengeluaran,
       lk.saldo,
       lk.created_at,
       u.nama AS admin_nama
     FROM laporan_keuangan lk
     LEFT JOIN users u ON u.id = lk.admin_id
     ORDER BY lk.created_at DESC
     LIMIT ?`,
    [Number(limit)]
  );

  return rows;
}

async function getPemasukanTerbaru(limit = 5) {
  const [rows] = await db.query(
    `SELECT
       p.id,
       p.sumber,
       p.keterangan,
       p.jumlah,
       p.tanggal,
       p.created_at,
       u.nama AS admin_nama
     FROM pemasukan p
     LEFT JOIN users u ON u.id = p.admin_id
     ORDER BY p.tanggal DESC, p.created_at DESC
     LIMIT ?`,
    [Number(limit)]
  );

  return rows;
}

async function getPengeluaranTerbaru(limit = 5) {
  const [rows] = await db.query(
    `SELECT
       p.id,
       p.kategori,
       p.keterangan,
       p.jumlah,
       p.tanggal,
       p.bukti,
       p.created_at,
       u.nama AS admin_nama
     FROM pengeluaran p
     LEFT JOIN users u ON u.id = p.admin_id
     ORDER BY p.tanggal DESC, p.created_at DESC
     LIMIT ?`,
    [Number(limit)]
  );

  return rows;
}

async function getLaporanDashboard() {
  const [ringkasan, laporan, pemasukan_terbaru, pengeluaran_terbaru] = await Promise.all([
    getRingkasanKeuangan(),
    getLaporanKeuangan(10),
    getPemasukanTerbaru(5),
    getPengeluaranTerbaru(5),
  ]);

  return {
    ringkasan,
    laporan,
    pemasukan_terbaru,
    pengeluaran_terbaru,
  };
}

module.exports = {
  getRingkasanKeuangan,
  getLaporanKeuangan,
  getPemasukanTerbaru,
  getPengeluaranTerbaru,
  getLaporanDashboard,
};
