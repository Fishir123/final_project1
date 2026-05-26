var express = require('express');
var router = express.Router();
var verifyToken = require('../../config/middleware/auth');
var authorizeRole = require('../../config/middleware/role');
var Model_Laporan = require('../../model/Model_Laporan');

router.get('/', verifyToken, authorizeRole('warga'), async function (req, res) {
  try {
    const data = await Model_Laporan.getLaporanDashboard();

    res.json({
      success: true,
      message: 'Laporan warga berhasil diambil',
      data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil laporan warga',
      error: error.message,
    });
  }
});

module.exports = router;
