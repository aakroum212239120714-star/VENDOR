import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { setUnauthorizedHandler } from '../api/axios';
import { fetchMe } from '../api/auth';
import {
  readStoredAuth,
  clearStoredAuth,
  isTokenValid,
} from '../utils/authSession';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authReady, setAuthReady] = useState(false);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  const logout = useCallback(() => {
    clearStoredAuth();
    setToken(null);
    setUser(null);
  }, []);

  // Restore session only after the API confirms the JWT is valid
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { token: storedToken } = readStoredAuth();
      if (!storedToken) {
        clearStoredAuth();
        if (!cancelled) setAuthReady(true);
        return;
      }

      try {
        const { data } = await fetchMe();
        if (cancelled) return;
        setToken(storedToken);
        setUser(data.user);
      } catch {
        if (cancelled) return;
        clearStoredAuth();
        setToken(null);
        setUser(null);
      } finally {
        if (!cancelled) setAuthReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback((newToken, newUser) => {
    if (!isTokenValid(newToken)) {
      return;
    }
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
      if (!['/login', '/register'].includes(window.location.pathname)) {
        window.location.href = '/login';
      }
    });
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const isAuthenticated = Boolean(token);

  return (
    <AuthContext.Provider
      value={{ token, user, login, logout, isAuthenticated, authReady }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
