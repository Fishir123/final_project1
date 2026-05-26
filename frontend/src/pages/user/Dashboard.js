import { useState } from 'react';
import LogoIcon from '../../components/LogoIcon';
import IuranQris from '../../components/user/IuranQris';
import LaporanKeuangan from '../../components/user/LaporanKeuangan';
import UsulanKebutuhan from '../../components/user/UsulanKebutuhan';

const wargaMenus = [
  { key: 'iuran', label: 'Bayar Iuran' },
  { key: 'usulan', label: 'Usulan Kebutuhan' },
  { key: 'laporan', label: 'Laporan Keuangan' },
  { key: 'profil', label: 'Profil Warga' },
];

function Dashboard({
  user,
  laporan,
  laporanLoading,
  laporanError,
  onRefreshLaporan,
  iuran,
  pembayaran,
  iuranLoading,
  iuranError,
  onRefreshIuran,
  onBayarQris,
  onSyncPayment,
  usulanForm,
  usulan,
  usulanLoading,
  usulanError,
  onChangeUsulan,
  onSubmitUsulan,
  onRefreshUsulan,
  onLogout,
}) {
  const [activeMenu, setActiveMenu] = useState('iuran');

  function renderWargaContent() {
    if (activeMenu === 'usulan') {
      return (
        <UsulanKebutuhan
          form={usulanForm}
          usulan={usulan}
          loading={usulanLoading}
          error={usulanError}
          onChange={onChangeUsulan}
          onSubmit={onSubmitUsulan}
          onRefresh={onRefreshUsulan}
        />
      );
    }

    if (activeMenu === 'laporan') {
      return (
        <div className="admin-page-section">
          <div className="section-header">
            <h3>Laporan untuk Warga</h3>
            <button className="button small" onClick={onRefreshLaporan} disabled={laporanLoading}>
              {laporanLoading ? 'Memuat...' : 'Refresh'}
            </button>
          </div>

          {laporanError && <div className="alert error">{laporanError}</div>}
          {laporanLoading && !laporan ? <p className="empty-state">Memuat laporan...</p> : <LaporanKeuangan laporan={laporan} />}
        </div>
      );
    }

    if (activeMenu === 'profil') {
      return (
        <div className="admin-page-section">
          <div className="section-header">
            <h3>Profil Warga</h3>
          </div>

          <div className="profile-box light">
            <p className="muted">Informasi akun</p>
            <h2>{user.nama}</h2>
            <div className="profile-grid">
              <span>Email</span>
              <strong>{user.email}</strong>
              <span>No HP</span>
              <strong>{user.no_hp || '-'}</strong>
              <span>Role</span>
              <strong className="badge">{user.role}</strong>
            </div>
          </div>

          {user.warga && (
            <div className="profile-box light">
              <h3>Data Warga</h3>
              <div className="profile-grid">
                <span>NIK</span>
                <strong>{user.warga.nik || '-'}</strong>
                <span>Alamat</span>
                <strong>{user.warga.alamat || '-'}</strong>
                <span>RT/RW</span>
                <strong>{user.warga.rt_rw || '-'}</strong>
                <span>Status</span>
                <strong>{user.warga.status_warga || '-'}</strong>
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <IuranQris
        iuran={iuran}
        pembayaran={pembayaran}
        loading={iuranLoading}
        error={iuranError}
        onRefresh={onRefreshIuran}
        onBayarQris={onBayarQris}
        onSyncPayment={onSyncPayment}
      />
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
              <h1>Dashboard Warga</h1>
            </div>
          </div>
          <button className="button small secondary" onClick={onLogout}>
            Logout
          </button>
        </div>

        <div className="profile-box">
          <h2 className="welcome-title">Selamat datang, {user.nama}</h2>
        </div>

        <nav className="admin-menu" aria-label="Menu dashboard warga">
          {wargaMenus.map((menu) => (
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

        {renderWargaContent()}
      </section>
    </main>
  );
}

export default Dashboard;
