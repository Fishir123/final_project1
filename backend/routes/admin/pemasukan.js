var express = require('express');
var router = express.Router();
var verifyToken = require('../../config/middleware/auth');
var authorizeRole = require('../../config/middleware/role');
var Model_Pemasukan = require('../../model/Model_Pemasukan');

router.use(verifyToken, authorizeRole('admin'));

function validatePemasukan(req, res, next) {
  const { sumber, jumlah, tanggal } = req.body;

  if (!sumber || !jumlah || !tanggal) {
    return res.status(400).json({
      success: false,
      message: 'Sumber, jumlah, dan tanggal harus diisi',
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
    const data = await Model_Pemasukan.getAll();
    res.json({ success: true, message: 'Data pemasukan berhasil diambil', data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data pemasukan' });
  }
});

router.post('/', validatePemasukan, async function (req, res) {
  try {
    const data = await Model_Pemasukan.create(req.user.id, req.body);
    res.status(201).json({ success: true, message: 'Pemasukan berhasil ditambahkan', data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal menambahkan pemasukan' });
  }
});

router.put('/:id', validatePemasukan, async function (req, res) {
  try {
    const existing = await Model_Pemasukan.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Data pemasukan tidak ditemukan' });
    }

    const data = await Model_Pemasukan.update(req.params.id, req.body);
    res.json({ success: true, message: 'Pemasukan berhasil diperbarui', data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui pemasukan' });
  }
});

router.delete('/:id', async function (req, res) {
  try {
    const deleted = await Model_Pemasukan.remove(req.params.id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Data pemasukan tidak ditemukan' });
    }

    res.json({ success: true, message: 'Pemasukan berhasil dihapus' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal menghapus pemasukan' });
  }
});

module.exports = router;
