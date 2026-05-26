function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatTanggal(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}

function statusText(status) {
  const labels = {
    pending: 'Pending',
    verifikasi: 'Verifikasi',
    ditolak: 'Ditolak',
    diterima: 'Diterima',
  };

  return labels[status] || status;
}

function IuranQris({
  iuran,
  pembayaran,
  loading,
  error,
  onBayarQris,
  onRefresh,
  onSyncPayment,
}) {
  return (
    <div className="iuran-section">
      <div className="section-header">
        <h3>Bayar Iuran QRIS</h3>
        <button className="button small" onClick={onRefresh} disabled={loading}>
          {loading ? 'Memuat...' : 'Refresh'}
        </button>
      </div>

      {error && <div className="alert error">{error}</div>}

      <div className="iuran-grid">
        <div className="report-card">
          <h4>Daftar Iuran</h4>
          {loading && iuran.length === 0 ? (
            <p className="empty-state">Memuat data iuran...</p>
          ) : iuran.length === 0 ? (
            <p className="empty-state">Belum ada data iuran.</p>
          ) : (
            <div className="iuran-list">
              {iuran.map((item) => (
                <div className="iuran-item" key={item.id}>
                  <div>
                    <strong>{item.nama_iuran}</strong>
                    {item.keterangan && <p>{item.keterangan}</p>}
                    <b>{formatRupiah(item.jumlah)}</b>
                  </div>
                  <button className="button small" onClick={() => onBayarQris(item.id)} disabled={loading}>
                    Bayar QRIS
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="report-card">
          <h4>Riwayat Pembayaran</h4>
          {loading && pembayaran.length === 0 ? (
            <p className="empty-state">Memuat pembayaran...</p>
          ) : pembayaran.length === 0 ? (
            <p className="empty-state">Belum ada riwayat pembayaran.</p>
          ) : (
            <div className="payment-list">
              {pembayaran.map((item) => (
                <div className="payment-item" key={item.id}>
                  <div className="suggestion-title-row">
                    <strong>{item.nama_iuran}</strong>
                    <span className={`status-badge ${item.status}`}>{statusText(item.status)}</span>
                  </div>
                  <p>{formatRupiah(item.jumlah_bayar)} • {formatTanggal(item.tanggal_bayar)}</p>
                  {item.bukti_transfer && <small>Order ID: {item.bukti_transfer}</small>}
                  {item.status === 'pending' && item.bukti_transfer && (
                    <button className="mini-button" type="button" onClick={() => onSyncPayment(item.bukti_transfer)}>
                      Cek Status
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default IuranQris;
