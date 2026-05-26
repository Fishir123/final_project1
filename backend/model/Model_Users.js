const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const USER_COLUMNS = `
  u.id,
  u.nama,
  u.email,
  u.password,
  u.no_hp,
  u.role,
  u.created_at,
  w.id AS warga_id,
  w.nik,
  w.alamat,
  w.rt_rw,
  w.status_warga
`;

function toUser(row, includePassword = false) {
  if (!row) return null;

  const user = {
    id: row.id,
    nama: row.nama,
    email: row.email,
    no_hp: row.no_hp,
    role: row.role,
    created_at: row.created_at,
    warga: row.warga_id
      ? {
          id: row.warga_id,
          nik: row.nik,
          alamat: row.alamat,
          rt_rw: row.rt_rw,
          status_warga: row.status_warga,
        }
      : null,
  };

  if (includePassword) user.password = row.password;

  return user;
}

async function findByEmail(email, includePassword = false) {
  const [rows] = await db.query(
    `SELECT ${USER_COLUMNS}
     FROM users u
     LEFT JOIN warga w ON w.user_id = u.id
     WHERE u.email = ?
     LIMIT 1`,
    [email]
  );

  return toUser(rows[0], includePassword);
}

async function findById(id) {
  const [rows] = await db.query(
    `SELECT ${USER_COLUMNS}
     FROM users u
     LEFT JOIN warga w ON w.user_id = u.id
     WHERE u.id = ?
     LIMIT 1`,
    [id]
  );

  return toUser(rows[0]);
}

async function createUser({ nama, email, password, no_hp = null, role = 'warga', nik = null, alamat = null, rt_rw = null }) {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      'INSERT INTO users (nama, email, password, no_hp, role) VALUES (?, ?, ?, ?, ?)',
      [nama, email, password, no_hp, role]
    );

    const userId = result.insertId;

    if (role === 'warga') {
      await connection.query(
        'INSERT INTO warga (user_id, nik, alamat, rt_rw) VALUES (?, ?, ?, ?)',
        [userId, nik, alamat, rt_rw]
      );
    }

    await connection.commit();
    return findById(userId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function getByemail(email) {
  return findByEmail(email);
}

async function register(data) {
  const hashedPassword = await bcrypt.hash(data.password, 10);

  return createUser({
    nama: data.nama,
    email: data.email,
    password: hashedPassword,
    no_hp: data.no_hp || null,
    role: data.role || 'warga',
    nik: data.nik || null,
    alamat: data.alamat || null,
    rt_rw: data.rt_rw || null,
  });
}

async function login(email, password) {
  const user = await findByEmail(email, true);

  if (!user) {
    const error = new Error('email atau password salah');
    error.status = 401;
    throw error;
  }

  const passwordValid = await bcrypt.compare(password, user.password);

  if (!passwordValid) {
    const error = new Error('email atau password salah');
    error.status = 401;
    throw error;
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET || 'ganti_secret_ini',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  delete user.password;

  return {
    message: 'Login berhasil',
    user: user,
    token: token,
  };
}

module.exports = {
  createUser,
  findByEmail,
  findById,
  getByemail,
  register,
  login,
};
