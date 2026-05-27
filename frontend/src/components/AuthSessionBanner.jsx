import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LangContext';

/** Shown on login/register when a session already exists — never auto-redirects. */
export default function AuthSessionBanner() {
  const { isAuthenticated, authReady, user, logout } = useAuth();
  const { lang } = useLang();

  if (!authReady || !isAuthenticated) return null;

  const copy =
    lang === 'ar'
      ? {
          signedIn: 'أنت مسجّل الدخول بالفعل كـ',
          dashboard: 'الذهاب إلى لوحة التحكم',
          signOut: 'تسجيل الخروج لاستخدام حساب آخر',
        }
      : {
          signedIn: 'You are already signed in as',
          dashboard: 'Go to dashboard',
          signOut: 'Sign out to use another account',
        };

  return (
    <div
      style={{
        marginBottom: 20,
        padding: '14px 16px',
        borderRadius: 14,
        background: '#e2f6d5',
        border: '1px solid rgba(22, 51, 0, 0.12)',
        fontSize: '0.9rem',
        lineHeight: 1.55,
        color: '#163300',
      }}
    >
      <p style={{ margin: '0 0 10px' }}>
        {copy.signedIn}{' '}
        <strong>{user?.name || user?.email}</strong>.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
        <Link
          to="/dashboard"
          style={{ fontWeight: 700, color: '#0e0f0c', textDecoration: 'underline' }}
        >
          {copy.dashboard}
        </Link>
        <button
          type="button"
          onClick={logout}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            fontWeight: 600,
            color: '#454745',
            cursor: 'pointer',
            textDecoration: 'underline',
            fontSize: 'inherit',
          }}
        >
          {copy.signOut}
        </button>
      </div>
    </div>
  );
}
