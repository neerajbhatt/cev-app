const BASE = import.meta.env.VITE_API_URL || 'https://cev-backend-phau.onrender.com'

let _token = localStorage.getItem('cev_token') || ''

export const setToken = (t) => { _token = t; localStorage.setItem('cev_token', t) }
export const clearToken = () => { _token = ''; localStorage.removeItem('cev_token') }

async function req(method, path, body, isForm = false) {
  const headers = {}
  if (_token) headers['Authorization'] = `Bearer ${_token}`
  if (body && !isForm) headers['Content-Type'] = 'application/json'
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Request failed')
  }
  return res.json()
}

// Normalize snake_case DB fields to camelCase for the frontend
const normActivity = (a) => ({ ...a, startDate: a.start_date, endDate: a.end_date })
const normDocument = (d) => ({ ...d, uploadedAt: d.uploaded_at })

export const api = {
  login:                (email, password) => req('POST', '/api/auth/login', { email, password }),
  register:             (data)            => req('POST', '/api/auth/register', data),
  getProfile:           ()                => req('GET',  '/api/user/profile'),
  updateProfile:        (data)            => req('PUT',  '/api/user/profile', data),
  getCompliance:        ()                => req('GET',  '/api/compliance'),
  getActivities:        async ()          => (await req('GET', '/api/activities')).map(normActivity),
  addActivity:          async (data)      => normActivity(await req('POST', '/api/activities', data)),
  deleteActivity:       (id)              => req('DELETE', `/api/activities/${id}`),
  getDocuments:         async ()          => (await req('GET', '/api/documents')).map(normDocument),
  uploadDocument:       async (fd)        => normDocument(await req('POST', '/api/documents', fd, true)),
  getNotifications:     ()                => req('GET',  '/api/notifications'),
  markNotificationRead: (id)              => req('PUT',  `/api/notifications/${id}/read`),
  markAllRead:          ()                => req('PUT',  '/api/notifications/read-all'),
  getDelegates:         ()                => req('GET',  '/api/delegates'),
  addDelegate:          (data)            => req('POST', '/api/delegates', data),
  removeDelegate:       (id)              => req('DELETE', `/api/delegates/${id}`),
  changePassword:       (data)            => req('PUT',  '/api/user/change-password', data),
  getMfa:               ()                => req('GET',  '/api/user/mfa'),
  updateMfa:            (data)            => req('PUT',  '/api/user/mfa', data),
  getLoginHistory:      ()                => req('GET',  '/api/user/login-history'),
  getSessions:          ()                => req('GET',  '/api/user/sessions'),
  revokeSession:        (id)              => req('DELETE', `/api/user/sessions/${id}`),
}
