var express = require('express');
var router = express.Router();
var midtrans = require('../../config/midtrans');
var Model_Pembayaran = require('../../model/Model_Pembayaran');

router.post('/', async function (req, res) {
  const notification = req.body;

  try {
    if (!midtrans.verifySignature(notification)) {
      return res.status(403).json({ success: false, message: 'Signature Midtrans tidak valid' });
    }

    const status = midtrans.mapMidtransStatus(notification.transaction_status, notification.fraud_status);
    const pembayaran = await Model_Pembayaran.updateStatusByOrderId(notification.order_id, status, notification);

    if (!pembayaran) {
      return res.status(404).json({ success: false, message: 'Pembayaran tidak ditemukan' });
    }

    res.json({ success: true, message: 'Notifikasi Midtrans diproses', data: pembayaran });
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ success: false, message: error.message || 'Gagal memproses notifikasi Midtrans' });
  }
});

module.exports = router;
