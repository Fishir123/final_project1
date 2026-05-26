import { useEffect, useMemo, useState } from 'react';

const ITEMS_PER_PAGE = 3;

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

function UsulanVerifikasi({ data, loading, error, statusForm, onChangeStatus, onSubmitStatus, onRefresh }) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(data.length / ITEMS_PER_PAGE));

  useEffect(() => {
    setCurrentPage(1);
  }, [data.length]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return data.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, data]);

  const startItem = data.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, data.length);

  return (
    <div className="suggestion-section">
      <div className="section-header">
        <h3>Verifikasi Usulan Warga</h3>
        <button className="button small" type="button" onClick={onRefresh} disabled={loading}>
          {loading ? 'Memuat...' : 'Refresh'}
        </button>
      </div>

      {error && <div className="alert error">{error}</div>}

      <div className="report-card">
        {loading && data.length === 0 ? (
          <p className="empty-state">Memuat usulan warga...</p>
        ) : data.length === 0 ? (
          <p className="empty-state">Belum ada usulan warga.</p>
        ) : (
          <>
            <div className="suggestion-list admin-suggestion-list paginated-list">
              {paginatedData.map((item) => (
              <div className="suggestion-item" key={item.id}>
                <div className="suggestion-title-row">
                  <div>
                    <strong>{item.judul}</strong>
                    <small className="table-note">
                      {item.warga_nama || 'Warga'} • {item.rt_rw || '-'} • {formatTanggal(item.created_at)}
                    </small>
                  </div>
                  <span className={`status-badge ${item.status}`}>{statusLabel(item.status)}</span>
                </div>

                <p>{item.deskripsi}</p>

                <div className="profile-grid suggestion-meta">
                  <span>Email</span>
                  <strong>{item.warga_email || '-'}</strong>
                  <span>No HP</span>
                  <strong>{item.warga_no_hp || '-'}</strong>
                  <span>Alamat</span>
                  <strong>{item.alamat || '-'}</strong>
                </div>

                {item.tanggapan_admin && (
                  <div className="admin-response">
                    <b>Tanggapan admin saat ini:</b>
                    <p>{item.tanggapan_admin}</p>
                  </div>
                )}

                <form className="form admin-verification-form" onSubmit={(event) => onSubmitStatus(event, item.id)}>
                  <div className="field two-columns">
                    <div>
                      <label htmlFor={`status-${item.id}`}>Status</label>
                      <select
                        id={`status-${item.id}`}
                        name="status"
                        value={statusForm[item.id]?.status ?? item.status}
                        onChange={(event) => onChangeStatus(item.id, event)}
                      >
                        <option value="pending">Pending</option>
                        <option value="diproses">Diproses</option>
                        <option value="diterima">Diterima</option>
                        <option value="ditolak">Ditolak</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor={`tanggapan-${item.id}`}>Tanggapan Admin</label>
                      <input
                        id={`tanggapan-${item.id}`}
                        name="tanggapan_admin"
                        placeholder="Contoh: Usulan diterima dan akan ditindaklanjuti"
                        value={statusForm[item.id]?.tanggapan_admin ?? item.tanggapan_admin ?? ''}
                        onChange={(event) => onChangeStatus(item.id, event)}
                      />
                    </div>
                  </div>

                  <div className="action-row">
                    <button className="button small" type="submit" disabled={loading}>
                      Simpan Verifikasi
                    </button>
                  </div>
                </form>
              </div>
              ))}
            </div>

            {data.length > ITEMS_PER_PAGE && (
              <div className="pagination">
                <p className="pagination-info">
                  Menampilkan {startItem}-{endItem} dari {data.length} usulan
                </p>
                <div className="pagination-actions">
                  <button
                    className="mini-button"
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={currentPage === 1 || loading}
                  >
                    Sebelumnya
                  </button>

                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                    <button
                      key={page}
                      className={`mini-button page-button${page === currentPage ? ' active' : ''}`}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      disabled={loading}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    className="mini-button"
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                    disabled={currentPage === totalPages || loading}
                  >
                    Berikutnya
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default UsulanVerifikasi;
