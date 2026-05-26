var express = require('express');
var router = express.Router();
var verifyToken = require('../../config/middleware/auth');
var authorizeRole = require('../../config/middleware/role');
var Model_Iuran = require('../../model/Model_Iuran');
var Model_Pembayaran = require('../../model/Model_Pembayaran');
var midtrans = require('../../config/midtrans');

router.get('/', verifyToken, authorizeRole('warga'), async function (req, res) {
  try {
    const data = await Model_Iuran.getAll();
    res.json({ success: true, message: 'Data iuran berhasil diambil', data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data iuran' });
  }
});

router.get('/pembayaran', verifyToken, authorizeRole('warga'), async function (req, res) {
  try {
    const data = await Model_Pembayaran.getPembayaranByUserId(req.user.id);
    res.json({ success: true, message: 'Data pembayaran berhasil diambil', data });
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ success: false, message: error.message || 'Gagal mengambil pembayaran' });
  }
});

router.post('/:id/bayar-qris', verifyToken, authorizeRole('warga'), async function (req, res) {
  try {
    const iuran = await Model_Iuran.findById(req.params.id);

    if (!iuran) {
      return res.status(404).json({ success: false, message: 'Data iuran tidak ditemukan' });
    }

    const orderId = `JD-${Date.now()}-${req.user.id}-${iuran.id}`;
    const amount = Math.round(Number(iuran.jumlah));
    const paymentResult = await Model_Pembayaran.createPendingQrisPayment(req.user.id, iuran, orderId);

    if (paymentResult.reused) {
      let savedSnap = null;

      try {
        savedSnap = JSON.parse(paymentResult.payment.catatan || '{}');
      } catch {
        savedSnap = null;
      }

      return res.status(200).json({
        success: true,
        message: paymentResult.payment.status === 'diterima'
          ? 'Iuran ini sudah dibayar'
          : 'Masih ada pembayaran yang belum selesai untuk iuran ini',
        data: {
          pembayaran: paymentResult.payment,
          order_id: savedSnap?.order_id || paymentResult.payment.bukti_transfer,
          snap_token: savedSnap?.snap_token || null,
          redirect_url: savedSnap?.redirect_url || null,
          reused: true,
        },
      });
    }

    const payment = paymentResult.payment;

    const snap = await midtrans.createSnapTransaction({
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      item_details: [
        {
          id: String(iuran.id),
          price: amount,
          quantity: 1,
          name: iuran.nama_iuran,
        },
      ],
      customer_details: {
        first_name: req.user.nama || req.user.email,
        email: req.user.email,
      }
    });

    const updatedPayment = await Model_Pembayaran.updateMidtransInfo(payment.id, {
      snapToken: snap.token,
      redirectUrl: snap.redirect_url,
      orderId,
    });

    res.status(201).json({
      success: true,
      message: 'Transaksi QRIS berhasil dibuat',
      data: {
        pembayaran: updatedPayment,
        order_id: orderId,
        snap_token: snap.token,
        redirect_url: snap.redirect_url,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Gagal membuat pembayaran QRIS',
    });
  }
});

router.post('/pembayaran/:orderId/sync', verifyToken, authorizeRole('warga'), async function (req, res) {
  try {
    const statusResponse = await midtrans.getTransactionStatus(req.params.orderId);
    const status = midtrans.mapMidtransStatus(statusResponse.transaction_status, statusResponse.fraud_status);
    const pembayaran = await Model_Pembayaran.updateStatusByOrderId(req.params.orderId, status, statusResponse);

    if (!pembayaran) {
      return res.status(404).json({ success: false, message: 'Pembayaran tidak ditemukan' });
    }

    res.json({ success: true, message: 'Status pembayaran berhasil diperbarui', data: pembayaran });
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ success: false, message: error.message || 'Gagal sinkron status pembayaran' });
  }
});

module.exports = router;
