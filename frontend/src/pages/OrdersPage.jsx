import { useState, useEffect, useCallback } from "react";
import { useLang } from "../contexts/LangContext";
import { useToast } from "../contexts/ToastContext";
import Spinner from "../components/ui/Spinner";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import { getMyOrders, updateOrderStatus } from "../api/orders";

/* ─── Constants ─────────────────────────────── */

const STATUS_TABS = [
  "all",
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

/* ─── Helpers ───────────────────────────────── */

function calcTotal(items = []) {
  return items.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0,
  );
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/* ─── Component ─────────────────────────────── */

export default function OrdersPage() {
  const { t } = useLang();
  const { addToast } = useToast();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  /* ── Fetch ───────────────────────────────── */

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMyOrders();
      setOrders(res.data.orders || []);
    } catch {
      addToast(t("common", "error"), "error");
    } finally {
      setLoading(false);
    }
  }, [addToast, t]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  /* ── Status update ───────────────────────── */

  const handleStatusChange = useCallback(
    async (id, newStatus) => {
      // Optimistic update — instant UI feedback
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o)),
      );
      setUpdatingId(id);
      try {
        await updateOrderStatus(id, newStatus);
        addToast(`${t("orders", "update")} ✓`, "success");
      } catch {
        addToast(t("common", "error"), "error");
        fetchOrders(); // revert on failure
      } finally {
        setUpdatingId(null);
      }
    },
    [addToast, t, fetchOrders],
  );

  /* ── Derived state ───────────────────────── */

  const filtered =
    activeTab === "all" ? orders : orders.filter((o) => o.status === activeTab);

  const countFor = (tab) =>
    tab === "all"
      ? orders.length
      : orders.filter((o) => o.status === tab).length;

  /* ── Render ──────────────────────────────── */

  return (
    <div className="page-content">
      {/* ── Page Header ── */}
      <div className="page-header">
        <h1 className="page-title">{t("orders", "title")}</h1>
        <span
          style={{
            color: "var(--gray-500)",
            fontSize: "0.9rem",
            fontWeight: 500,
          }}
        >
          {orders.length} {t("orders", "all").toLowerCase()}
        </span>
      </div>

      {/* ── Status Filter Tabs ── */}
      <div className="tabs" style={{ marginBottom: "1.75rem" }}>
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            className={`tab-btn${activeTab === tab ? " active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {t("orders", tab)}
            <span
              className={`badge ${activeTab === tab ? "badge-dark" : "badge-gray"}`}
              style={{ fontSize: "0.72rem", padding: "1px 7px" }}
            >
              {countFor(tab)}
            </span>
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      {loading ? (
        <Spinner center brand />
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <p
            style={{ color: "var(--gray-500)", fontWeight: 500, marginTop: 8 }}
          >
            {t("orders", "no_orders")}
          </p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t("orders", "order_id")}</th>
                <th>{t("orders", "customer")}</th>
                <th>{t("orders", "items")}</th>
                <th>{t("orders", "total")}</th>
                <th>{t("orders", "status")}</th>
                <th>{t("orders", "date")}</th>
                <th>{t("orders", "update")}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id}>
                  {/* Order ID */}
                  <td>
                    <span
                      style={{
                        fontWeight: 800,
                        fontSize: "0.875rem",
                        color: "var(--near-black)",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      #{order.id}
                    </span>
                  </td>

                  {/* Customer */}
                  <td style={{ fontWeight: 500 }}>{order.customer_name}</td>

                  {/* Items count */}
                  <td>
                    <span className="badge badge-gray">
                      {order.items.length}
                    </span>
                  </td>

                  {/* Total */}
                  <td>
                    <span
                      style={{ fontWeight: 700, color: "var(--near-black)" }}
                    >
                      {calcTotal(order.items).toFixed(2)}
                    </span>
                    <span
                      style={{
                        color: "var(--gray-500)",
                        fontSize: "0.8rem",
                        marginInlineStart: 4,
                      }}
                    >
                      DZD
                    </span>
                  </td>

                  {/* Status badge */}
                  <td>
                    <Badge
                      status={order.status}
                      label={t("orders", order.status)}
                    />
                  </td>

                  {/* Date */}
                  <td
                    style={{ color: "var(--gray-500)", fontSize: "0.875rem" }}
                  >
                    {formatDate(order.created_at)}
                  </td>

                  {/* Status select */}
                  <td>
                    {updatingId === order.id ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <Spinner size="sm" />
                        <span
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--gray-500)",
                          }}
                        >
                          {t("orders", "updating")}
                        </span>
                      </div>
                    ) : (
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order.id, e.target.value)
                        }
                        style={{
                          padding: "5px 10px",
                          borderRadius: 8,
                          border: "1px solid #e8ebe6",
                          fontSize: "0.875rem",
                          cursor: "pointer",
                          background: "white",
                        }}
                      >
                        <option value="pending">
                          {t("orders", "pending")}
                        </option>
                        <option value="confirmed">
                          {t("orders", "confirmed")}
                        </option>
                        <option value="shipped">
                          {t("orders", "shipped")}
                        </option>
                        <option value="delivered">
                          {t("orders", "delivered")}
                        </option>
                        <option value="cancelled">
                          {t("orders", "cancelled")}
                        </option>
                      </select>
                    )}
                  </td>

                  {/* Details button */}
                  <td>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setSelectedOrder(order)}
                    >
                      {t("orders", "details")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Order Details Modal ── */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={
          selectedOrder
            ? `${t("orders", "details")} — #${selectedOrder.id}`
            : ""
        }
        size="lg"
      >
        {selectedOrder && (
          <div style={{ padding: "0 1.5rem 1.75rem" }}>
            {/* Customer info grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.875rem",
                background: "var(--gray-50)",
                border: "1px solid var(--gray-200)",
                borderRadius: 16,
                padding: "1.125rem 1.25rem",
                marginBottom: "1.5rem",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "0.7rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    fontWeight: 700,
                    color: "var(--gray-500)",
                    marginBottom: 4,
                  }}
                >
                  {t("orders", "customer")}
                </p>
                <p style={{ fontWeight: 600 }}>{selectedOrder.customer_name}</p>
              </div>

              <div>
                <p
                  style={{
                    fontSize: "0.7rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    fontWeight: 700,
                    color: "var(--gray-500)",
                    marginBottom: 4,
                  }}
                >
                  {t("orders", "phone")}
                </p>
                <p style={{ fontWeight: 600 }}>
                  {selectedOrder.customer_phone}
                </p>
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <p
                  style={{
                    fontSize: "0.7rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    fontWeight: 700,
                    color: "var(--gray-500)",
                    marginBottom: 4,
                  }}
                >
                  {t("orders", "address")}
                </p>
                <p style={{ fontWeight: 500 }}>
                  {selectedOrder.customer_address}
                </p>
              </div>
            </div>

            {/* Items table */}
            <div className="table-wrap" style={{ marginBottom: "1.25rem" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t("orders", "product")}</th>
                    <th>{t("orders", "qty")}</th>
                    <th>{t("orders", "price")}</th>
                    <th style={{ textAlign: "end" }}>{t("orders", "total")}</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 500 }}>{item.name}</td>
                      <td>
                        <span className="badge badge-gray">
                          {item.quantity}
                        </span>
                      </td>
                      <td>
                        {Number(item.price).toFixed(2)}
                        <span
                          style={{
                            color: "var(--gray-500)",
                            fontSize: "0.8rem",
                            marginInlineStart: 3,
                          }}
                        >
                          DZD
                        </span>
                      </td>
                      <td style={{ textAlign: "end", fontWeight: 700 }}>
                        {(Number(item.price) * Number(item.quantity)).toFixed(
                          2,
                        )}
                        <span
                          style={{
                            color: "var(--gray-500)",
                            fontSize: "0.8rem",
                            marginInlineStart: 3,
                          }}
                        >
                          DZD
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Grand total */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "baseline",
                gap: "1rem",
                paddingTop: "1rem",
                borderTop: "2px solid var(--gray-200)",
              }}
            >
              <span
                style={{
                  color: "var(--gray-500)",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                }}
              >
                {t("orders", "total")}
              </span>
              <span
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  color: "var(--near-black)",
                }}
              >
                {calcTotal(selectedOrder.items).toFixed(2)}
                <span
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 500,
                    color: "var(--gray-500)",
                    marginInlineStart: 6,
                  }}
                >
                  DZD
                </span>
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
