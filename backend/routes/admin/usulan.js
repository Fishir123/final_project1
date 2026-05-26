var express = require('express');
var router = express.Router();
var verifyToken = require('../../config/middleware/auth');
var authorizeRole = require('../../config/middleware/role');
var Model_Usulan = require('../../model/Model_Usulan');

router.use(verifyToken, authorizeRole('admin'));

router.get('/', async function (req, res) {
  try {
    const data = await Model_Usulan.getAllUsulan();
    res.json({ success: true, message: 'Data usulan warga berhasil diambil', data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data usulan warga' });
  }
});

router.put('/:id/status', async function (req, res) {
  const { status, tanggapan_admin } = req.body;
  const allowedStatuses = ['pending', 'diproses', 'diterima', 'ditolak'];

  if (!status || !allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Status tidak valid',
    });
  }

  try {
    const existing = await Model_Usulan.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Data usulan tidak ditemukan' });
    }

    const data = await Model_Usulan.updateStatus(req.params.id, {
      status,
      tanggapan_admin: tanggapan_admin || null,
    });

    res.json({ success: true, message: 'Status usulan berhasil diperbarui', data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui status usulan', error: error.message });
  }
});

module.exports = router;
