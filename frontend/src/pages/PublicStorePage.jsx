import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicProducts, placeOrder } from '../api/public';
import { useLang } from '../contexts/LangContext';
import Spinner from '../components/ui/Spinner';

// ─── Theme Defaults ───────────────────────────────────────────────────────────

const DEFAULTS = {
  primary_color: '#9fe870',
  card_bg:       '#ffffff',
  page_bg:       '#f9faf8',
  corner_radius: 16,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isLightColor(hex) {
  if (!hex || !hex.startsWith('#') || hex.length < 7) return true;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}

function getTheme(store) {
  return {
    primary:  store?.primary_color || DEFAULTS.primary_color,
    cardBg:   store?.card_bg       || DEFAULTS.card_bg,
    pageBg:   store?.page_bg       || DEFAULTS.page_bg,
    radius:   Number(store?.corner_radius) || DEFAULTS.corner_radius,
  };
}

// ─── Shared Input Styles ──────────────────────────────────────────────────────

const labelStyle = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: 600,
  color: '#555',
  marginBottom: '5px',
};

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '10px 12px',
  border: '1.5px solid #e5e7eb',
  borderRadius: '10px',
  fontSize: '0.9rem',
  marginBottom: '14px',
  outline: 'none',
  fontFamily: 'inherit',
  background: '#fff',
  color: '#111',
};

function qtyBtnStyle(primary, textColor) {
  return {
    background: primary,
    color: textColor,
    border: 'none',
    borderRadius: '8px',
    width: '34px',
    height: '34px',
    fontWeight: 800,
    fontSize: '1.15rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    lineHeight: 1,
  };
}

// ─── Order Modal ──────────────────────────────────────────────────────────────

function OrderModal({ product, store, slug, onClose, t, dir }) {
  const { primary, radius } = getTheme(store);
  const btnColor = isLightColor(primary) ? '#163300' : '#ffffff';

  const [qty,     setQty]     = useState(1);
  const [name,    setName]    = useState('');
  const [phone,   setPhone]   = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState('');

  const total = (product.price * qty).toFixed(2);

  // Lock body scroll + ESC to close
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await placeOrder(slug, {
        customer_name:    name,
        customer_phone:   phone,
        customer_address: address,
        items: [{ product_id: product.id, quantity: qty }],
      });
      setSuccess(true);
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(0,0,0,0.48)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backdropFilter: 'blur(2px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: radius + 4 + 'px',
          width: '100%',
          maxWidth: '460px',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 24px 64px rgba(0,0,0,0.22)',
          direction: dir,
        }}
      >
        {/* ── Modal Header ── */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '12px',
          position: 'sticky',
          top: 0,
          background: '#fff',
          zIndex: 1,
        }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: '0.72rem', color: '#999', margin: 0, marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {t('public', 'order_title')}
            </p>
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {product.name}
            </h2>
            <p style={{ margin: 0, marginTop: '4px', fontWeight: 700, color: primary, fontSize: '1rem' }}>
              {product.price} <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{t('public', 'sar')}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: '#f5f5f5',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.9rem',
              color: '#777',
              padding: '6px 10px',
              borderRadius: '8px',
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        {/* ── Success State ── */}
        {success ? (
          <div style={{ padding: '48px 28px', textAlign: 'center' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '14px' }}>✅</div>
            <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#111' }}>
              {t('public', 'success_title')}
            </h3>
            <p style={{ color: '#666', marginTop: '10px', marginBottom: '32px', lineHeight: 1.7, fontSize: '0.95rem' }}>
              {t('public', 'success_msg')}
            </p>
            <button
              onClick={onClose}
              style={{
                background: primary,
                color: btnColor,
                border: 'none',
                borderRadius: '999px',
                padding: '13px 28px',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              {t('public', 'back')}
            </button>
          </div>
        ) : (
          /* ── Order Form ── */
          <form onSubmit={handleSubmit} style={{ padding: '20px 24px' }}>

            {/* Quantity row */}
            <label style={labelStyle}>{t('public', 'qty')}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                style={qtyBtnStyle(primary, btnColor)}
              >
                −
              </button>
              <span style={{ fontWeight: 800, fontSize: '1.15rem', minWidth: '28px', textAlign: 'center', color: '#111' }}>
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                style={qtyBtnStyle(primary, btnColor)}
              >
                +
              </button>
              <div style={{
                marginInlineStart: 'auto',
                background: '#f8f8f8',
                borderRadius: '10px',
                padding: '7px 14px',
                fontSize: '0.85rem',
                color: '#555',
                whiteSpace: 'nowrap',
              }}>
                {t('public', 'total')}:&nbsp;
                <strong style={{ color: '#111', fontWeight: 800 }}>
                  {total} {t('public', 'sar')}
                </strong>
              </div>
            </div>

            {/* Customer name */}
            <label style={labelStyle}>{t('public', 'customer_name')}</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
              placeholder={t('public', 'customer_name')}
            />

            {/* Phone */}
            <label style={labelStyle}>{t('public', 'phone')}</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ ...inputStyle, direction: 'ltr' }}
              placeholder="05XXXXXXXX"
            />

            {/* Address */}
            <label style={labelStyle}>{t('public', 'address')}</label>
            <textarea
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
              placeholder={t('public', 'address')}
            />

            {/* Error */}
            {error && (
              <p style={{
                color: '#dc2626',
                fontSize: '0.84rem',
                marginBottom: '12px',
                marginTop: '-6px',
                background: '#fef2f2',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #fecaca',
              }}>
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: primary,
                color: btnColor,
                border: 'none',
                borderRadius: '999px',
                padding: '13px 24px',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.72 : 1,
                marginTop: '2px',
                transition: 'opacity 0.15s',
              }}
            >
              {loading ? t('public', 'submitting') : t('public', 'submit')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({ product, store, onOrder, t }) {
  const { primary, cardBg, radius } = getTheme(store);
  const btnColor   = isLightColor(primary) ? '#163300' : '#ffffff';
  const outOfStock = product.stock <= 0;

  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: cardBg,
        borderRadius: radius + 'px',
        overflow: 'hidden',
        boxShadow: hovered
          ? '0 8px 28px rgba(0,0,0,0.13)'
          : '0 2px 10px rgba(0,0,0,0.07)',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Image ── */}
      <div style={{ aspectRatio: '4/3', overflow: 'hidden', background: '#f3f4f6', position: 'relative' }}>
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.8rem',
            background: '#f5f5f5',
          }}>
            📦
          </div>
        )}

        {/* Out of stock badge */}
        {outOfStock && (
          <div style={{
            position: 'absolute',
            top: '8px',
            insetInlineStart: '8px',
            background: 'rgba(17,17,17,0.68)',
            backdropFilter: 'blur(4px)',
            color: '#fff',
            fontSize: '0.7rem',
            fontWeight: 700,
            padding: '3px 10px',
            borderRadius: '999px',
            letterSpacing: '0.04em',
          }}>
            {t('public', 'out_of_stock')}
          </div>
        )}
      </div>

      {/* ── Info ── */}
      <div style={{
        padding: '14px 16px 16px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
      }}>
        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: '#111', lineHeight: 1.3 }}>
          {product.name}
        </p>

        {product.description && (
          <p style={{
            margin: 0,
            fontSize: '0.78rem',
            color: '#888',
            lineHeight: 1.55,
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 2,
            overflow: 'hidden',
          }}>
            {product.description}
          </p>
        )}

        <p style={{
          margin: 0,
          fontWeight: 800,
          fontSize: '1.05rem',
          color: '#111',
          marginTop: 'auto',
          paddingTop: '8px',
        }}>
          {product.price}
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#666', marginInlineStart: '4px' }}>
            {t('public', 'sar')}
          </span>
        </p>

        {!outOfStock && (
          <button
            onClick={() => onOrder(product)}
            style={{
              background: primary,
              color: btnColor,
              border: 'none',
              borderRadius: '999px',
              padding: '10px 16px',
              fontWeight: 700,
              fontSize: '0.87rem',
              cursor: 'pointer',
              width: '100%',
              marginTop: '8px',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.88')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            {t('public', 'order_btn')}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Public Store Page ────────────────────────────────────────────────────────

export default function PublicStorePage() {
  const { slug }               = useParams();
  const { t, lang, dir, toggleLang } = useLang();

  const [store,    setStore]    = useState(null);
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selected, setSelected] = useState(null); // product currently being ordered

  // ── Fetch store + products ─────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);

    getPublicProducts(slug)
      .then((res) => {
        if (cancelled) return;
        setStore(res.data.store);
        setProducts(res.data.products || []);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err?.response?.status === 404) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [slug]);

  const handleCloseModal = useCallback(() => setSelected(null), []);

  // ── Derived theme values ───────────────────────────────────────────────────
  const { primary, pageBg, radius } = getTheme(store);
  const btnColor = isLightColor(primary) ? '#163300' : '#ffffff';

  const initials = store?.name
    ? store.name.trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : '??';

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: DEFAULTS.page_bg,
        gap: '16px',
        direction: dir,
      }}>
        <Spinner size="lg" brand />
        <p style={{ color: '#999', fontSize: '0.95rem', margin: 0 }}>
          {t('public', 'loading')}
        </p>
      </div>
    );
  }

  // ── Not found ──────────────────────────────────────────────────────────────
  if (notFound || !store) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: DEFAULTS.page_bg,
        gap: '12px',
        direction: dir,
        padding: '24px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '3.5rem' }}>🔍</div>
        <h2 style={{ margin: 0, fontWeight: 800, color: '#111', fontSize: '1.4rem' }}>
          {t('public', 'not_found')}
        </h2>
        <a
          href="/"
          style={{
            marginTop: '8px',
            color: DEFAULTS.primary_color,
            fontWeight: 600,
            textDecoration: 'none',
            fontSize: '0.95rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          ← Home
        </a>
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: pageBg, direction: dir }}>

      {/* ── Navbar ──────────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: '#fff',
        boxShadow: '0 1px 0 rgba(0,0,0,0.08), 0 2px 10px rgba(0,0,0,0.05)',
        padding: '0 20px',
        height: '62px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
      }}>
        {/* Left: logo + store name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          {store.logo ? (
            <img
              src={store.logo}
              alt={store.name}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: `${Math.min(radius, 12)}px`,
                objectFit: 'cover',
                border: '1.5px solid #eee',
                flexShrink: 0,
              }}
            />
          ) : (
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: `${Math.min(radius, 12)}px`,
              background: primary,
              color: btnColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.85rem',
              flexShrink: 0,
              letterSpacing: '0.02em',
            }}>
              {initials}
            </div>
          )}
          <span style={{
            fontWeight: 800,
            fontSize: '1rem',
            color: '#111',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {store.name}
          </span>
        </div>

        {/* Right: lang toggle + powered badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <button
            onClick={toggleLang}
            style={{
              background: 'none',
              border: '1.5px solid #e5e7eb',
              borderRadius: '8px',
              padding: '5px 12px',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              color: '#555',
              transition: 'background 0.15s, border-color 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f5f5f5';
              e.currentTarget.style.borderColor = '#ccc';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.borderColor = '#e5e7eb';
            }}
          >
            {lang === 'ar' ? 'EN' : 'ع'}
          </button>

          <span style={{
            fontSize: '0.7rem',
            fontWeight: 600,
            background: '#f3f4f6',
            color: '#9ca3af',
            padding: '4px 10px',
            borderRadius: '999px',
            whiteSpace: 'nowrap',
            border: '1px solid #e5e7eb',
          }}>
            Powered by Vendors
          </span>
        </div>
      </nav>

      {/* ── Banner ──────────────────────────────────────────────────────────── */}
      {store.banner && (
        <div style={{ position: 'relative', width: '100%', height: '300px', overflow: 'hidden' }}>
          <img
            src={store.banner}
            alt="store banner"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          {/* Gradient overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.58) 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px 24px',
            textAlign: 'center',
          }}>
            {store.banner_title && (
              <h1 style={{
                margin: 0,
                color: '#fff',
                fontSize: 'clamp(1.5rem, 5vw, 2.4rem)',
                fontWeight: 900,
                letterSpacing: '-0.02em',
                textShadow: '0 2px 12px rgba(0,0,0,0.35)',
                lineHeight: 1.2,
              }}>
                {store.banner_title}
              </h1>
            )}
            {store.banner_subtitle && (
              <p style={{
                margin: 0,
                marginTop: '10px',
                color: 'rgba(255,255,255,0.9)',
                fontSize: 'clamp(0.9rem, 2.5vw, 1.15rem)',
                textShadow: '0 1px 6px rgba(0,0,0,0.3)',
                maxWidth: '580px',
                lineHeight: 1.6,
              }}>
                {store.banner_subtitle}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Products Section ─────────────────────────────────────────────────── */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '36px 20px 72px' }}>

        {/* Store description */}
        {store.description && (
          <p style={{
            color: '#666',
            fontSize: '0.95rem',
            marginBottom: '28px',
            marginTop: 0,
            lineHeight: 1.75,
            maxWidth: '640px',
          }}>
            {store.description}
          </p>
        )}

        {/* Products grid or empty state */}
        {products.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '80px 24px',
            color: '#bbb',
          }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '14px' }}>🛍️</div>
            <p style={{ margin: 0, fontSize: '1rem', fontWeight: 500 }}>
              {t('public', 'empty')}
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '16px',
          }}>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                store={store}
                onOrder={(p) => setSelected(p)}
                t={t}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── Order Modal ──────────────────────────────────────────────────────── */}
      {selected && (
        <OrderModal
          product={selected}
          store={store}
          slug={slug}
          onClose={handleCloseModal}
          t={t}
          dir={dir}
        />
      )}
    </div>
  );
}
