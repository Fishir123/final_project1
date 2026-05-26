const db = require('../config/database');

async function getAll() {
  const [rows] = await db.query(
    `SELECT
       p.id,
       p.admin_id,
       p.kategori,
       p.keterangan,
       p.jumlah,
       p.tanggal,
       p.bukti,
       p.created_at,
       u.nama AS admin_nama
     FROM pengeluaran p
     LEFT JOIN users u ON u.id = p.admin_id
     ORDER BY p.tanggal DESC, p.created_at DESC`
  );

  return rows;
}

async function create(adminId, { kategori, keterangan = null, jumlah, tanggal, bukti = null }) {
  const [result] = await db.query(
    'INSERT INTO pengeluaran (admin_id, kategori, keterangan, jumlah, tanggal, bukti) VALUES (?, ?, ?, ?, ?, ?)',
    [adminId, kategori, keterangan, jumlah, tanggal, bukti]
  );

  return findById(result.insertId);
}

async function findById(id) {
  const [rows] = await db.query(
    `SELECT
       p.id,
       p.admin_id,
       p.kategori,
       p.keterangan,
       p.jumlah,
       p.tanggal,
       p.bukti,
       p.created_at,
       u.nama AS admin_nama
     FROM pengeluaran p
     LEFT JOIN users u ON u.id = p.admin_id
     WHERE p.id = ?
     LIMIT 1`,
    [id]
  );

  return rows[0] || null;
}

async function update(id, { kategori, keterangan = null, jumlah, tanggal, bukti = null }) {
  await db.query(
    'UPDATE pengeluaran SET kategori = ?, keterangan = ?, jumlah = ?, tanggal = ?, bukti = ? WHERE id = ?',
    [kategori, keterangan, jumlah, tanggal, bukti, id]
  );

  return findById(id);
}

async function remove(id) {
  const [result] = await db.query('DELETE FROM pengeluaran WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = {
  getAll,
  create,
  findById,
  update,
  remove,
};
