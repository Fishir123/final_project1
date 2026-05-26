import Alert from '../../components/user/Alert';
import AuthHeader from '../../components/user/AuthHeader';
import AuthTabs from '../../components/user/AuthTabs';

function Register({ form, onChange, onSubmit, loading, alert, apiUrl, onChangePage, asModal = false, onClose }) {
  const content = (
    <section className="card auth-card">
      {asModal && (
        <button className="modal-close" type="button" onClick={onClose} aria-label="Tutup popup">
          ×
        </button>
      )}
      <AuthHeader title="Daftar Akun" apiUrl={apiUrl} />
      <AuthTabs activePage="register" onChangePage={onChangePage} />
      <Alert alert={alert} />

      <form onSubmit={onSubmit} className="form">
        <div className="field">
          <label htmlFor="nama">Nama Lengkap</label>
          <input
            id="nama"
            name="nama"
            placeholder="Nama warga"
            value={form.nama}
            onChange={onChange}
            required
          />
        </div>

        <div className="field two-columns">
          <div>
            <label htmlFor="register-email">Email</label>
            <input
              id="register-email"
              name="email"
              type="email"
              placeholder="contoh@email.com"
              value={form.email}
              onChange={onChange}
              required
            />
          </div>

          <div>
            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              name="password"
              type="password"
              placeholder="Minimal 6 karakter"
              value={form.password}
              onChange={onChange}
              required
            />
          </div>
        </div>

        <div className="field two-columns">
          <div>
            <label htmlFor="no_hp">No HP</label>
            <input
              id="no_hp"
              name="no_hp"
              placeholder="08xxxxxxxxxx"
              value={form.no_hp}
              onChange={onChange}
            />
          </div>

          <div>
            <label htmlFor="role">Role</label>
            <select id="role" name="role" value={form.role} onChange={onChange}>
              <option value="warga">Warga</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        {form.role === 'warga' && (
          <>
            <div className="field two-columns">
              <div>
                <label htmlFor="nik">NIK</label>
                <input
                  id="nik"
                  name="nik"
                  placeholder="Nomor NIK"
                  value={form.nik}
                  onChange={onChange}
                />
              </div>

              <div>
                <label htmlFor="rt_rw">RT/RW</label>
                <input
                  id="rt_rw"
                  name="rt_rw"
                  placeholder="001/002"
                  value={form.rt_rw}
                  onChange={onChange}
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="alamat">Alamat</label>
              <textarea
                id="alamat"
                name="alamat"
                placeholder="Alamat lengkap"
                value={form.alamat}
                onChange={onChange}
              />
            </div>
          </>
        )}

        <button className="button" type="submit" disabled={loading}>
          {loading ? 'Memproses...' : 'Register'}
        </button>
      </form>
    </section>
  );

  if (asModal) return content;

  return <main className="page">{content}</main>;
}

export default Register;
