const API_URL = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '');

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, options = {}) {
  const token = getToken();
  const isFormData = options.body instanceof FormData;

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
      'ngrok-skip-browser-warning': 'true',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  let data = null;
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    const text = await response.text();
    data = text ? { message: text } : null;
  }

  if (!response.ok) {
    throw new Error(data?.message || 'Terjadi kesalahan');
  }

  return data;
}

export function login({ email, password }) {
  return request('/api/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function register(payload) {
  return request('/api/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getWargaLaporan() {
  return request('/api/warga/laporan');
}

export function getAdminLaporan() {
  return request('/api/admin/laporan');
}

export function getAdminIuran() {
  return request('/api/admin/iuran');
}

export function createAdminIuran(payload) {
  return request('/api/admin/iuran', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateAdminIuran(id, payload) {
  return request(`/api/admin/iuran/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteAdminIuran(id) {
  return request(`/api/admin/iuran/${id}`, {
    method: 'DELETE',
  });
}

export function getWargaUsulan() {
  return request('/api/warga/usulan');
}

export function getAdminUsulan() {
  return request('/api/admin/usulan');
}

export function updateAdminUsulanStatus(id, payload) {
  return request(`/api/admin/usulan/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function createWargaUsulan(payload) {
  return request('/api/warga/usulan', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getAdminPemasukan() {
  return request('/api/admin/pemasukan');
}

export function createAdminPemasukan(payload) {
  return request('/api/admin/pemasukan', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateAdminPemasukan(id, payload) {
  return request(`/api/admin/pemasukan/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteAdminPemasukan(id) {
  return request(`/api/admin/pemasukan/${id}`, {
    method: 'DELETE',
  });
}

export function getAdminPengeluaran() {
  return request('/api/admin/pengeluaran');
}

export function createAdminPengeluaran(payload) {
  return request('/api/admin/pengeluaran', {
    method: 'POST',
    body: payload instanceof FormData ? payload : JSON.stringify(payload),
  });
}

export function updateAdminPengeluaran(id, payload) {
  return request(`/api/admin/pengeluaran/${id}`, {
    method: 'PUT',
    body: payload instanceof FormData ? payload : JSON.stringify(payload),
  });
}

export function deleteAdminPengeluaran(id) {
  return request(`/api/admin/pengeluaran/${id}`, {
    method: 'DELETE',
  });
}

export function getWargaIuran() {
  return request('/api/warga/iuran');
}

export function getWargaPembayaran() {
  return request('/api/warga/iuran/pembayaran');
}

export function createQrisPayment(iuranId) {
  return request(`/api/warga/iuran/${iuranId}/bayar-qris`, {
    method: 'POST',
  });
}

export function syncQrisPayment(orderId) {
  return request(`/api/warga/iuran/pembayaran/${orderId}/sync`, {
    method: 'POST',
  });
}
