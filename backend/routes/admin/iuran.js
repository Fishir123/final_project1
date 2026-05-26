var express = require('express');
var router = express.Router();
var verifyToken = require('../../config/middleware/auth');
var authorizeRole = require('../../config/middleware/role');
var Model_Iuran = require('../../model/Model_Iuran');

router.use(verifyToken, authorizeRole('admin'));

function validateIuran(req, res, next) {
  const { nama_iuran, jumlah } = req.body;

  if (!nama_iuran || !jumlah) {
    return res.status(400).json({
      success: false,
      message: 'Nama iuran dan jumlah harus diisi',
    });
  }

  if (Number(jumlah) <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Jumlah harus lebih dari 0',
    });
  }

  next();
}

router.get('/', async function (req, res) {
  try {
    const data = await Model_Iuran.getAll();
    res.json({ success: true, message: 'Data iuran berhasil diambil', data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data iuran' });
  }
});

router.post('/', validateIuran, async function (req, res) {
  try {
    const data = await Model_Iuran.create(req.user.id, req.body);
    res.status(201).json({ success: true, message: 'Iuran berhasil ditambahkan', data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal menambahkan iuran', error: error.message });
  }
});

router.put('/:id', validateIuran, async function (req, res) {
  try {
    const existing = await Model_Iuran.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Data iuran tidak ditemukan' });
    }

    const data = await Model_Iuran.update(req.params.id, req.body);
    res.json({ success: true, message: 'Iuran berhasil diperbarui', data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui iuran', error: error.message });
  }
});

router.delete('/:id', async function (req, res) {
  try {
    const deleted = await Model_Iuran.remove(req.params.id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Data iuran tidak ditemukan' });
    }

    res.json({ success: true, message: 'Iuran berhasil dihapus' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal menghapus iuran', error: error.message });
  }
});

module.exports = router;
