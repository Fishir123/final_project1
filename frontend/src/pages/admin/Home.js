import { useState } from 'react';
import LogoIcon from '../../components/LogoIcon';
import IuranCrud from '../../components/admin/IuranCrud';
import UsulanVerifikasi from '../../components/admin/UsulanVerifikasi';
import KeuanganCrud from '../../components/admin/KeuanganCrud';
import LaporanKeuangan from '../../components/user/LaporanKeuangan';

const adminMenus = [
  { key: 'laporan', label: 'Laporan' },
  { key: 'usulan', label: 'Usulan' },
  { key: 'iuran', label: 'Iuran' },
  { key: 'pemasukan', label: 'Pemasukan' },
  { key: 'pengeluaran', label: 'Pengeluaran' },
];

function Home({
  user,
  laporan,
  loading,
  error,
  onRefresh,
  adminUsulan,
  adminUsulanStatusForm,
  adminUsulanLoading,
  adminUsulanError,
  onChangeAdminUsulanStatus,
  onSubmitAdminUsulanStatus,
  onRefreshAdminUsulan,
  iuran,
  iuranForm,
  iuranEditingId,
  iuranLoading,
  iuranError,
  onChangeIuran,
  onSubmitIuran,
  onEditIuran,
  onCancelEditIuran,
  onDeleteIuran,
  pemasukan,
  pemasukanForm,
  pemasukanEditingId,
  pemasukanLoading,
  pemasukanError,
  onChangePemasukan,
  onSubmitPemasukan,
  onEditPemasukan,
  onCancelEditPemasukan,
  onDeletePemasukan,
  pengeluaran,
  pengeluaranForm,
  pengeluaranEditingId,
  pengeluaranLoading,
  pengeluaranError,
  onChangePengeluaran,
  onSubmitPengeluaran,
  onEditPengeluaran,
  onCancelEditPengeluaran,
  onDeletePengeluaran,
  onLogout,
}) {
  const [activeMenu, setActiveMenu] = useState('laporan');

  function renderAdminContent() {
    if (activeMenu === 'usulan') {
      return (
        <UsulanVerifikasi
          data={adminUsulan}
          loading={adminUsulanLoading}
          error={adminUsulanError}
          statusForm={adminUsulanStatusForm}
          onChangeStatus={onChangeAdminUsulanStatus}
          onSubmitStatus={onSubmitAdminUsulanStatus}
          onRefresh={onRefreshAdminUsulan}
        />
      );
    }

    if (activeMenu === 'iuran') {
      return (
        <IuranCrud
          data={iuran}
          form={iuranForm}
          editingId={iuranEditingId}
          loading={iuranLoading}
          error={iuranError}
          onChange={onChangeIuran}
          onSubmit={onSubmitIuran}
          onEdit={onEditIuran}
          onCancelEdit={onCancelEditIuran}
          onDelete={onDeleteIuran}
        />
      );
    }

    if (activeMenu === 'pemasukan') {
      return (
        <KeuanganCrud
          type="pemasukan"
          title="Pemasukan"
          data={pemasukan}
          form={pemasukanForm}
          editingId={pemasukanEditingId}
          loading={pemasukanLoading}
          error={pemasukanError}
          onChange={onChangePemasukan}
          onSubmit={onSubmitPemasukan}
          onEdit={onEditPemasukan}
          onCancelEdit={onCancelEditPemasukan}
          onDelete={onDeletePemasukan}
        />
      );
    }

    if (activeMenu === 'pengeluaran') {
      return (
        <KeuanganCrud
          type="pengeluaran"
          title="Pengeluaran"
          data={pengeluaran}
          form={pengeluaranForm}
          editingId={pengeluaranEditingId}
          loading={pengeluaranLoading}
          error={pengeluaranError}
          onChange={onChangePengeluaran}
          onSubmit={onSubmitPengeluaran}
          onEdit={onEditPengeluaran}
          onCancelEdit={onCancelEditPengeluaran}
          onDelete={onDeletePengeluaran}
        />
      );
    }

    return (
      <div className="admin-page-section">
        <div className="section-header">
          <h3>Data Laporan</h3>
          <button className="button small" onClick={onRefresh} disabled={loading}>
            {loading ? 'Memuat...' : 'Refresh'}
          </button>
        </div>

        {error && <div className="alert error">{error}</div>}
        {loading && !laporan ? <p className="empty-state">Memuat laporan...</p> : <LaporanKeuangan laporan={laporan} />}
      </div>
    );
  }

  return (
    <main className="page">
      <section className="card wide-card">
        <div className="dashboard-header">
          <div className="brand">
            <LogoIcon />
            <div>
              <p className="eyebrow">Jimpitan Digital</p>
              <h1>Dashboard Admin</h1>
            </div>
          </div>
          <button className="button small secondary" onClick={onLogout}>
            Logout
          </button>
        </div>

        <div className="profile-box admin-box">
          <p className="muted">Login sebagai admin</p>
          <h2>{user.nama}</h2>
          <div className="profile-grid">
            <span>Email</span>
            <strong>{user.email}</strong>
            <span>Role</span>
            <strong className="badge">{user.role}</strong>
          </div>
        </div>

        <nav className="admin-menu" aria-label="Menu dashboard admin">
          {adminMenus.map((menu) => (
            <button
              key={menu.key}
              type="button"
              className={`admin-menu-button${activeMenu === menu.key ? ' active' : ''}`}
              onClick={() => setActiveMenu(menu.key)}
            >
              {menu.label}
            </button>
          ))}
        </nav>

        {renderAdminContent()}
      </section>
    </main>
  );
}

export default Home;
