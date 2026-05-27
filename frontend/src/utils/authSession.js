/** Client-side JWT expiry check (signature verified by the API). */
export function parseTokenPayload(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export function isTokenValid(token) {
  const payload = parseTokenPayload(token);
  if (!payload) return false;
  if (!payload.exp) return true;
  return Date.now() < payload.exp * 1000;
}

export function readStoredAuth() {
  const token = localStorage.getItem('token');
  if (!token || !isTokenValid(token)) {
    return { token: null, user: null };
  }
  try {
    const raw = localStorage.getItem('user');
    const user = raw ? JSON.parse(raw) : null;
    return { token, user };
  } catch {
    return { token, user: null };
  }
}

export function clearStoredAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}
