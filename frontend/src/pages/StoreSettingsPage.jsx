import { useState, useEffect, useCallback } from "react";
import { useLang } from "../contexts/LangContext";
import { useToast } from "../contexts/ToastContext";
import Spinner from "../components/ui/Spinner";
import { getMyStore, createStore, updateMyStore } from "../api/stores";

const DEFAULT_FORM = {
  name: "",
  description: "",
  slug: "",
  primary_color: "#9fe870",
  card_bg: "#ffffff",
  page_bg: "#f9faf8",
  corner_radius: 16,
  banner_title: "",
  banner_subtitle: "",
};

export default function StoreSettingsPage() {
  const { t } = useLang();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [hasStore, setHasStore] = useState(true);
  const [activeTab, setActiveTab] = useState("identity");
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  const [form, setForm] = useState(DEFAULT_FORM);
  const [logoFile, setLogoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [bannerPreview, setBannerPreview] = useState("");

  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    logo: null,
  });

  const fetchStore = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMyStore();
      const store = res.data?.store;

      if (!store) {
        setHasStore(false);
        setLoading(false);
        return;
      }

      setHasStore(true);
      setForm({
        name: store?.name || "",
        description: store?.description || "",
        slug: store?.slug || "",
        primary_color: store?.primary_color || "#9fe870",
        card_bg: store?.card_bg || "#ffffff",
        page_bg: store?.page_bg || "#f9faf8",
        corner_radius: Number(store?.corner_radius || 16),
        banner_title: store?.banner_title || "",
        banner_subtitle: store?.banner_subtitle || "",
      });
      setLogoPreview(store?.logo || "");
      setBannerPreview(store?.banner || "");
    } catch (err) {
      if (err?.response?.status === 404) {
        setHasStore(false);
      } else {
        addToast(t("common", "error"), "error");
      }
    } finally {
      setLoading(false);
    }
  }, [addToast, t]);

  useEffect(() => {
    fetchStore();
  }, [fetchStore]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("description", form.description);
      fd.append("slug", form.slug);
      fd.append("primary_color", form.primary_color);
      fd.append("card_bg", form.card_bg);
      fd.append("page_bg", form.page_bg);
      fd.append("corner_radius", String(form.corner_radius));
      fd.append("banner_title", form.banner_title);
      fd.append("banner_subtitle", form.banner_subtitle);
      if (logoFile) fd.append("logo", logoFile);
      if (bannerFile) fd.append("banner", bannerFile);

      await updateMyStore(fd);
      addToast(t("store", "saved"), "success");
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 3000);
      setLogoFile(null);
      setBannerFile(null);
      await fetchStore();
    } catch {
      addToast(t("common", "error"), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateStore = async (e) => {
    e.preventDefault();
    if (!createForm.name.trim()) return;
    setCreating(true);
    try {
      const fd = new FormData();
      fd.append("name", createForm.name.trim());
      fd.append("description", createForm.description.trim());
      if (createForm.logo) fd.append("logo", createForm.logo);
      await createStore(fd);
      addToast(t("store", "saved"), "success");
      await fetchStore();
    } catch {
      addToast(t("common", "error"), "error");
    } finally {
      setCreating(false);
    }
  };

  const previewStyle = {
    background: form.page_bg,
    borderRadius: 24,
    padding: 16,
    border: "1px solid var(--gray-200)",
    minHeight: 320,
  };

  if (loading) return <Spinner center brand />;

  if (!hasStore) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">{t("store", "title")}</h1>
        </div>

        <div className="card card-xl" style={{ maxWidth: 620 }}>
          <div
            className="empty-state"
            style={{ paddingTop: 8, paddingBottom: 24 }}
          >
            <div className="empty-icon">🏪</div>
            <h3 style={{ fontSize: "1.4rem", fontWeight: 800 }}>
              {t("store", "create_first")}
            </h3>
          </div>

          <form
            onSubmit={handleCreateStore}
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >
            <div className="input-group">
              <label className="input-label">{t("store", "store_name")}</label>
              <input
                className="input-field"
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">{t("store", "description")}</label>
              <textarea
                className="input-field"
                rows={4}
                value={createForm.description}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>

            <div className="input-group">
              <label className="input-label">{t("store", "logo")}</label>
              <input
                className="input-field"
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    logo: e.target.files?.[0] || null,
                  }))
                }
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 8,
              }}
            >
              <button
                className="btn btn-primary"
                disabled={creating}
                type="submit"
              >
                {creating ? t("store", "creating") : t("store", "create_btn")}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t("store", "title")}</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {savedFlash && (
            <span className="badge badge-green">{t("store", "saved")}</span>
          )}
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? t("store", "saving") : t("store", "save")}
          </button>
        </div>
      </div>

      <div className="settings-tabs">
        <button
          className={`settings-tab ${activeTab === "identity" ? "active" : ""}`}
          onClick={() => setActiveTab("identity")}
        >
          {t("store", "identity_tab")}
        </button>
        <button
          className={`settings-tab ${activeTab === "colors" ? "active" : ""}`}
          onClick={() => setActiveTab("colors")}
        >
          {t("store", "colors_tab")}
        </button>
        <button
          className={`settings-tab ${activeTab === "banner" ? "active" : ""}`}
          onClick={() => setActiveTab("banner")}
        >
          {t("store", "banner_tab")}
        </button>
      </div>

      <div className="grid-2" style={{ alignItems: "start" }}>
        <div
          className="card card-xl"
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          {activeTab === "identity" && (
            <>
              <div className="input-group">
                <label className="input-label">
                  {t("store", "store_name")}
                </label>
                <input
                  className="input-field"
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>

              <div className="input-group">
                <label className="input-label">
                  {t("store", "description")}
                </label>
                <textarea
                  className="input-field"
                  rows={4}
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="input-group">
                <label className="input-label">{t("store", "slug")}</label>
                <input
                  className="input-field"
                  value={form.slug}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, slug: e.target.value }))
                  }
                  dir="ltr"
                />
                <small className="text-muted">
                  {t("store", "slug_hint")}
                  <b>{form.slug || "my-store"}</b>
                </small>
              </div>

              <div className="input-group">
                <label className="input-label">{t("store", "logo")}</label>
                {(logoPreview || logoFile) && (
                  <img
                    src={logoFile ? URL.createObjectURL(logoFile) : logoPreview}
                    alt="logo"
                    style={{
                      width: 74,
                      height: 74,
                      borderRadius: 16,
                      objectFit: "cover",
                      border: "1px solid var(--gray-200)",
                    }}
                  />
                )}
                <input
                  className="input-field"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setLogoFile(file);
                  }}
                />
              </div>
            </>
          )}

          {activeTab === "colors" && (
            <>
              <div className="grid-2">
                <div className="input-group">
                  <label className="input-label">
                    {t("store", "primary_color")}
                  </label>
                  <div
                    style={{ display: "flex", gap: 10, alignItems: "center" }}
                  >
                    <input
                      className="input-field"
                      type="color"
                      value={form.primary_color}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          primary_color: e.target.value,
                        }))
                      }
                    />
                    <span className="badge badge-gray">
                      {form.primary_color}
                    </span>
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">{t("store", "card_bg")}</label>
                  <div
                    style={{ display: "flex", gap: 10, alignItems: "center" }}
                  >
                    <input
                      className="input-field"
                      type="color"
                      value={form.card_bg}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          card_bg: e.target.value,
                        }))
                      }
                    />
                    <span className="badge badge-gray">{form.card_bg}</span>
                  </div>
                </div>
              </div>

              <div className="grid-2">
                <div className="input-group">
                  <label className="input-label">{t("store", "page_bg")}</label>
                  <div
                    style={{ display: "flex", gap: 10, alignItems: "center" }}
                  >
                    <input
                      className="input-field"
                      type="color"
                      value={form.page_bg}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          page_bg: e.target.value,
                        }))
                      }
                    />
                    <span className="badge badge-gray">{form.page_bg}</span>
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">
                    {t("store", "corner_radius")}
                  </label>
                  <input
                    className="input-field"
                    type="number"
                    min={0}
                    max={40}
                    value={form.corner_radius}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        corner_radius: Number(e.target.value || 0),
                      }))
                    }
                  />
                </div>
              </div>
            </>
          )}

          {activeTab === "banner" && (
            <>
              <div className="input-group">
                <label className="input-label">
                  {t("store", "banner_image")}
                </label>
                {(bannerPreview || bannerFile) && (
                  <img
                    src={
                      bannerFile
                        ? URL.createObjectURL(bannerFile)
                        : bannerPreview
                    }
                    alt="banner"
                    style={{
                      width: "100%",
                      height: 180,
                      borderRadius: 16,
                      objectFit: "cover",
                      border: "1px solid var(--gray-200)",
                    }}
                  />
                )}
                <input
                  className="input-field"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setBannerFile(file);
                  }}
                />
              </div>

              <div className="input-group">
                <label className="input-label">
                  {t("store", "banner_title")}
                </label>
                <input
                  className="input-field"
                  value={form.banner_title}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      banner_title: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="input-group">
                <label className="input-label">
                  {t("store", "banner_subtitle")}
                </label>
                <textarea
                  className="input-field"
                  rows={3}
                  value={form.banner_subtitle}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      banner_subtitle: e.target.value,
                    }))
                  }
                />
              </div>
            </>
          )}
        </div>

        <div className="card card-xl">
          <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: 14 }}>
            {t("store", "preview")}
          </h3>

          <div style={previewStyle}>
            <div
              style={{
                background: form.primary_color,
                color: "#163300",
                borderRadius: form.corner_radius,
                padding: "16px 14px",
                fontWeight: 800,
                marginBottom: 12,
              }}
            >
              {form.banner_title || form.name || "My Store"}
              <p
                style={{
                  marginTop: 6,
                  marginBottom: 0,
                  fontWeight: 500,
                  fontSize: "0.85rem",
                  opacity: 0.9,
                }}
              >
                {form.banner_subtitle || form.description || "Store preview"}
              </p>
            </div>

            <div
              style={{
                background: form.card_bg,
                borderRadius: form.corner_radius,
                padding: 14,
                border: "1px solid var(--gray-200)",
              }}
            >
              <div
                style={{
                  height: 110,
                  borderRadius: Math.max(8, form.corner_radius - 4),
                  background: "#f3f4f6",
                  marginBottom: 10,
                }}
              />
              <div style={{ fontWeight: 700, marginBottom: 8 }}>
                Sample Product
              </div>
              <button
                className="btn"
                style={{
                  background: form.primary_color,
                  color: "#163300",
                  width: "100%",
                  borderRadius: 9999,
                  padding: "10px 14px",
                }}
                type="button"
              >
                Order now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
