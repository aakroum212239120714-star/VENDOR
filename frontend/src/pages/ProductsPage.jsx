import { useState, useEffect, useCallback, useRef } from "react";
import { useLang } from "../contexts/LangContext";
import { useToast } from "../contexts/ToastContext";
import Spinner from "../components/ui/Spinner";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import {
  getMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../api/products";

/* ─────────────────────────────────────────────────────────────────
   Constants
───────────────────────────────────────────────────────────────── */
const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  stock: "",
  category: "",
};

/* ─────────────────────────────────────────────────────────────────
   ProductFormFields  (shared by Add & Edit modals)
───────────────────────────────────────────────────────────────── */
function ProductFormFields({
  t,
  form,
  setForm,
  errors,
  imagePreview,
  currentImage,
  onFileChange,
  submitting,
  mode, // 'add' | 'edit'
  onClose,
  onSubmit,
}) {
  return (
    <form
      onSubmit={onSubmit}
      noValidate
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 18,
        padding: "20px 24px 28px",
      }}
    >
      {/* ── Name ──────────────────────────────────────────── */}
      <div className="input-group">
        <label className="input-label">
          {t("products", "name")}
          <span style={{ color: "var(--danger)", marginInlineStart: 3 }}>
            *
          </span>
        </label>
        <input
          className="input-field"
          style={errors.name ? { borderColor: "var(--danger)" } : undefined}
          type="text"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder={t("products", "name")}
          autoFocus={mode === "add"}
        />
        {errors.name && (
          <p
            style={{
              color: "var(--danger)",
              fontSize: "0.8125rem",
              marginTop: 4,
            }}
          >
            {t("products", "name")} required
          </p>
        )}
      </div>

      {/* ── Description ───────────────────────────────────── */}
      <div className="input-group">
        <label className="input-label">{t("products", "desc")}</label>
        <textarea
          className="input-field"
          rows={3}
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
          placeholder={t("products", "desc")}
          style={{ resize: "vertical", minHeight: 72 }}
        />
      </div>

      {/* ── Price + Stock + Category ──────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        {/* Price */}
        <div className="input-group">
          <label className="input-label">
            {t("products", "price")}
            <span style={{ color: "var(--danger)", marginInlineStart: 3 }}>
              *
            </span>
          </label>
          <input
            className="input-field"
            style={errors.price ? { borderColor: "var(--danger)" } : undefined}
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            placeholder="0.00"
          />
          {errors.price && (
            <p
              style={{
                color: "var(--danger)",
                fontSize: "0.8125rem",
                marginTop: 4,
              }}
            >
              {t("products", "price")} required
            </p>
          )}
        </div>

        {/* Stock */}
        <div className="input-group">
          <label className="input-label">{t("products", "stock")}</label>
          <input
            className="input-field"
            type="number"
            min="0"
            step="1"
            value={form.stock}
            onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
            placeholder="0"
          />
        </div>
      </div>

      {/* ── Category ──────────────────────────────────────── */}
      <div className="input-group">
        <label className="input-label">{t("products", "category")}</label>
        <input
          className="input-field"
          type="text"
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          placeholder={t("products", "category")}
        />
      </div>

      {/* ── Image upload ──────────────────────────────────── */}
      <div className="input-group">
        <label className="input-label">{t("products", "image")}</label>

        {/* Current image (edit mode, no new file chosen yet) */}
        {mode === "edit" && currentImage && !imagePreview && (
          <div
            style={{
              marginBottom: 10,
              borderRadius: 10,
              overflow: "hidden",
              height: 140,
              background: "var(--gray-100)",
              position: "relative",
            }}
          >
            <img
              src={currentImage}
              alt="current"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <span
              style={{
                position: "absolute",
                top: 8,
                insetInlineStart: 8,
                background: "rgba(14,15,12,.55)",
                color: "#fff",
                fontSize: "0.75rem",
                fontWeight: 600,
                borderRadius: 6,
                padding: "3px 8px",
              }}
            >
              {t("products", "image")}
            </span>
          </div>
        )}

        {/* New image preview */}
        {imagePreview && (
          <div
            style={{
              marginBottom: 10,
              borderRadius: 10,
              overflow: "hidden",
              height: 160,
              background: "var(--gray-100)",
            }}
          >
            <img
              src={imagePreview}
              alt="preview"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        )}

        {/* File input */}
        <input
          className="input-field"
          type="file"
          accept="image/*"
          onChange={onFileChange}
          style={{ cursor: "pointer" }}
        />
        <p
          style={{
            fontSize: "0.8125rem",
            color: "var(--gray-500)",
            marginTop: 4,
          }}
        >
          {t("products", "image_hint")}
        </p>
      </div>

      {/* ── Footer buttons ────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          gap: 8,
          justifyContent: "flex-end",
          paddingTop: 4,
        }}
      >
        <button
          type="button"
          className="btn btn-ghost"
          onClick={onClose}
          disabled={submitting}
        >
          {t("products", "cancel")}
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={submitting}
          style={{ minWidth: 110 }}
        >
          {submitting
            ? mode === "add"
              ? t("products", "adding")
              : t("products", "saving")
            : mode === "add"
              ? t("products", "add")
              : t("products", "save")}
        </button>
      </div>
    </form>
  );
}

/* ─────────────────────────────────────────────────────────────────
   ProductsPage
───────────────────────────────────────────────────────────────── */
export default function ProductsPage() {
  const { t } = useLang();
  const { addToast } = useToast();

  /* ── Data state ─────────────────────────────────────────── */
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  /* ── Modal flags ────────────────────────────────────────── */
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  /* ── Selected product (edit / delete) ───────────────────── */
  const [selected, setSelected] = useState(null);

  /* ── Form state ─────────────────────────────────────────── */
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  /* Keep object-URL refs so we can revoke them */
  const previewUrlRef = useRef(null);

  /* ── Fetch ──────────────────────────────────────────────── */
  const fetchProducts = useCallback(async () => {
    try {
      const res = await getMyProducts();
      setProducts(res.data?.products ?? []);
    } catch {
      addToast(t("common", "error"), "error");
    } finally {
      setLoading(false);
    }
  }, [addToast, t]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  /* ── Client-side search filter ──────────────────────────── */
  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  /* ── Form helpers ───────────────────────────────────────── */
  const revokePreview = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setImageFile(null);
    revokePreview();
    setImagePreview(null);
    setErrors({});
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    revokePreview();
    const url = URL.createObjectURL(file);
    previewUrlRef.current = url;
    setImageFile(file);
    setImagePreview(url);
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = true;
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0) {
      errs.price = true;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* ── Open / close handlers ──────────────────────────────── */
  const openAdd = () => {
    resetForm();
    setAddOpen(true);
  };

  const closeAdd = () => {
    setAddOpen(false);
    resetForm();
  };

  const openEdit = (product) => {
    resetForm();
    setSelected(product);
    setForm({
      name: product.name ?? "",
      description: product.description ?? "",
      price: product.price != null ? String(product.price) : "",
      stock: product.stock != null ? String(product.stock) : "",
      category: product.category ?? "",
    });
    setEditOpen(true);
  };

  const closeEdit = () => {
    setEditOpen(false);
    resetForm();
    setSelected(null);
  };

  const openDelete = (product) => {
    setSelected(product);
    setDeleteOpen(true);
  };

  const closeDelete = () => {
    setDeleteOpen(false);
    setSelected(null);
  };

  /* ── Submit: Add ────────────────────────────────────────── */
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("description", form.description.trim());
      fd.append("price", form.price);
      fd.append("stock", form.stock || "0");
      fd.append("category", form.category || "");
      if (imageFile) fd.append("image", imageFile);
      await createProduct(fd);
      await fetchProducts();
      closeAdd();
      addToast(t("products", "add") + " ✓", "success");
    } catch {
      addToast(t("common", "error"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Submit: Edit ───────────────────────────────────────── */
  const handleEdit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("description", form.description.trim());
      fd.append("price", form.price);
      fd.append("stock", form.stock || "0");
      fd.append("category", form.category || "");
      if (imageFile) fd.append("image", imageFile);
      await updateProduct(selected.id, fd);
      await fetchProducts();
      closeEdit();
      addToast(t("products", "save") + " ✓", "success");
    } catch {
      addToast(t("common", "error"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Submit: Delete ─────────────────────────────────────── */
  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await deleteProduct(selected.id);
      await fetchProducts();
      closeDelete();
      addToast(t("products", "delete") + " ✓", "success");
    } catch {
      addToast(t("common", "error"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Toggle active / inactive ───────────────────────────── */
  const handleToggleStatus = async (product) => {
    const nextActive = product.is_active === 0 ? 1 : 0;

    // optimistic UI update
    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id ? { ...p, is_active: nextActive } : p,
      ),
    );

    try {
      const fd = new FormData();
      fd.append("name", product.name || "");
      fd.append("description", product.description || "");
      fd.append("price", String(product.price ?? 0));
      fd.append("stock", String(product.stock ?? 0));
      fd.append("category", product.category || "");
      fd.append("is_active", String(nextActive));

      await updateProduct(product.id, fd);
      addToast(
        nextActive === 1 ? t("products", "active") : t("products", "inactive"),
        "success",
      );
    } catch {
      // rollback on failure
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, is_active: product.is_active ?? 1 } : p,
        ),
      );
      addToast(t("common", "error"), "error");
    }
  };

  /* ── Loading skeleton ───────────────────────────────────── */
  if (loading) return <Spinner center brand />;

  /* ── Render ─────────────────────────────────────────────── */
  return (
    <div className="page-content">
      {/* ── Page header ─────────────────────────────────── */}
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <h1 className="page-title">{t("products", "title")}</h1>
          {products.length > 0 && (
            <span
              style={{
                fontSize: "0.875rem",
                fontWeight: 700,
                background: "var(--mint)",
                color: "var(--brand-text)",
                borderRadius: "999px",
                padding: "3px 10px",
              }}
            >
              {products.length}
            </span>
          )}
        </div>

        <button className="btn btn-primary" onClick={openAdd}>
          <span style={{ fontSize: "1.1em", marginInlineEnd: 6 }}>＋</span>
          {t("products", "add")}
        </button>
      </div>

      {/* ── Toolbar: search ─────────────────────────────── */}
      {products.length > 0 && (
        <div
          style={{
            marginBottom: 24,
            display: "flex",
            gap: 10,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div className="search-bar" style={{ minWidth: 260 }}>
            <span className="search-icon">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("products", "search")}
            />
          </div>

          <div className="tabs" style={{ marginInlineStart: "auto" }}>
            <button
              className={`tab-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
            >
              ◫ Grid
            </button>
            <button
              className={`tab-btn ${viewMode === "list" ? "active" : ""}`}
              onClick={() => setViewMode("list")}
            >
              ☰ List
            </button>
          </div>
        </div>
      )}

      {/* ── Empty: no products at all ────────────────────── */}
      {products.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🛍️</div>
          <p
            style={{
              fontWeight: 800,
              fontSize: "1.25rem",
              letterSpacing: "-0.02em",
              color: "var(--near-black)",
            }}
          >
            {t("products", "no_products")}
          </p>
          <p style={{ color: "var(--gray-500)", fontSize: "0.9375rem" }}>
            {t("products", "add_first")}
          </p>
          <button
            className="btn btn-primary"
            style={{ marginTop: 8 }}
            onClick={openAdd}
          >
            {t("products", "add")}
          </button>
        </div>
      )}

      {/* ── Empty: search yielded nothing ────────────────── */}
      {products.length > 0 && filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <p
            style={{
              fontWeight: 700,
              fontSize: "1.0625rem",
              color: "var(--near-black)",
            }}
          >
            No results for "{search}"
          </p>
          <button
            className="btn btn-ghost btn-sm"
            style={{ marginTop: 4 }}
            onClick={() => setSearch("")}
          >
            Clear search
          </button>
        </div>
      )}

      {/* ── Product grid/list ─────────────────────────────── */}
      {filtered.length > 0 && viewMode === "grid" && (
        <div className="grid-auto">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              t={t}
              onEdit={() => openEdit(product)}
              onDelete={() => openDelete(product)}
              onToggleStatus={() => handleToggleStatus(product)}
            />
          ))}
        </div>
      )}

      {filtered.length > 0 && viewMode === "list" && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t("products", "name")}</th>
                <th>{t("products", "category")}</th>
                <th>{t("products", "price")}</th>
                <th>{t("products", "stock")}</th>
                <th>{t("products", "active")}</th>
                <th style={{ textAlign: "end" }}>{t("orders", "details")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => {
                const isActive = product.is_active !== 0;
                return (
                  <tr key={product.id}>
                    <td style={{ fontWeight: 700 }}>{product.name}</td>
                    <td>{product.category || "—"}</td>
                    <td>
                      {Number(product.price).toLocaleString()}{" "}
                      {t("dashboard", "currency")}
                    </td>
                    <td>{product.stock ?? 0}</td>
                    <td>
                      <Badge
                        status={isActive ? "active" : "inactive"}
                        label={
                          isActive
                            ? t("products", "active")
                            : t("products", "inactive")
                        }
                      />
                    </td>
                    <td style={{ textAlign: "end" }}>
                      <div style={{ display: "inline-flex", gap: 6 }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => openEdit(product)}
                        >
                          {t("products", "edit")}
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleToggleStatus(product)}
                        >
                          {isActive
                            ? t("products", "inactive")
                            : t("products", "active")}
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => openDelete(product)}
                        >
                          {t("products", "delete")}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          ADD MODAL
      ══════════════════════════════════════════════════ */}
      <Modal
        isOpen={addOpen}
        onClose={closeAdd}
        title={t("products", "add_title")}
        size="md"
      >
        <ProductFormFields
          t={t}
          form={form}
          setForm={setForm}
          errors={errors}
          imagePreview={imagePreview}
          currentImage={null}
          onFileChange={handleFileChange}
          submitting={submitting}
          mode="add"
          onClose={closeAdd}
          onSubmit={handleAdd}
        />
      </Modal>

      {/* ══════════════════════════════════════════════════
          EDIT MODAL
      ══════════════════════════════════════════════════ */}
      <Modal
        isOpen={editOpen}
        onClose={closeEdit}
        title={t("products", "edit_title")}
        size="md"
      >
        <ProductFormFields
          t={t}
          form={form}
          setForm={setForm}
          errors={errors}
          imagePreview={imagePreview}
          currentImage={selected?.image ?? null}
          onFileChange={handleFileChange}
          submitting={submitting}
          mode="edit"
          onClose={closeEdit}
          onSubmit={handleEdit}
        />
      </Modal>

      {/* ══════════════════════════════════════════════════
          DELETE CONFIRMATION MODAL
      ══════════════════════════════════════════════════ */}
      <Modal
        isOpen={deleteOpen}
        onClose={closeDelete}
        title={t("products", "delete")}
        size="md"
      >
        <div style={{ padding: "4px 24px 28px" }}>
          {/* Product preview inside modal */}
          {selected && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 16px",
                background: "var(--gray-50)",
                borderRadius: 12,
                marginBottom: 20,
                border: "1px solid var(--gray-200)",
              }}
            >
              {/* Thumbnail */}
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 8,
                  overflow: "hidden",
                  background: "var(--gray-200)",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem",
                }}
              >
                {selected.image ? (
                  <img
                    src={selected.image}
                    alt={selected.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  "📦"
                )}
              </div>
              {/* Info */}
              <div style={{ minWidth: 0 }}>
                <p
                  style={{
                    fontWeight: 700,
                    fontSize: "0.9375rem",
                    color: "var(--near-black)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {selected.name}
                </p>
                <p style={{ color: "var(--gray-500)", fontSize: "0.875rem" }}>
                  {Number(selected.price).toLocaleString()}&nbsp;
                  {t("dashboard", "currency")}
                </p>
              </div>
            </div>
          )}

          {/* Warning text */}
          <p
            style={{
              color: "var(--gray-500)",
              fontSize: "0.9375rem",
              lineHeight: 1.55,
              marginBottom: 24,
            }}
          >
            {t("products", "delete_confirm")}
          </p>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button
              className="btn btn-ghost"
              onClick={closeDelete}
              disabled={submitting}
            >
              {t("products", "cancel")}
            </button>
            <button
              className="btn btn-danger"
              onClick={handleDelete}
              disabled={submitting}
              style={{ minWidth: 96 }}
            >
              {submitting ? "…" : t("products", "delete")}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   ProductCard  (extracted to keep JSX readable)
───────────────────────────────────────────────────────────────── */
function ProductCard({ product, t, onEdit, onDelete, onToggleStatus }) {
  const inStock = Number(product.stock) > 0;
  const isActive = product.is_active !== 0;

  return (
    <div className="product-card">
      {/* ── Image area ──────────────────────────────────── */}
      <div className="product-card-image">
        {product.image ? (
          <img src={product.image} alt={product.name} />
        ) : (
          <div className="product-card-image-placeholder">📦</div>
        )}
      </div>

      {/* ── Body ────────────────────────────────────────── */}
      <div className="product-card-body">
        {/* Name */}
        <p
          style={{
            fontWeight: 700,
            fontSize: "0.9375rem",
            color: "var(--near-black)",
            letterSpacing: "-0.01em",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {product.name}
        </p>

        {/* Description */}
        {product.description && (
          <p
            style={{
              fontSize: "0.8125rem",
              color: "var(--gray-500)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {product.description}
          </p>
        )}

        {/* Price + stock badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "auto",
            paddingTop: 6,
          }}
        >
          <span
            style={{
              fontWeight: 900,
              fontSize: "1.125rem",
              letterSpacing: "-0.02em",
              color: "var(--near-black)",
            }}
          >
            {Number(product.price).toLocaleString()}
            <span
              style={{
                fontWeight: 500,
                fontSize: "0.8125rem",
                color: "var(--gray-500)",
                marginInlineStart: 4,
              }}
            >
              {t("dashboard", "currency")}
            </span>
          </span>

          <Badge
            status={isActive ? "active" : "inactive"}
            label={
              isActive ? t("products", "active") : t("products", "inactive")
            }
          />
        </div>

        {/* Stock quantity hint */}
        {product.stock != null && (
          <p
            style={{
              fontSize: "0.8rem",
              color: inStock ? "var(--gray-500)" : "var(--danger)",
              marginTop: 2,
            }}
          >
            {inStock
              ? `${product.stock} ${t("products", "stock").toLowerCase()}`
              : t("products", "out_of_stock")}
          </p>
        )}
      </div>

      {/* ── Footer actions ──────────────────────────────── */}
      <div className="product-card-footer">
        <button className="btn btn-ghost btn-sm" onClick={onEdit}>
          ✏️&nbsp;{t("products", "edit")}
        </button>
        <button className="btn btn-secondary btn-sm" onClick={onToggleStatus}>
          {isActive
            ? `⏸ ${t("products", "inactive")}`
            : `▶ ${t("products", "active")}`}
        </button>
        <button
          className="btn btn-danger btn-sm"
          onClick={onDelete}
          style={{ marginInlineStart: "auto" }}
        >
          🗑&nbsp;{t("products", "delete")}
        </button>
      </div>
    </div>
  );
}
