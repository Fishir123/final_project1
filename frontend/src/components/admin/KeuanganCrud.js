const API_URL = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '');

function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatTanggalInput(value) {
  if (!value) return '';
  return String(value).slice(0, 10);
}

function getBuktiUrl(filename) {
  if (!filename) return null;
  if (/^https?:\/\//i.test(filename)) return filename;
  return `${API_URL}/uploads/bukti-pengeluaran/${filename}`;
}

function KeuanganCrud({
  type,
  title,
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
  const isPemasukan = type === 'pemasukan';
  const nameField = isPemasukan ? 'sumber' : 'kategori';
  const nameLabel = isPemasukan ? 'Sumber' : 'Kategori';
  const namePlaceholder = isPemasukan ? 'Contoh: Iuran warga' : 'Contoh: Perbaikan jalan';
  const buktiUrl = !isPemasukan ? getBuktiUrl(form.buktiLama) : null;

  return (
    <div className="crud-section">
      <div className="section-header compact">
        <h3>{title}</h3>
      </div>

      {error && <div className="alert error">{error}</div>}

      <div className="crud-grid">
        <div className="report-card">
          <h4>{editingId ? `Edit ${title}` : `Tambah ${title}`}</h4>
          <form className="form" onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor={`${type}-name`}>{nameLabel}</label>
              <input
                id={`${type}-name`}
                name={nameField}
                placeholder={namePlaceholder}
                value={form[nameField] || ''}
                onChange={onChange}
                required
              />
            </div>

            <div className="field two-columns">
              <div>
                <label htmlFor={`${type}-jumlah`}>Jumlah</label>
                <input
                  id={`${type}-jumlah`}
                  name="jumlah"
                  type="number"
                  min="1"
                  placeholder="100000"
                  value={form.jumlah || ''}
                  onChange={onChange}
                  required
                />
              </div>

              <div>
                <label htmlFor={`${type}-tanggal`}>Tanggal</label>
                <input
                  id={`${type}-tanggal`}
                  name="tanggal"
                  type="date"
                  value={formatTanggalInput(form.tanggal)}
                  onChange={onChange}
                  required
                />
              </div>
            </div>

            {!isPemasukan && (
              <div className="field">
                <label htmlFor={`${type}-bukti`}>Bukti Pengeluaran</label>
                <input
                  id={`${type}-bukti`}
                  name="bukti"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/webp,application/pdf"
                  onChange={onChange}
                />
                <small className="table-note">File opsional. Format: JPG, PNG, WebP, atau PDF. Maksimal 1MB.</small>
                {buktiUrl && (
                  <a href={buktiUrl} target="_blank" rel="noreferrer" className="file-link">
                    Lihat bukti lama
                  </a>
                )}
              </div>
            )}

            <div className="field">
              <label htmlFor={`${type}-keterangan`}>Keterangan</label>
              <textarea
                id={`${type}-keterangan`}
                name="keterangan"
                placeholder="Keterangan tambahan"
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
          <h4>Data {title}</h4>
          {loading && data.length === 0 ? (
            <p className="empty-state">Memuat data...</p>
          ) : data.length === 0 ? (
            <p className="empty-state">Belum ada data {title.toLowerCase()}.</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>{nameLabel}</th>
                    <th>Jumlah</th>
                    <th>Tanggal</th>
                    {!isPemasukan && <th>Bukti</th>}
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item) => {
                    const itemBuktiUrl = getBuktiUrl(item.bukti);

                    return (
                      <tr key={item.id}>
                        <td>
                          <strong>{item[nameField]}</strong>
                          {item.keterangan && <small className="table-note">{item.keterangan}</small>}
                        </td>
                        <td>{formatRupiah(item.jumlah)}</td>
                        <td>{formatTanggalInput(item.tanggal)}</td>
                        {!isPemasukan && (
                          <td>
                            {itemBuktiUrl ? (
                              <a href={itemBuktiUrl} target="_blank" rel="noreferrer" className="file-link">
                                Lihat bukti
                              </a>
                            ) : '-'}
                          </td>
                        )}
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
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default KeuanganCrud;
