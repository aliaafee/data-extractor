const BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 204) return null;

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// Auth
export const register = (email, password, role) =>
  request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, role }) });

export const login = (email, password) =>
  request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });

export const getMe = () => request('/auth/me');

// Users (admin only)
export const listUsers = () => request('/auth/users');

export const updateUserRole = (id, role) =>
  request(`/auth/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) });

// Items
export const getItems = () => request('/items');

export const createItem = (title, description) =>
  request('/items', { method: 'POST', body: JSON.stringify({ title, description }) });

export const updateItem = (id, data) =>
  request(`/items/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

export const deleteItem = (id) =>
  request(`/items/${id}`, { method: 'DELETE' });
