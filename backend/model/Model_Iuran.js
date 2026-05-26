const db = require('../config/database');

let adminIdColumnChecked = false;
let hasAdminIdColumn = false;

async function ensureAdminIdColumn() {
  if (adminIdColumnChecked) return hasAdminIdColumn;

  const [columns] = await db.query('SHOW COLUMNS FROM iuran LIKE ?', ['admin_id']);
  hasAdminIdColumn = columns.length > 0;
  adminIdColumnChecked = true;

  return hasAdminIdColumn;
}

async function addAdminIdColumnIfMissing() {
  const hasColumn = await ensureAdminIdColumn();
  if (hasColumn) return true;

  await db.query('ALTER TABLE iuran ADD COLUMN admin_id INT(11) NULL AFTER id');
  hasAdminIdColumn = true;
  adminIdColumnChecked = true;
  return true;
}

async function getAll() {
  const hasColumn = await ensureAdminIdColumn();

  if (!hasColumn) {
    const [rows] = await db.query(
      `SELECT
         i.id,
         NULL AS admin_id,
         i.nama_iuran,
         i.jumlah,
         i.keterangan,
         i.created_at,
         NULL AS admin_nama
       FROM iuran i
       ORDER BY i.created_at DESC, i.id DESC`
    );

    return rows;
  }

  const [rows] = await db.query(
    `SELECT
       i.id,
       i.admin_id,
       i.nama_iuran,
       i.jumlah,
       i.keterangan,
       i.created_at,
       u.nama AS admin_nama
     FROM iuran i
     LEFT JOIN users u ON u.id = i.admin_id
     ORDER BY i.created_at DESC, i.id DESC`
  );

  return rows;
}

async function findById(id) {
  const hasColumn = await ensureAdminIdColumn();

  if (!hasColumn) {
    const [rows] = await db.query(
      `SELECT
         i.id,
         NULL AS admin_id,
         i.nama_iuran,
         i.jumlah,
         i.keterangan,
         i.created_at,
         NULL AS admin_nama
       FROM iuran i
       WHERE i.id = ?
       LIMIT 1`,
      [id]
    );

    return rows[0] || null;
  }

  const [rows] = await db.query(
    `SELECT
       i.id,
       i.admin_id,
       i.nama_iuran,
       i.jumlah,
       i.keterangan,
       i.created_at,
       u.nama AS admin_nama
     FROM iuran i
     LEFT JOIN users u ON u.id = i.admin_id
     WHERE i.id = ?
     LIMIT 1`,
    [id]
  );

  return rows[0] || null;
}

async function create(adminId, { nama_iuran, jumlah, keterangan = null }) {
  await addAdminIdColumnIfMissing();

  const [result] = await db.query(
    'INSERT INTO iuran (admin_id, nama_iuran, jumlah, keterangan) VALUES (?, ?, ?, ?)',
    [adminId, nama_iuran, jumlah, keterangan]
  );

  return findById(result.insertId);
}

async function update(id, { nama_iuran, jumlah, keterangan = null }) {
  await db.query(
    'UPDATE iuran SET nama_iuran = ?, jumlah = ?, keterangan = ? WHERE id = ?',
    [nama_iuran, jumlah, keterangan, id]
  );

  return findById(id);
}

async function remove(id) {
  const [result] = await db.query('DELETE FROM iuran WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = {
  getAll,
  findById,
  create,
  update,
  remove,
};
