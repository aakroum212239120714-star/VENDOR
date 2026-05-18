import { useState, useEffect } from 'react';
import { useLang } from '../contexts/LangContext';
import Spinner from '../components/ui/Spinner';
import Badge from '../components/ui/Badge';
import { getMyOrders } from '../api/orders';
import { getMyProducts } from '../api/products';

/* ── Stat Card ──────────────────────────────────────────────────── */
function StatCard({ icon, value, label, accent }) {
  return (
    <div className="stat-card">
      <div
        className="stat-card-icon"
        style={accent ? { background: accent + '22', color: accent } : undefined}
      >
        {icon}
      </div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label">{label}</div>
    </div>
  );
}

/* ── Status badge colour map ────────────────────────────────────── */
const STATUS_COLOR = {
  pending:   'badge-yellow',
  confirmed: 'badge-blue',
  shipped:   'badge-dark',
  delivered: 'badge-green',
  cancelled: 'badge-red',
};

/* ── Page ───────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const { t } = useLang();

  const [orders,   setOrders]   = useState([]);
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(false);

  /* Fetch both APIs in parallel */
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [oRes, pRes] = await Promise.all([
          getMyOrders(),
          getMyProducts(),
        ]);
        if (!mounted) return;
        setOrders(oRes.data?.orders   ?? []);
        setProducts(pRes.data?.products ?? []);
      } catch {
        if (mounted) setError(true);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  /* ── Derived stats ──────────────────────────────────────────── */
  const revenue = orders
    .filter(o => o.status === 'delivered')
    .reduce((total, o) => {
      const orderSum = (o.items ?? []).reduce(
        (s, item) => s + Number(item.price) * Number(item.quantity),
        0,
      );
      return total + orderSum;
    }, 0);

  const pendingCount = orders.filter(o => o.status === 'pending').length;

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  /* ── Loading ──────────────────────────────────────────────────── */
  if (loading) return <Spinner center brand />;

  /* ── Error ────────────────────────────────────────────────────── */
  if (error) {
    return (
      <div className="page-content">
        <div className="empty-state">
          <div className="empty-icon">⚠️</div>
          <p style={{ fontWeight: 700, fontSize: '1.125rem' }}>
            {t('common', 'error')}
          </p>
        </div>
      </div>
    );
  }

  /* ── Render ───────────────────────────────────────────────────── */
  return (
    <div className="page-content">

      {/* Page header */}
      <div className="page-header">
        <h1 className="page-title">{t('dashboard', 'title')}</h1>
      </div>

      {/* ── Stat cards ──────────────────────────────────────── */}
      <div className="grid-4 mb-6">
        <StatCard
          icon="💰"
          value={`${revenue.toLocaleString()} ${t('dashboard', 'currency')}`}
          label={t('dashboard', 'revenue')}
          accent="#9fe870"
        />
        <StatCard
          icon="📦"
          value={orders.length}
          label={t('dashboard', 'orders')}
        />
        <StatCard
          icon="🛍️"
          value={products.length}
          label={t('dashboard', 'products')}
        />
        <StatCard
          icon="⏳"
          value={pendingCount}
          label={t('dashboard', 'pending')}
          accent="#f5a623"
        />
      </div>

      {/* ── Recent orders ───────────────────────────────────── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>

        {/* Card header */}
        <div
          style={{
            padding: '20px 24px 18px',
            borderBottom: '1px solid var(--gray-100)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <h2
            style={{
              fontSize: '1.0625rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: 'var(--near-black)',
            }}
          >
            {t('dashboard', 'recent_orders')}
          </h2>
          {orders.length > 0 && (
            <span
              style={{
                fontSize: '0.8125rem',
                fontWeight: 700,
                background: 'var(--mint)',
                color: 'var(--brand-text)',
                borderRadius: '999px',
                padding: '2px 9px',
              }}
            >
              {orders.length}
            </span>
          )}
        </div>

        {/* Table or empty */}
        {recentOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <p
              style={{
                fontWeight: 600,
                fontSize: '1rem',
                color: 'var(--near-black)',
              }}
            >
              {t('dashboard', 'no_orders')}
            </p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 88 }}>{t('orders', 'order_id')}</th>
                  <th>{t('orders', 'customer')}</th>
                  <th style={{ textAlign: 'center' }}>{t('orders', 'items')}</th>
                  <th>{t('orders', 'total')}</th>
                  <th>{t('orders', 'status')}</th>
                  <th>{t('orders', 'date')}</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => {
                  const orderTotal = (order.items ?? []).reduce(
                    (s, item) => s + Number(item.price) * Number(item.quantity),
                    0,
                  );
                  return (
                    <tr key={order.id}>
                      {/* Order ID */}
                      <td>
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            fontSize: '0.8125rem',
                            color: 'var(--gray-500)',
                            background: 'var(--gray-100)',
                            borderRadius: 6,
                            padding: '2px 7px',
                          }}
                        >
                          #{order.id}
                        </span>
                      </td>

                      {/* Customer */}
                      <td style={{ fontWeight: 600 }}>
                        {order.customer_name}
                      </td>

                      {/* Items count */}
                      <td style={{ textAlign: 'center', color: 'var(--gray-500)' }}>
                        {order.items?.length ?? 0}
                      </td>

                      {/* Total */}
                      <td style={{ fontWeight: 700, color: 'var(--near-black)' }}>
                        {orderTotal.toLocaleString()}&nbsp;
                        <span style={{ color: 'var(--gray-500)', fontWeight: 500, fontSize: '0.8125rem' }}>
                          {t('dashboard', 'currency')}
                        </span>
                      </td>

                      {/* Status badge */}
                      <td>
                        <Badge
                          status={order.status}
                          label={t('orders', order.status)}
                          color={STATUS_COLOR[order.status]}
                        />
                      </td>

                      {/* Date */}
                      <td
                        style={{
                          color: 'var(--gray-500)',
                          fontSize: '0.875rem',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
