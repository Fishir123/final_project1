import Alert from '../../components/user/Alert';
import AuthHeader from '../../components/user/AuthHeader';
import AuthTabs from '../../components/user/AuthTabs';

function Login({ form, onChange, onSubmit, loading, alert, apiUrl, onChangePage, asModal = false, onClose }) {
  const content = (
    <section className="card auth-card">
      {asModal && (
        <button className="modal-close" type="button" onClick={onClose} aria-label="Tutup popup">
          ×
        </button>
      )}
      <AuthHeader title="Masuk Akun" apiUrl={apiUrl} />
      <AuthTabs activePage="login" onChangePage={onChangePage} />
      <Alert alert={alert} />

      <form onSubmit={onSubmit} className="form">
        <div className="field">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            name="email"
            type="email"
            placeholder="contoh@email.com"
            value={form.email}
            onChange={onChange}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            name="password"
            type="password"
            placeholder="Masukkan password"
            value={form.password}
            onChange={onChange}
            required
          />
        </div>

        <button className="button" type="submit" disabled={loading}>
          {loading ? 'Memproses...' : 'Login'}
        </button>
      </form>
    </section>
  );

  if (asModal) return content;

  return <main className="page">{content}</main>;
}

export default Login;
