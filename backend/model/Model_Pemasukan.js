const db = require('../config/database');

async function getAll() {
  const [rows] = await db.query(
    `SELECT
       p.id,
       p.admin_id,
       p.sumber,
       p.keterangan,
       p.jumlah,
       p.tanggal,
       p.created_at,
       u.nama AS admin_nama
     FROM pemasukan p
     LEFT JOIN users u ON u.id = p.admin_id
     ORDER BY p.tanggal DESC, p.created_at DESC`
  );

  return rows;
}

async function create(adminId, { sumber, keterangan = null, jumlah, tanggal }) {
  const [result] = await db.query(
    'INSERT INTO pemasukan (admin_id, sumber, keterangan, jumlah, tanggal) VALUES (?, ?, ?, ?, ?)',
    [adminId, sumber, keterangan, jumlah, tanggal]
  );

  return findById(result.insertId);
}

async function findById(id) {
  const [rows] = await db.query(
    `SELECT
       p.id,
       p.admin_id,
       p.sumber,
       p.keterangan,
       p.jumlah,
       p.tanggal,
       p.created_at,
       u.nama AS admin_nama
     FROM pemasukan p
     LEFT JOIN users u ON u.id = p.admin_id
     WHERE p.id = ?
     LIMIT 1`,
    [id]
  );

  return rows[0] || null;
}

async function update(id, { sumber, keterangan = null, jumlah, tanggal }) {
  await db.query(
    'UPDATE pemasukan SET sumber = ?, keterangan = ?, jumlah = ?, tanggal = ? WHERE id = ?',
    [sumber, keterangan, jumlah, tanggal, id]
  );

  return findById(id);
}

async function remove(id) {
  const [result] = await db.query('DELETE FROM pemasukan WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = {
  getAll,
  create,
  findById,
  update,
  remove,
};
