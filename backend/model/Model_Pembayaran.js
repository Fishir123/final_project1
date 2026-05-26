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

function buildMidtransNote(data) {
  return JSON.stringify({
    metode: 'midtrans_qris',
    ...data,
  });
}

async function getPembayaranByUserId(userId) {
  const wargaId = await getWargaIdByUserId(userId);

  const [rows] = await db.query(
    `SELECT
       p.id,
       p.warga_id,
       p.iuran_id,
       p.jumlah_bayar,
       p.tanggal_bayar,
       p.status,
       p.bukti_transfer,
       p.catatan,
       p.created_at,
       i.nama_iuran,
       i.jumlah AS jumlah_iuran,
       i.keterangan AS keterangan_iuran
     FROM pembayaran p
     INNER JOIN iuran i ON i.id = p.iuran_id
     WHERE p.warga_id = ?
     ORDER BY p.created_at DESC`,
    [wargaId]
  );

  return rows;
}

async function findActivePayment(wargaId, iuranId) {
  const [rows] = await db.query(
    `SELECT
       p.id,
       p.warga_id,
       p.iuran_id,
       p.jumlah_bayar,
       p.tanggal_bayar,
       p.status,
       p.bukti_transfer,
       p.catatan,
       p.created_at,
       i.nama_iuran
     FROM pembayaran p
     INNER JOIN iuran i ON i.id = p.iuran_id
     WHERE p.warga_id = ?
       AND p.iuran_id = ?
       AND p.status IN ('pending', 'verifikasi', 'diterima')
     ORDER BY p.created_at DESC
     LIMIT 1`,
    [wargaId, iuranId]
  );

  return rows[0] || null;
}

async function createPendingQrisPayment(userId, iuran, orderId) {
  const wargaId = await getWargaIdByUserId(userId);
  const existingPayment = await findActivePayment(wargaId, iuran.id);

  if (existingPayment) {
    return {
      payment: existingPayment,
      reused: true,
    };
  }

  const today = new Date().toISOString().slice(0, 10);
  const note = buildMidtransNote({ order_id: orderId, payment_type: 'qris' });

  const [result] = await db.query(
    `INSERT INTO pembayaran
       (warga_id, iuran_id, jumlah_bayar, tanggal_bayar, status, bukti_transfer, catatan)
     VALUES (?, ?, ?, ?, 'pending', ?, ?)`,
    [wargaId, iuran.id, iuran.jumlah, today, orderId, note]
  );

  return {
    payment: await findById(result.insertId),
    reused: false,
  };
}

async function findById(id) {
  const [rows] = await db.query(
    `SELECT
       p.id,
       p.warga_id,
       p.iuran_id,
       p.jumlah_bayar,
       p.tanggal_bayar,
       p.status,
       p.bukti_transfer,
       p.catatan,
       p.created_at,
       i.nama_iuran
     FROM pembayaran p
     INNER JOIN iuran i ON i.id = p.iuran_id
     WHERE p.id = ?
     LIMIT 1`,
    [id]
  );

  return rows[0] || null;
}

async function findByOrderId(orderId) {
  const [rows] = await db.query(
    `SELECT
       p.*,
       i.nama_iuran
     FROM pembayaran p
     INNER JOIN iuran i ON i.id = p.iuran_id
     WHERE p.bukti_transfer = ? OR p.catatan LIKE ?
     ORDER BY p.id DESC
     LIMIT 1`,
    [orderId, `%${orderId}%`]
  );

  return rows[0] || null;
}

async function updateMidtransInfo(id, { snapToken, redirectUrl, orderId }) {
  const note = buildMidtransNote({
    order_id: orderId,
    payment_type: 'qris',
    snap_token: snapToken,
    redirect_url: redirectUrl,
  });

  await db.query(
    'UPDATE pembayaran SET bukti_transfer = ?, catatan = ? WHERE id = ?',
    [orderId, note, id]
  );

  return findById(id);
}

async function getAdminIdForPayment(connection, payment) {
  const [columns] = await connection.query('SHOW COLUMNS FROM iuran LIKE ?', ['admin_id']);

  if (columns.length > 0) {
    const [iuranRows] = await connection.query(
      'SELECT admin_id FROM iuran WHERE id = ? LIMIT 1',
      [payment.iuran_id]
    );

    if (iuranRows[0]?.admin_id) {
      return iuranRows[0].admin_id;
    }
  }

  if (process.env.DEFAULT_ADMIN_ID) {
    return Number(process.env.DEFAULT_ADMIN_ID);
  }

  const [adminRows] = await connection.query(
    "SELECT id FROM users WHERE role = 'admin' ORDER BY id ASC LIMIT 1"
  );

  return adminRows[0]?.id || null;
}

async function createPemasukanFromQrisIfNeeded(connection, payment, orderId, rawNotification = null) {
  const [existingRows] = await connection.query(
    'SELECT id FROM pemasukan WHERE keterangan LIKE ? LIMIT 1',
    [`%${orderId}%`]
  );

  if (existingRows[0]) {
    return existingRows[0].id;
  }

  const adminId = await getAdminIdForPayment(connection, payment);

  if (!adminId) {
    console.warn('Tidak ada admin pembuat iuran/default admin. Pemasukan QRIS tidak dibuat untuk order:', orderId);
    return null;
  }

  const tanggal = rawNotification?.settlement_time
    ? String(rawNotification.settlement_time).slice(0, 10)
    : new Date().toISOString().slice(0, 10);
  const sumber = `Pembayaran QRIS - ${payment.nama_iuran}`;
  const keterangan = `Pembayaran iuran via Midtrans QRIS. Order ID: ${orderId}. Pembayaran ID: ${payment.id}.`;

  const [result] = await connection.query(
    `INSERT INTO pemasukan (admin_id, sumber, keterangan, jumlah, tanggal)
     VALUES (?, ?, ?, ?, ?)`,
    [adminId, sumber, keterangan, payment.jumlah_bayar, tanggal]
  );

  return result.insertId;
}

async function updateStatusByOrderId(orderId, status, rawNotification = null) {
  const payment = await findByOrderId(orderId);

  if (!payment) return null;

  let parsedNote = {};

  try {
    parsedNote = JSON.parse(payment.catatan || '{}');
  } catch {
    parsedNote = {};
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    let pemasukanId = parsedNote.pemasukan_id || null;

    if (status === 'diterima') {
      pemasukanId = await createPemasukanFromQrisIfNeeded(connection, payment, orderId, rawNotification);
    }

    const note = JSON.stringify({
      metode: 'midtrans_qris',
      ...parsedNote,
      order_id: orderId,
      midtrans_status: status,
      pemasukan_id: pemasukanId,
      notification: rawNotification,
      updated_from_midtrans_at: new Date().toISOString(),
    });

    await connection.query(
      'UPDATE pembayaran SET status = ?, catatan = ? WHERE id = ?',
      [status, note, payment.id]
    );

    await connection.commit();
    return findById(payment.id);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  getWargaIdByUserId,
  getPembayaranByUserId,
  findActivePayment,
  createPendingQrisPayment,
  findById,
  findByOrderId,
  updateMidtransInfo,
  updateStatusByOrderId,
};
