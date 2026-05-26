function formatTanggal(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}

function statusLabel(status) {
  const labels = {
    pending: 'Pending',
    diproses: 'Diproses',
    diterima: 'Diterima',
    ditolak: 'Ditolak',
  };

  return labels[status] || status;
}

function UsulanKebutuhan({ form, usulan, loading, error, onChange, onSubmit, onRefresh }) {
  return (
    <div className="suggestion-section">
      <div className="section-header">
        <h3>Usulan Kebutuhan Desa</h3>
        <button className="button small" onClick={onRefresh} disabled={loading}>
          {loading ? 'Memuat...' : 'Refresh'}
        </button>
      </div>

      {error && <div className="alert error">{error}</div>}

      <div className="suggestion-grid">
        <div className="report-card">
          <h4>Kirim Usulan Baru</h4>
          <form className="form" onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="judul-usulan">Judul Usulan</label>
              <input
                id="judul-usulan"
                name="judul"
                placeholder="Contoh: Perbaikan jalan gang"
                value={form.judul}
                onChange={onChange}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="deskripsi-usulan">Deskripsi</label>
              <textarea
                id="deskripsi-usulan"
                name="deskripsi"
                placeholder="Jelaskan kebutuhan atau usulan warga secara detail"
                value={form.deskripsi}
                onChange={onChange}
                required
              />
            </div>

            <button className="button" type="submit" disabled={loading}>
              {loading ? 'Mengirim...' : 'Kirim Usulan'}
            </button>
          </form>
        </div>

        <div className="report-card">
          <h4>Riwayat Usulan Saya</h4>
          {loading && usulan.length === 0 ? (
            <p className="empty-state">Memuat usulan...</p>
          ) : usulan.length === 0 ? (
            <p className="empty-state">Belum ada usulan yang dikirim.</p>
          ) : (
            <div className="suggestion-list">
              {usulan.map((item) => (
                <div className="suggestion-item" key={item.id}>
                  <div className="suggestion-title-row">
                    <strong>{item.judul}</strong>
                    <span className={`status-badge ${item.status}`}>{statusLabel(item.status)}</span>
                  </div>
                  <p>{item.deskripsi}</p>
                  <small>Dikirim: {formatTanggal(item.created_at)}</small>
                  {item.tanggapan_admin && (
                    <div className="admin-response">
                      <b>Tanggapan admin:</b>
                      <p>{item.tanggapan_admin}</p>
                    </div>
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

export default UsulanKebutuhan;
