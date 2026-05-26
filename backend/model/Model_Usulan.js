const db = require('../config/database');

async function getWargaIdByUserId(userId) {
  const [rows] = await db.query(
    'SELECT id FROM warga WHERE user_id = ? LIMIT 1',
    [userId]
  );

  if (!rows[0]) {
    const error = new Error('Data warga tidak ditemukan untuk user ini');
    error.status = 404;
    throw error;
  }

  return rows[0].id;
}

async function getUsulanByUserId(userId) {
  const [rows] = await db.query(
    `SELECT
       u.id,
       u.judul,
       u.deskripsi,
       u.status,
       u.tanggapan_admin,
       u.created_at,
       u.updated_at
     FROM usulan u
     INNER JOIN warga w ON w.id = u.warga_id
     WHERE w.user_id = ?
     ORDER BY u.created_at DESC`,
    [userId]
  );

  return rows;
}

async function getAllUsulan() {
  const [rows] = await db.query(
    `SELECT
       u.id,
       u.warga_id,
       u.judul,
       u.deskripsi,
       u.status,
       u.tanggapan_admin,
       u.created_at,
       u.updated_at,
       w.nik,
       w.alamat,
       w.rt_rw,
       users.nama AS warga_nama,
       users.email AS warga_email,
       users.no_hp AS warga_no_hp
     FROM usulan u
     INNER JOIN warga w ON w.id = u.warga_id
     INNER JOIN users ON users.id = w.user_id
     ORDER BY
       CASE u.status
         WHEN 'pending' THEN 1
         WHEN 'diproses' THEN 2
         WHEN 'diterima' THEN 3
         WHEN 'ditolak' THEN 4
         ELSE 5
       END,
       u.created_at DESC`
  );

  return rows;
}

async function findById(id) {
  const [rows] = await db.query(
    `SELECT
       u.id,
       u.warga_id,
       u.judul,
       u.deskripsi,
       u.status,
       u.tanggapan_admin,
       u.created_at,
       u.updated_at,
       w.nik,
       w.alamat,
       w.rt_rw,
       users.nama AS warga_nama,
       users.email AS warga_email,
       users.no_hp AS warga_no_hp
     FROM usulan u
     INNER JOIN warga w ON w.id = u.warga_id
     INNER JOIN users ON users.id = w.user_id
     WHERE u.id = ?
     LIMIT 1`,
    [id]
  );

  return rows[0] || null;
}

async function updateStatus(id, { status, tanggapan_admin = null }) {
  await db.query(
    'UPDATE usulan SET status = ?, tanggapan_admin = ? WHERE id = ?',
    [status, tanggapan_admin, id]
  );

  return findById(id);
}

async function createUsulan(userId, { judul, deskripsi }) {
  const wargaId = await getWargaIdByUserId(userId);

  const [result] = await db.query(
    'INSERT INTO usulan (warga_id, judul, deskripsi) VALUES (?, ?, ?)',
    [wargaId, judul, deskripsi]
  );

  const [rows] = await db.query(
    `SELECT
       id,
       judul,
       deskripsi,
       status,
       tanggapan_admin,
       created_at,
       updated_at
     FROM usulan
     WHERE id = ?
     LIMIT 1`,
    [result.insertId]
  );

  return rows[0];
}

module.exports = {
  getUsulanByUserId,
  getAllUsulan,
  findById,
  updateStatus,
  createUsulan,
};
