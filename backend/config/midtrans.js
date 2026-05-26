const crypto = require('crypto');

function getMidtransConfig() {
  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';

  return {
    isProduction,
    serverKey: process.env.MIDTRANS_SERVER_KEY || '',
    clientKey: process.env.MIDTRANS_CLIENT_KEY || '',
    snapBaseUrl: isProduction
      ? 'https://app.midtrans.com/snap/v1/transactions'
      : 'https://app.sandbox.midtrans.com/snap/v1/transactions',
    apiBaseUrl: isProduction
      ? 'https://api.midtrans.com/v2'
      : 'https://api.sandbox.midtrans.com/v2',
  };
}

function ensureMidtransConfigured() {
  const config = getMidtransConfig();

  if (!config.serverKey) {
    const error = new Error('MIDTRANS_SERVER_KEY belum diisi di backend .env');
    error.status = 500;
    throw error;
  }

  return config;
}

function getAuthHeader(serverKey) {
  return `Basic ${Buffer.from(`${serverKey}:`).toString('base64')}`;
}

async function createSnapTransaction(payload) {
  const config = ensureMidtransConfigured();

  const response = await fetch(config.snapBaseUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: getAuthHeader(config.serverKey),
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    const message = data?.error_messages?.join(', ') || data?.message || 'Gagal membuat transaksi Midtrans';
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return data;
}

async function getTransactionStatus(orderId) {
  const config = ensureMidtransConfigured();

  const response = await fetch(`${config.apiBaseUrl}/${orderId}/status`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: getAuthHeader(config.serverKey),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    const message = data?.status_message || data?.message || 'Gagal mengecek status transaksi Midtrans';
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return data;
}

function verifySignature(notification) {
  const config = ensureMidtransConfigured();
  const raw = `${notification.order_id}${notification.status_code}${notification.gross_amount}${config.serverKey}`;
  const signature = crypto.createHash('sha512').update(raw).digest('hex');

  return signature === notification.signature_key;
}

function mapMidtransStatus(transactionStatus, fraudStatus) {
  if (transactionStatus === 'capture') {
    return fraudStatus === 'challenge' ? 'verifikasi' : 'diterima';
  }

  if (transactionStatus === 'settlement') return 'diterima';
  if (transactionStatus === 'pending') return 'pending';
  if (['deny', 'cancel', 'expire', 'failure'].includes(transactionStatus)) return 'ditolak';

  return 'verifikasi';
}

module.exports = {
  createSnapTransaction,
  getTransactionStatus,
  verifySignature,
  mapMidtransStatus,
};
