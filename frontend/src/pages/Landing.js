import LogoIcon from '../components/LogoIcon';

function Landing({ onLogin, onRegister }) {
  return (
    <main className="landing-page">
      <nav className="landing-nav">
        <div className="landing-brand">
          <LogoIcon />
          <div>
            <strong>Jimpitan Digital</strong>
            <span>Transparansi iuran warga</span>
          </div>
        </div>

        <div className="landing-nav-actions">
          <button className="nav-button ghost" onClick={onLogin}>
            Login
          </button>
          <button className="nav-button" onClick={onRegister}>
            Register
          </button>
        </div>
      </nav>

      <section className="hero-section">
        <div className="hero-content">
          <p className="eyebrow">Aplikasi Warga</p>
          <h1>Kelola jimpitan, laporan, dan usulan warga lebih mudah.</h1>
          <p className="hero-description">
            Jimpitan Digital membantu admin mencatat pemasukan dan pengeluaran,
            sementara warga bisa melihat laporan keuangan serta mengirim usulan kebutuhan desa.
          </p>

          <div className="hero-actions">
            <button className="button hero-button" onClick={onRegister}>
              Mulai Daftar
            </button>
            <button className="button secondary hero-button" onClick={onLogin}>
              Masuk Akun
            </button>
          </div>

          <div className="hero-stats">
            <div>
              <strong>100%</strong>
              <span>Transparan</span>
            </div>
            <div>
              <strong>24/7</strong>
              <span>Akses laporan</span>
            </div>
            <div>
              <strong>2 Role</strong>
              <span>Admin & warga</span>
            </div>
          </div>
        </div>

        <div className="hero-card">
          <div className="hero-card-header">
            <span className="status-dot" />
            <strong>Ringkasan Keuangan</strong>
          </div>

          <div className="mock-summary">
            <div>
              <span>Pemasukan</span>
              <strong>Rp 2.500.000</strong>
            </div>
            <div>
              <span>Pengeluaran</span>
              <strong>Rp 750.000</strong>
            </div>
            <div>
              <span>Saldo</span>
              <strong>Rp 1.750.000</strong>
            </div>
          </div>

          <div className="mock-list">
            <div>
              <span>Iuran warga</span>
              <b>+ Rp 100.000</b>
            </div>
            <div>
              <span>Kebersihan lingkungan</span>
              <b className="danger-text">- Rp 50.000</b>
            </div>
            <div>
              <span>Usulan perbaikan lampu</span>
              <b className="pending-text">Pending</b>
            </div>
          </div>
        </div>
      </section>

      <section className="feature-section">
        <div className="feature-card">
          <div className="feature-icon">💰</div>
          <h3>Catat Keuangan</h3>
          <p>Admin dapat mengelola data pemasukan dan pengeluaran warga.</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">📊</div>
          <h3>Laporan Transparan</h3>
          <p>Warga bisa melihat ringkasan laporan keuangan secara mudah.</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">📝</div>
          <h3>Usulan Warga</h3>
          <p>Warga dapat mengirim usulan kebutuhan desa langsung dari dashboard.</p>
        </div>
      </section>
    </main>
  );
}

export default Landing;
