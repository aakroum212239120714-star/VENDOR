import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export default function WhatsappAIPage() {
  const { token: authToken } = useAuth();
  const { addToast }         = useToast();

  const [waToken,  setWaToken]  = useState('');
  const [phoneId,  setPhoneId]  = useState('');
  const [hasToken, setHasToken] = useState(false);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res  = await fetch('/api/whatsapp/settings', {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        const data = await res.json();
        setPhoneId(data.wa_phone_id || '');
        setHasToken(data.has_token);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [authToken]);

  const handleSave = async () => {
    if (!phoneId) {
      addToast('يرجى إدخال Phone Number ID', 'warning');
      return;
    }
    if (!hasToken && !waToken) {
      addToast('يرجى إدخال Access Token', 'warning');
      return;
    }
    setSaving(true);
    try {
      const body = { wa_phone_id: phoneId };
      if (waToken) body.wa_token = waToken;

      const res = await fetch('/api/whatsapp/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error();
      setHasToken(true);
      setWaToken('');
      addToast('تم حفظ الإعدادات بنجاح ✓', 'success');
    } catch {
      addToast('فشل الحفظ، حاول مجدداً', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <p>جاري التحميل...</p>
    </div>
  );

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">WhatsApp Business</h1>
        <p style={{ color: 'var(--gray-500)', marginTop: 4, fontSize: '0.95rem' }}>
          ربط متجرك بـ WhatsApp Business API عبر Meta
        </p>
      </div>

      <div className="card" style={{ maxWidth: 520, margin: '0 auto', padding: '32px 28px', borderRadius: 20 }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>بيانات الاتصال</h2>
          {hasToken
            ? <span style={{ background: '#d1fae5', color: '#065f46', fontSize: 12, padding: '4px 12px', borderRadius: 999, fontWeight: 600 }}>✓ مكتملة</span>
            : <span style={{ background: '#fef3c7', color: '#92400e', fontSize: 12, padding: '4px 12px', borderRadius: 999, fontWeight: 600 }}>غير مكتملة</span>
          }
        </div>

        {/* Access Token */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 7 }}>
            Access Token
            {hasToken && <span style={{ color: 'var(--gray-400)', fontWeight: 400, marginRight: 6 }}>(محفوظ — اتركه فارغاً للإبقاء عليه)</span>}
          </label>
          <input
            type="password"
            placeholder="EAAxxxxxxxxxxxxxxxx..."
            value={waToken}
            onChange={e => setWaToken(e.target.value)}
            style={{
              width: '100%', padding: '11px 14px',
              borderRadius: 12, border: '1.5px solid var(--gray-300)',
              fontSize: 14, outline: 'none', transition: 'border-color 0.2s'
            }}
            onFocus={e => e.target.style.borderColor = 'var(--brand, #10b981)'}
            onBlur={e  => e.target.style.borderColor = 'var(--gray-300)'}
          />
          <small style={{ color: 'var(--gray-400)', fontSize: 12, marginTop: 5, display: 'block' }}>
            من صفحة تطبيقك في Meta ← WhatsApp ← API Setup
          </small>
        </div>

        {/* Phone Number ID */}
        <div style={{ marginBottom: 28 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 7 }}>
            Phone Number ID
          </label>
          <input
            type="text"
            placeholder="1234567890123456"
            value={phoneId}
            onChange={e => setPhoneId(e.target.value)}
            style={{
              width: '100%', padding: '11px 14px',
              borderRadius: 12, border: '1.5px solid var(--gray-300)',
              fontSize: 14, outline: 'none', transition: 'border-color 0.2s'
            }}
            onFocus={e => e.target.style.borderColor = 'var(--brand, #10b981)'}
            onBlur={e  => e.target.style.borderColor = 'var(--gray-300)'}
          />
          <small style={{ color: 'var(--gray-400)', fontSize: 12, marginTop: 5, display: 'block' }}>
            من نفس الصفحة أسفل الـ Access Token
          </small>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: '100%',
            background: saving ? '#9ca3af' : 'var(--brand, #10b981)',
            color: '#fff',
            padding: '13px',
            borderRadius: 999,
            fontWeight: 700,
            fontSize: '1rem',
            border: 'none',
            cursor: saving ? 'not-allowed' : 'pointer',
            boxShadow: saving ? 'none' : '0 4px 12px rgba(16,185,129,0.2)',
            transition: 'all 0.2s'
          }}
        >
          {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </button>

      </div>
    </div>
  );
}