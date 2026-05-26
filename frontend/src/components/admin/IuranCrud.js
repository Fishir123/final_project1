function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function IuranCrud({
  data,
  form,
  editingId,
  loading,
  error,
  onChange,
  onSubmit,
  onEdit,
  onCancelEdit,
  onDelete,
}) {
  return (
    <div className="crud-section">
      <div className="section-header compact">
        <h3>Iuran</h3>
      </div>

      {error && <div className="alert error">{error}</div>}

      <div className="crud-grid">
        <div className="report-card">
          <h4>{editingId ? 'Edit Iuran' : 'Tambah Iuran'}</h4>
          <form className="form" onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="nama_iuran">Nama Iuran</label>
              <input
                id="nama_iuran"
                name="nama_iuran"
                placeholder="Contoh: Iuran Bulanan Juni"
                value={form.nama_iuran || ''}
                onChange={onChange}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="jumlah_iuran">Jumlah</label>
              <input
                id="jumlah_iuran"
                name="jumlah"
                type="number"
                min="1"
                placeholder="10000"
                value={form.jumlah || ''}
                onChange={onChange}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="keterangan_iuran">Keterangan</label>
              <textarea
                id="keterangan_iuran"
                name="keterangan"
                placeholder="Keterangan iuran"
                value={form.keterangan || ''}
                onChange={onChange}
              />
            </div>

            <div className="action-row">
              <button className="button" type="submit" disabled={loading}>
                {loading ? 'Menyimpan...' : editingId ? 'Update' : 'Simpan'}
              </button>
              {editingId && (
                <button className="button secondary" type="button" onClick={onCancelEdit}>
                  Batal
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="report-card">
          <h4>Data Iuran</h4>
          {loading && data.length === 0 ? (
            <p className="empty-state">Memuat data iuran...</p>
          ) : data.length === 0 ? (
            <p className="empty-state">Belum ada data iuran.</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Nama Iuran</th>
                    <th>Jumlah</th>
                    <th>Admin</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.nama_iuran}</strong>
                        {item.keterangan && <small className="table-note">{item.keterangan}</small>}
                      </td>
                      <td>{formatRupiah(item.jumlah)}</td>
                      <td>{item.admin_nama || '-'}</td>
                      <td>
                        <div className="table-actions">
                          <button className="mini-button" type="button" onClick={() => onEdit(item)}>
                            Edit
                          </button>
                          <button className="mini-button danger" type="button" onClick={() => onDelete(item.id)}>
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default IuranCrud;
