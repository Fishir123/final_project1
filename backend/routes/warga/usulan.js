var express = require('express');
var router = express.Router();
var verifyToken = require('../../config/middleware/auth');
var authorizeRole = require('../../config/middleware/role');
var Model_Usulan = require('../../model/Model_Usulan');

router.get('/', verifyToken, authorizeRole('warga'), async function (req, res) {
  try {
    const data = await Model_Usulan.getUsulanByUserId(req.user.id);

    res.json({
      success: true,
      message: 'Data usulan berhasil diambil',
      data,
    });
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Gagal mengambil data usulan',
    });
  }
});

router.post('/', verifyToken, authorizeRole('warga'), async function (req, res) {
  const { judul, deskripsi } = req.body;

  if (!judul || !deskripsi) {
    return res.status(400).json({
      success: false,
      message: 'Judul dan deskripsi harus diisi',
    });
  }

  try {
    const data = await Model_Usulan.createUsulan(req.user.id, { judul, deskripsi });

    res.status(201).json({
      success: true,
      message: 'Usulan berhasil dikirim',
      data,
    });
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Gagal mengirim usulan',
    });
  }
});

module.exports = router;
