/**
 * Centralized API service for all backend calls.
 * All requests go through /api (proxied to http://localhost:5000 by Vite).
 */

const BASE_URL = '/api';

/** Attach JWT from localStorage to Authorization header */
const authHeaders = () => {
  const token = localStorage.getItem('laundry_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/** Generic request helper */
const request = async (method, endpoint, body = null) => {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
  };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

// ── Auth ──────────────────────────────────────────────────────────────────────
export const loginAdmin          = (creds)    => request('POST',   '/auth/login', creds);
export const registerAdmin       = (payload)  => request('POST',   '/auth/register', payload);
export const getMe               = ()         => request('GET',    '/auth/me');
export const updateAdminSettings = (payload)  => request('PUT',    '/auth/settings', payload);
export const deleteAdminAccount  = (payload)  => request('DELETE', '/auth/settings', payload);

// ── Laundry Orders (Admin) ────────────────────────────────────────────────────
export const getAllEntries = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request('GET', `/laundry${qs ? `?${qs}` : ''}`);
};
export const getEntryById = (id)                          => request('GET',    `/laundry/${id}`);
export const createEntry  = (payload)                     => request('POST',   '/laundry', payload);
export const updateStatus = (id, status, changedBy, notes) =>
  request('PATCH', `/laundry/${id}/status`, { status, changedBy, notes });
export const deleteEntry  = (id)                          => request('DELETE', `/laundry/${id}`);
export const getStats     = ()                            => request('GET',    '/laundry/stats');
export const notifyStudent = (id)                         => request('POST',   `/laundry/${id}/notify`);

// ── Student Tracking (Public) ─────────────────────────────────────────────────
export const trackByRegNo = (regNo) =>
  request('GET', `/laundry/track/${encodeURIComponent(regNo.toUpperCase())}`);

// ── Complaints & Announcements ────────────────────────────────────────────────
export const createComplaint   = (payload) => request('POST',  '/complaints', payload);
export const getComplaints     = ()        => request('GET',   '/complaints');
export const resolveComplaint  = (id)      => request('PATCH', `/complaints/${id}/resolve`);
export const deleteComplaint   = (id)      => request('DELETE',`/complaints/${id}`);
