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

function EmptyState({ text }) {
  return <p className="empty-state">{text}</p>;
}

function LaporanKeuangan({ laporan }) {
  const ringkasan = laporan?.ringkasan || {};
  const dataLaporan = laporan?.laporan || [];
  const pemasukan = laporan?.pemasukan_terbaru || [];
  const pengeluaran = laporan?.pengeluaran_terbaru || [];

  return (
    <div className="report-section">
      <h3>Laporan Keuangan</h3>

      <div className="summary-grid">
        <div className="summary-card income">
          <span>Total Pemasukan</span>
          <strong>{formatRupiah(ringkasan.total_pemasukan)}</strong>
        </div>
        <div className="summary-card expense">
          <span>Total Pengeluaran</span>
          <strong>{formatRupiah(ringkasan.total_pengeluaran)}</strong>
        </div>
        <div className="summary-card balance">
          <span>Saldo</span>
          <strong>{formatRupiah(ringkasan.saldo)}</strong>
        </div>
      </div>

      <div className="report-card">
        <h4>Laporan Periode</h4>
        {dataLaporan.length === 0 ? (
          <EmptyState text="Belum ada laporan periode." />
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Periode</th>
                  <th>Pemasukan</th>
                  <th>Pengeluaran</th>
                  <th>Saldo</th>
                </tr>
              </thead>
              <tbody>
                {dataLaporan.map((item) => (
                  <tr key={item.id}>
                    <td>{item.periode}</td>
                    <td>{formatRupiah(item.total_pemasukan)}</td>
                    <td>{formatRupiah(item.total_pengeluaran)}</td>
                    <td>{formatRupiah(item.saldo)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="report-list-grid">
        <div className="report-card">
          <h4>Pemasukan Terbaru</h4>
          {pemasukan.length === 0 ? (
            <EmptyState text="Belum ada data pemasukan." />
          ) : (
            <div className="transaction-list">
              {pemasukan.map((item) => (
                <div className="transaction-item" key={item.id}>
                  <div>
                    <strong>{item.sumber}</strong>
                    <span>{formatTanggal(item.tanggal)}</span>
                    {item.keterangan && <p>{item.keterangan}</p>}
                  </div>
                  <b className="income-text">{formatRupiah(item.jumlah)}</b>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="report-card">
          <h4>Pengeluaran Terbaru</h4>
          {pengeluaran.length === 0 ? (
            <EmptyState text="Belum ada data pengeluaran." />
          ) : (
            <div className="transaction-list">
              {pengeluaran.map((item) => (
                <div className="transaction-item" key={item.id}>
                  <div>
                    <strong>{item.kategori}</strong>
                    <span>{formatTanggal(item.tanggal)}</span>
                    {item.keterangan && <p>{item.keterangan}</p>}
                  </div>
                  <b className="expense-text">{formatRupiah(item.jumlah)}</b>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LaporanKeuangan;
