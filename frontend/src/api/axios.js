import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

let onUnauthorized = null;
let handlingUnauthorized = false;

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally (once per burst of failed requests)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (
      err.response?.status === 401 &&
      !err.config?.skipAuthRedirect &&
      !handlingUnauthorized
    ) {
      handlingUnauthorized = true;
      if (onUnauthorized) {
        onUnauthorized();
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (!['/login', '/register'].includes(window.location.pathname)) {
          window.location.href = '/login';
        }
      }
      setTimeout(() => {
        handlingUnauthorized = false;
      }, 500);
    }
    return Promise.reject(err);
  },
);

export default api;
