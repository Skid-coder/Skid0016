const API = process.env.REACT_APP_API_URL || '';

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('crm_token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem('crm_token');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }

  if (res.headers.get('content-type')?.includes('text/csv')) {
    return res.text();
  }
  return res.json();
}

export async function apiUpload(path, file) {
  const token = localStorage.getItem('crm_token');
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Upload failed');
  }
  return res.json();
}
