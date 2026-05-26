var express = require('express');
var path = require('path');
var fs = require('fs');
var router = express.Router();
var verifyToken = require('../../config/middleware/auth');
var authorizeRole = require('../../config/middleware/role');
var { uploadBuktiPengeluaran } = require('../../config/middleware/upload');
var Model_Pengeluaran = require('../../model/Model_Pengeluaran');

router.use(verifyToken, authorizeRole('admin'));

function getBuktiPath(filename) {
  if (!filename) return null;
  return path.join(__dirname, '../../public/uploads/bukti-pengeluaran', filename);
}

function removeUploadedFile(filename) {
  const filePath = getBuktiPath(filename);
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

function buildPayload(req, existing = null) {
  return {
    kategori: req.body.kategori,
    jumlah: req.body.jumlah,
    tanggal: req.body.tanggal,
    keterangan: req.body.keterangan || null,
    bukti: req.file ? req.file.filename : existing?.bukti || null,
  };
}

function validatePengeluaran(req, res, next) {
  const { kategori, jumlah, tanggal } = req.body;

  if (!kategori || !jumlah || !tanggal) {
    if (req.file) removeUploadedFile(req.file.filename);
    return res.status(400).json({
      success: false,
      message: 'Kategori, jumlah, dan tanggal harus diisi',
    });
  }

  if (Number(jumlah) <= 0) {
    if (req.file) removeUploadedFile(req.file.filename);
    return res.status(400).json({
      success: false,
      message: 'Jumlah harus lebih dari 0',
    });
  }

  next();
}

function handleMulterError(error, req, res, next) {
  if (!error) return next();

  const message = error.code === 'LIMIT_FILE_SIZE'
    ? 'Ukuran file maksimal 1MB'
    : error.message || 'Gagal upload file';

  return res.status(400).json({
    success: false,
    message,
  });
}

router.get('/', async function (req, res) {
  try {
    const data = await Model_Pengeluaran.getAll();
    res.json({ success: true, message: 'Data pengeluaran berhasil diambil', data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data pengeluaran' });
  }
});

router.post('/', function (req, res, next) {
  uploadBuktiPengeluaran.single('bukti')(req, res, function (error) {
    handleMulterError(error, req, res, next);
  });
}, validatePengeluaran, async function (req, res) {
  try {
    const payload = buildPayload(req);
    const data = await Model_Pengeluaran.create(req.user.id, payload);
    res.status(201).json({ success: true, message: 'Pengeluaran berhasil ditambahkan', data });
  } catch (error) {
    if (req.file) removeUploadedFile(req.file.filename);
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal menambahkan pengeluaran' });
  }
});

router.put('/:id', function (req, res, next) {
  uploadBuktiPengeluaran.single('bukti')(req, res, function (error) {
    handleMulterError(error, req, res, next);
  });
}, validatePengeluaran, async function (req, res) {
  try {
    const existing = await Model_Pengeluaran.findById(req.params.id);

    if (!existing) {
      if (req.file) removeUploadedFile(req.file.filename);
      return res.status(404).json({ success: false, message: 'Data pengeluaran tidak ditemukan' });
    }

    const payload = buildPayload(req, existing);
    const data = await Model_Pengeluaran.update(req.params.id, payload);

    if (req.file && existing.bukti && existing.bukti !== req.file.filename) {
      removeUploadedFile(existing.bukti);
    }

    res.json({ success: true, message: 'Pengeluaran berhasil diperbarui', data });
  } catch (error) {
    if (req.file) removeUploadedFile(req.file.filename);
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui pengeluaran' });
  }
});

router.delete('/:id', async function (req, res) {
  try {
    const existing = await Model_Pengeluaran.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Data pengeluaran tidak ditemukan' });
    }

    const deleted = await Model_Pengeluaran.remove(req.params.id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Data pengeluaran tidak ditemukan' });
    }

    if (existing.bukti) removeUploadedFile(existing.bukti);

    res.json({ success: true, message: 'Pengeluaran berhasil dihapus' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal menghapus pengeluaran' });
  }
});

module.exports = router;
