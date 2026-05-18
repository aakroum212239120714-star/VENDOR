import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useLang } from '../../contexts/LangContext';
import { useAuth } from '../../contexts/AuthContext';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t, toggleLang, lang } = useLang();
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(14,15,12,0.5)',
            zIndex: 99,
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="main-content">
        {/* Topbar */}
        <header className="topbar">
          {/* Mobile menu button */}
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setSidebarOpen(prev => !prev)}
            style={{
              display: 'none',
              padding: '6px 10px',
              borderRadius: 10,
            }}
            aria-label="Toggle menu"
            id="menu-toggle"
          >
            ☰
          </button>

          {/* Breadcrumb placeholder */}
          <div style={{ flex: 1 }} />

          {/* Right controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Lang toggle */}
            <button
              onClick={toggleLang}
              style={{
                padding: '6px 14px',
                borderRadius: 9999,
                border: '1px solid var(--gray-200)',
                background: 'transparent',
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: 'var(--gray-700)',
                cursor: 'pointer',
                transition: 'all 0.12s',
                fontFeatureSettings: '"calt"',
              }}
            >
              {lang === 'ar' ? 'EN' : 'عر'}
            </button>

            {/* Store link */}
            <button
              onClick={() => navigate('/store')}
              className="btn btn-primary btn-sm"
              style={{ gap: 6 }}
            >
              <span style={{ fontSize: '0.8rem' }}>◎</span>
              {t('nav', 'store')}
            </button>
          </div>
        </header>

        {/* Page */}
        <main className="page-content">
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (max-width: 992px) {
          #menu-toggle { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
