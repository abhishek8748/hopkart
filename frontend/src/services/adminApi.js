// src/services/adminApi.js
// Admin login session — token is stored in localStorage and sent by productsApi.

const BASE = import.meta.env.VITE_SHIPPING_API_URL || "http://localhost:4000";
const TOKEN_KEY = "bb_admin_token";
const USER_KEY = "bb_admin_user";

function persist(token, username) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, username);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUsername() {
  return localStorage.getItem(USER_KEY);
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function status() {
  const res = await fetch(`${BASE}/api/admin/status`);
  const json = await res.json().catch(() => ({}));
  return !!json.hasAdmin;
}

export async function bootstrap(username, password) {
  const res = await fetch(`${BASE}/api/admin/bootstrap`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) throw new Error(json.message || "Setup failed");
  persist(json.token, json.username);
  return json.username;
}

export async function login(username, password) {
  const res = await fetch(`${BASE}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) throw new Error(json.message || "Login failed");
  persist(json.token, json.username);
  return json.username;
}

export async function me() {
  const token = getToken();
  if (!token) return null;
  const res = await fetch(`${BASE}/api/admin/me`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) return null;
  const json = await res.json().catch(() => ({}));
  return json.username || null;
}
