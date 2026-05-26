import { useCallback, useEffect, useMemo, useState } from 'react';
import './App.css';
import {
  createAdminIuran,
  createAdminPemasukan,
  createAdminPengeluaran,
  createQrisPayment,
  createWargaUsulan,
  deleteAdminIuran,
  deleteAdminPemasukan,
  deleteAdminPengeluaran,
  getAdminIuran,
  getAdminLaporan,
  getAdminPemasukan,
  getAdminUsulan,
  getAdminPengeluaran,
  getWargaIuran,
  getWargaLaporan,
  getWargaPembayaran,
  getWargaUsulan,
  login,
  register,
  syncQrisPayment,
  updateAdminIuran,
  updateAdminPemasukan,
  updateAdminPengeluaran,
  updateAdminUsulanStatus,
} from './api';
import Landing from './pages/Landing';
import Login from './pages/user/Login';
import Register from './pages/user/Register';
import DashboardWarga from './pages/user/Dashboard';
import DashboardAdmin from './pages/admin/Home';

const midtransScriptUrl = process.env.REACT_APP_MIDTRANS_IS_PRODUCTION === 'true'
  ? 'https://app.midtrans.com/snap/snap.js'
  : 'https://app.sandbox.midtrans.com/snap/snap.js';

function loadMidtransSnap() {
  return new Promise((resolve, reject) => {
    if (window.snap) {
      resolve(window.snap);
      return;
    }

    const clientKey = process.env.REACT_APP_MIDTRANS_CLIENT_KEY;

    if (!clientKey) {
      reject(new Error('REACT_APP_MIDTRANS_CLIENT_KEY belum diisi di frontend .env'));
      return;
    }

    const existingScript = document.querySelector(`script[src="${midtransScriptUrl}"]`);

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.snap));
      existingScript.addEventListener('error', () => reject(new Error('Gagal memuat Midtrans Snap')));
      return;
    }

    const script = document.createElement('script');
    script.src = midtransScriptUrl;
    script.setAttribute('data-client-key', clientKey);
    script.onload = () => resolve(window.snap);
    script.onerror = () => reject(new Error('Gagal memuat Midtrans Snap'));
    document.body.appendChild(script);
  });
}

const initialLoginForm = { email: '', password: '' };
const initialRegisterForm = { nama: '', email: '', password: '', no_hp: '', role: 'warga', nik: '', alamat: '', rt_rw: '' };
const initialUsulanForm = { judul: '', deskripsi: '' };
const initialIuranForm = { nama_iuran: '', jumlah: '', keterangan: '' };
const initialPemasukanForm = { sumber: '', keterangan: '', jumlah: '', tanggal: '' };
const initialPengeluaranForm = { kategori: '', keterangan: '', jumlah: '', tanggal: '', bukti: '' };

function dateOnly(value) {
  return value ? String(value).slice(0, 10) : '';
}

function App() {
  const [activePage, setActivePage] = useState('landing');
  const [loginForm, setLoginForm] = useState(initialLoginForm);
  const [registerForm, setRegisterForm] = useState(initialRegisterForm);
  const [usulanForm, setUsulanForm] = useState(initialUsulanForm);
  const [iuranForm, setIuranForm] = useState(initialIuranForm);
  const [pemasukanForm, setPemasukanForm] = useState(initialPemasukanForm);
  const [pengeluaranForm, setPengeluaranForm] = useState(initialPengeluaranForm);
  const [adminUsulanStatusForm, setAdminUsulanStatusForm] = useState({});
  const [iuranEditingId, setIuranEditingId] = useState(null);
  const [pemasukanEditingId, setPemasukanEditingId] = useState(null);
  const [pengeluaranEditingId, setPengeluaranEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [laporanLoading, setLaporanLoading] = useState(false);
  const [usulanLoading, setUsulanLoading] = useState(false);
  const [iuranLoading, setIuranLoading] = useState(false);
  const [adminIuranLoading, setAdminIuranLoading] = useState(false);
  const [adminUsulanLoading, setAdminUsulanLoading] = useState(false);
  const [pemasukanLoading, setPemasukanLoading] = useState(false);
  const [pengeluaranLoading, setPengeluaranLoading] = useState(false);
  const [laporan, setLaporan] = useState(null);
  const [usulan, setUsulan] = useState([]);
  const [iuran, setIuran] = useState([]);
  const [adminIuran, setAdminIuran] = useState([]);
  const [adminUsulan, setAdminUsulan] = useState([]);
  const [pembayaran, setPembayaran] = useState([]);
  const [pemasukan, setPemasukan] = useState([]);
  const [pengeluaran, setPengeluaran] = useState([]);
  const [laporanError, setLaporanError] = useState('');
  const [usulanError, setUsulanError] = useState('');
  const [iuranError, setIuranError] = useState('');
  const [adminIuranError, setAdminIuranError] = useState('');
  const [adminUsulanError, setAdminUsulanError] = useState('');
  const [pemasukanError, setPemasukanError] = useState('');
  const [pengeluaranError, setPengeluaranError] = useState('');
  const [alert, setAlert] = useState(null);
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (!token || !user) return null;
    try {
      return { token, user: JSON.parse(user) };
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }
  });

  const apiUrl = useMemo(() => process.env.REACT_APP_API_URL || 'URL backend belum diisi', []);

  const loadLaporan = useCallback(async () => {
    if (!auth?.user) return;
    setLaporanLoading(true);
    setLaporanError('');
    try {
      const response = auth.user.role === 'admin' ? await getAdminLaporan() : await getWargaLaporan();
      setLaporan(response.data);
    } catch (error) {
      setLaporanError(error.message);
    } finally {
      setLaporanLoading(false);
    }
  }, [auth]);

  const loadUsulan = useCallback(async () => {
    if (auth?.user?.role !== 'warga') return;
    setUsulanLoading(true);
    setUsulanError('');
    try {
      const response = await getWargaUsulan();
      setUsulan(response.data || []);
    } catch (error) {
      setUsulanError(error.message);
    } finally {
      setUsulanLoading(false);
    }
  }, [auth]);

  const loadIuran = useCallback(async () => {
    if (auth?.user?.role !== 'warga') return;
    setIuranLoading(true);
    setIuranError('');
    try {
      const [iuranResponse, pembayaranResponse] = await Promise.all([
        getWargaIuran(),
        getWargaPembayaran(),
      ]);
      setIuran(iuranResponse.data || []);
      setPembayaran(pembayaranResponse.data || []);
    } catch (error) {
      setIuranError(error.message);
    } finally {
      setIuranLoading(false);
    }
  }, [auth]);

  const loadAdminUsulan = useCallback(async () => {
    if (auth?.user?.role !== 'admin') return;
    setAdminUsulanLoading(true);
    setAdminUsulanError('');
    try {
      const response = await getAdminUsulan();
      setAdminUsulan(response.data || []);
    } catch (error) {
      setAdminUsulanError(error.message);
    } finally {
      setAdminUsulanLoading(false);
    }
  }, [auth]);

  const loadAdminKeuangan = useCallback(async () => {
    if (auth?.user?.role !== 'admin') return;
    setAdminIuranLoading(true);
    setPemasukanLoading(true);
    setPengeluaranLoading(true);
    setAdminIuranError('');
    setPemasukanError('');
    setPengeluaranError('');
    try {
      const [iuranResponse, pemasukanResponse, pengeluaranResponse] = await Promise.all([
        getAdminIuran(),
        getAdminPemasukan(),
        getAdminPengeluaran(),
      ]);
      setAdminIuran(iuranResponse.data || []);
      setPemasukan(pemasukanResponse.data || []);
      setPengeluaran(pengeluaranResponse.data || []);
    } catch (error) {
      setAdminIuranError(error.message);
      setPemasukanError(error.message);
      setPengeluaranError(error.message);
    } finally {
      setAdminIuranLoading(false);
      setPemasukanLoading(false);
      setPengeluaranLoading(false);
    }
  }, [auth]);

  useEffect(() => {
    loadLaporan();
    loadUsulan();
    loadIuran();
    loadAdminUsulan();
    loadAdminKeuangan();
  }, [loadLaporan, loadUsulan, loadIuran, loadAdminUsulan, loadAdminKeuangan]);

  function showAlert(type, message) { setAlert({ type, message }); }
  function changePage(page) { setActivePage(page); setAlert(null); }
  function updateLoginForm(e) { const { name, value } = e.target; setLoginForm((p) => ({ ...p, [name]: value })); }
  function updateRegisterForm(e) { const { name, value } = e.target; setRegisterForm((p) => ({ ...p, [name]: value })); }
  function updateUsulanForm(e) { const { name, value } = e.target; setUsulanForm((p) => ({ ...p, [name]: value })); }
  function updateIuranForm(e) { const { name, value } = e.target; setIuranForm((p) => ({ ...p, [name]: value })); }
  function updateAdminUsulanStatusForm(id, e) { const { name, value } = e.target; setAdminUsulanStatusForm((p) => ({ ...p, [id]: { ...(p[id] || {}), [name]: value } })); }
  function updatePemasukanForm(e) { const { name, value } = e.target; setPemasukanForm((p) => ({ ...p, [name]: value })); }
  function updatePengeluaranForm(e) {
    const { name, value, files, type } = e.target;
    setPengeluaranForm((p) => ({ ...p, [name]: type === 'file' ? files?.[0] || null : value }));
  }

  async function refreshAdminData() { await Promise.all([loadAdminKeuangan(), loadAdminUsulan(), loadLaporan()]); }

  async function handleLogin(event) {
    event.preventDefault();
    setLoading(true);
    setAlert(null);
    try {
      const result = await login(loginForm);
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      setAuth({ token: result.token, user: result.user });
      setLaporan(null); setUsulan([]); setIuran([]); setAdminIuran([]); setAdminUsulan([]); setPembayaran([]); setPemasukan([]); setPengeluaran([]);
      setLaporanError(''); setUsulanError(''); setIuranError(''); setAdminIuranError(''); setAdminUsulanError(''); setPemasukanError(''); setPengeluaranError('');
      setLoginForm(initialLoginForm);
      showAlert('success', result.message || 'Login berhasil');
    } catch (error) {
      showAlert('error', error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    setLoading(true);
    setAlert(null);
    try {
      const payload = { ...registerForm, no_hp: registerForm.no_hp || null, nik: registerForm.nik || null, alamat: registerForm.alamat || null, rt_rw: registerForm.rt_rw || null };
      const result = await register(payload);
      setRegisterForm(initialRegisterForm);
      setActivePage('login');
      showAlert('success', result.message || 'Register berhasil. Silakan login.');
    } catch (error) {
      showAlert('error', error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleBayarQris(iuranId) {
    setIuranLoading(true);
    setIuranError('');
    try {
      const response = await createQrisPayment(iuranId);
      const snapToken = response.data?.snap_token;
      const redirectUrl = response.data?.redirect_url;
      const orderId = response.data?.order_id;

      if (!snapToken) {
        if (redirectUrl) window.open(redirectUrl, '_blank', 'noopener,noreferrer');
        await loadIuran();
        return;
      }

      const snap = await loadMidtransSnap();
      snap.pay(snapToken, {
        onSuccess: async () => {
          if (orderId) await syncQrisPayment(orderId);
          await loadIuran();
          await loadLaporan();
        },
        onPending: async () => {
          if (orderId) await syncQrisPayment(orderId);
          await loadIuran();
          await loadLaporan();
        },
        onError: async () => {
          setIuranError('Pembayaran gagal diproses oleh Midtrans');
          await loadIuran();
        },
        onClose: async () => {
          await loadIuran();
        },
      });
    } catch (error) {
      setIuranError(error.message);
    } finally {
      setIuranLoading(false);
    }
  }

  async function handleSyncPayment(orderId) {
    setIuranLoading(true);
    setIuranError('');
    try {
      await syncQrisPayment(orderId);
      await loadIuran();
      await loadLaporan();
    } catch (error) {
      setIuranError(error.message);
    } finally {
      setIuranLoading(false);
    }
  }

  async function handleSubmitUsulan(event) {
    event.preventDefault();
    setUsulanLoading(true);
    setUsulanError('');
    try {
      await createWargaUsulan(usulanForm);
      setUsulanForm(initialUsulanForm);
      await loadUsulan();
    } catch (error) {
      setUsulanError(error.message);
    } finally {
      setUsulanLoading(false);
    }
  }

  async function handleSubmitAdminUsulanStatus(event, id) {
    event.preventDefault();
    setAdminUsulanLoading(true);
    setAdminUsulanError('');
    try {
      const current = adminUsulan.find((item) => item.id === id);
      const form = adminUsulanStatusForm[id] || {};
      await updateAdminUsulanStatus(id, {
        status: form.status || current?.status || 'pending',
        tanggapan_admin: form.tanggapan_admin ?? current?.tanggapan_admin ?? null,
      });
      setAdminUsulanStatusForm((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      await loadAdminUsulan();
    } catch (error) {
      setAdminUsulanError(error.message);
    } finally {
      setAdminUsulanLoading(false);
    }
  }

  async function handleSubmitIuran(event) {
    event.preventDefault();
    setAdminIuranLoading(true);
    setAdminIuranError('');
    try {
      const payload = { ...iuranForm, keterangan: iuranForm.keterangan || null };
      if (iuranEditingId) await updateAdminIuran(iuranEditingId, payload);
      else await createAdminIuran(payload);
      setIuranForm(initialIuranForm);
      setIuranEditingId(null);
      await refreshAdminData();
    } catch (error) {
      setAdminIuranError(error.message);
    } finally {
      setAdminIuranLoading(false);
    }
  }

  async function handleSubmitPemasukan(event) {
    event.preventDefault();
    setPemasukanLoading(true);
    setPemasukanError('');
    try {
      const payload = { ...pemasukanForm, keterangan: pemasukanForm.keterangan || null };
      if (pemasukanEditingId) await updateAdminPemasukan(pemasukanEditingId, payload);
      else await createAdminPemasukan(payload);
      setPemasukanForm(initialPemasukanForm);
      setPemasukanEditingId(null);
      await refreshAdminData();
    } catch (error) {
      setPemasukanError(error.message);
    } finally {
      setPemasukanLoading(false);
    }
  }

  async function handleSubmitPengeluaran(event) {
    event.preventDefault();
    setPengeluaranLoading(true);
    setPengeluaranError('');
    try {
      const payload = new FormData();
      payload.append('kategori', pengeluaranForm.kategori);
      payload.append('jumlah', pengeluaranForm.jumlah);
      payload.append('tanggal', pengeluaranForm.tanggal);
      payload.append('keterangan', pengeluaranForm.keterangan || '');
      if (pengeluaranForm.bukti instanceof File) {
        payload.append('bukti', pengeluaranForm.bukti);
      }

      if (pengeluaranEditingId) await updateAdminPengeluaran(pengeluaranEditingId, payload);
      else await createAdminPengeluaran(payload);
      setPengeluaranForm(initialPengeluaranForm);
      setPengeluaranEditingId(null);
      await refreshAdminData();
    } catch (error) {
      setPengeluaranError(error.message);
    } finally {
      setPengeluaranLoading(false);
    }
  }

  function editIuran(item) { setIuranEditingId(item.id); setIuranForm({ nama_iuran: item.nama_iuran || '', keterangan: item.keterangan || '', jumlah: item.jumlah || '' }); }
  function editPemasukan(item) { setPemasukanEditingId(item.id); setPemasukanForm({ sumber: item.sumber || '', keterangan: item.keterangan || '', jumlah: item.jumlah || '', tanggal: dateOnly(item.tanggal) }); }
  function editPengeluaran(item) { setPengeluaranEditingId(item.id); setPengeluaranForm({ kategori: item.kategori || '', keterangan: item.keterangan || '', jumlah: item.jumlah || '', tanggal: dateOnly(item.tanggal), bukti: null, buktiLama: item.bukti || '' }); }
  function cancelEditIuran() { setIuranEditingId(null); setIuranForm(initialIuranForm); }
  function cancelEditPemasukan() { setPemasukanEditingId(null); setPemasukanForm(initialPemasukanForm); }
  function cancelEditPengeluaran() { setPengeluaranEditingId(null); setPengeluaranForm(initialPengeluaranForm); }

  async function handleDeleteIuran(id) {
    if (!window.confirm('Yakin ingin menghapus data iuran ini?')) return;
    setAdminIuranLoading(true); setAdminIuranError('');
    try { await deleteAdminIuran(id); await refreshAdminData(); } catch (error) { setAdminIuranError(error.message); } finally { setAdminIuranLoading(false); }
  }

  async function refreshAdminAllData() {
    await Promise.all([loadLaporan(), loadAdminKeuangan(), loadAdminUsulan()]);
  }

  async function handleDeletePemasukan(id) {
    if (!window.confirm('Yakin ingin menghapus data pemasukan ini?')) return;
    setPemasukanLoading(true); setPemasukanError('');
    try { await deleteAdminPemasukan(id); await refreshAdminData(); } catch (error) { setPemasukanError(error.message); } finally { setPemasukanLoading(false); }
  }

  async function handleDeletePengeluaran(id) {
    if (!window.confirm('Yakin ingin menghapus data pengeluaran ini?')) return;
    setPengeluaranLoading(true); setPengeluaranError('');
    try { await deleteAdminPengeluaran(id); await refreshAdminData(); } catch (error) { setPengeluaranError(error.message); } finally { setPengeluaranLoading(false); }
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuth(null);
    setLaporan(null); setUsulan([]); setIuran([]); setAdminIuran([]); setAdminUsulan([]); setPembayaran([]); setPemasukan([]); setPengeluaran([]);
    setLaporanError(''); setUsulanError(''); setIuranError(''); setAdminIuranError(''); setAdminUsulanError(''); setPemasukanError(''); setPengeluaranError('');
    setActivePage('landing');
    showAlert('success', 'Logout berhasil');
  }

  if (auth?.user?.role === 'admin') {
    return (
      <DashboardAdmin
        user={auth.user}
        laporan={laporan}
        loading={laporanLoading}
        error={laporanError}
        onRefresh={refreshAdminAllData}
        adminUsulan={adminUsulan}
        adminUsulanStatusForm={adminUsulanStatusForm}
        adminUsulanLoading={adminUsulanLoading}
        adminUsulanError={adminUsulanError}
        onChangeAdminUsulanStatus={updateAdminUsulanStatusForm}
        onSubmitAdminUsulanStatus={handleSubmitAdminUsulanStatus}
        onRefreshAdminUsulan={loadAdminUsulan}
        iuran={adminIuran}
        iuranForm={iuranForm}
        iuranEditingId={iuranEditingId}
        iuranLoading={adminIuranLoading}
        iuranError={adminIuranError}
        onChangeIuran={updateIuranForm}
        onSubmitIuran={handleSubmitIuran}
        onEditIuran={editIuran}
        onCancelEditIuran={cancelEditIuran}
        onDeleteIuran={handleDeleteIuran}
        pemasukan={pemasukan}
        pemasukanForm={pemasukanForm}
        pemasukanEditingId={pemasukanEditingId}
        pemasukanLoading={pemasukanLoading}
        pemasukanError={pemasukanError}
        onChangePemasukan={updatePemasukanForm}
        onSubmitPemasukan={handleSubmitPemasukan}
        onEditPemasukan={editPemasukan}
        onCancelEditPemasukan={cancelEditPemasukan}
        onDeletePemasukan={handleDeletePemasukan}
        pengeluaran={pengeluaran}
        pengeluaranForm={pengeluaranForm}
        pengeluaranEditingId={pengeluaranEditingId}
        pengeluaranLoading={pengeluaranLoading}
        pengeluaranError={pengeluaranError}
        onChangePengeluaran={updatePengeluaranForm}
        onSubmitPengeluaran={handleSubmitPengeluaran}
        onEditPengeluaran={editPengeluaran}
        onCancelEditPengeluaran={cancelEditPengeluaran}
        onDeletePengeluaran={handleDeletePengeluaran}
        onLogout={handleLogout}
      />
    );
  }

  if (auth?.user?.role === 'warga') {
    return <DashboardWarga user={auth.user} laporan={laporan} laporanLoading={laporanLoading} laporanError={laporanError} onRefreshLaporan={loadLaporan} iuran={iuran} pembayaran={pembayaran} iuranLoading={iuranLoading} iuranError={iuranError} onRefreshIuran={loadIuran} onBayarQris={handleBayarQris} onSyncPayment={handleSyncPayment} usulanForm={usulanForm} usulan={usulan} usulanLoading={usulanLoading} usulanError={usulanError} onChangeUsulan={updateUsulanForm} onSubmitUsulan={handleSubmitUsulan} onRefreshUsulan={loadUsulan} onLogout={handleLogout} />;
  }

  return (
    <>
      <Landing onLogin={() => changePage('login')} onRegister={() => changePage('register')} />

      {(activePage === 'login' || activePage === 'register') && (
        <div className="auth-modal-overlay" role="dialog" aria-modal="true">
          <div className="auth-modal-backdrop" onClick={() => changePage('landing')} />
          <div className="auth-modal-content">
            {activePage === 'login' ? (
              <Login
                form={loginForm}
                onChange={updateLoginForm}
                onSubmit={handleLogin}
                loading={loading}
                alert={alert}
                apiUrl={apiUrl}
                onChangePage={changePage}
                asModal
                onClose={() => changePage('landing')}
              />
            ) : (
              <Register
                form={registerForm}
                onChange={updateRegisterForm}
                onSubmit={handleRegister}
                loading={loading}
                alert={alert}
                apiUrl={apiUrl}
                onChangePage={changePage}
                asModal
                onClose={() => changePage('landing')}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default App;
