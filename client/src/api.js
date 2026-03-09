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
export const getSetupStatus = () => request('/auth/setup');

export const register = (email, password, role) =>
  request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, role }) });

export const login = (email, password) =>
  request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });

export const getMe = () => request('/auth/me');

// Users (admin only)
export const listUsers = () => request('/auth/users');

export const updateUserRole = (id, role) =>
  request(`/auth/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) });

// Projects
export const getProjects = () => request('/projects');

export const getProject = (id) => request(`/projects/${id}`);

export const createProject = (data) =>
  request('/projects', { method: 'POST', body: JSON.stringify(data) });

export const updateProject = (id, data) =>
  request(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

export const deleteProject = (id) =>
  request(`/projects/${id}`, { method: 'DELETE' });

// Items (nested under a project)
export const getItems = (projectId) => request(`/projects/${projectId}/items`);

export const createItem = (projectId, title, description) =>
  request(`/projects/${projectId}/items`, { method: 'POST', body: JSON.stringify({ title, description }) });

export const updateItem = (projectId, id, data) =>
  request(`/projects/${projectId}/items/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

export const deleteItem = (projectId, id) =>
  request(`/projects/${projectId}/items/${id}`, { method: 'DELETE' });
