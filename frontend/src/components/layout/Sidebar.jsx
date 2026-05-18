import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useLang } from "../../contexts/LangContext";
import { getMyStore } from "../../api/stores";

const NAV_ITEMS = [
  { key: "dashboard", path: "/dashboard", icon: "▦" },
  { key: "products", path: "/products", icon: "◈" },
  { key: "orders", path: "/orders", icon: "◉" },
  { key: "store", path: "/store", icon: "◎" },
];

export default function Sidebar({ onClose }) {
  const { logout, user } = useAuth();
  const { t, lang, toggleLang } = useLang();
  const navigate = useNavigate();
  const [publicSlug, setPublicSlug] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getMyStore();
        const slug = res?.data?.store?.slug;
        if (mounted && slug) setPublicSlug(slug);
      } catch {
        if (mounted) setPublicSlug("");
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleOpenPublicStore = () => {
    if (onClose) onClose();
    if (publicSlug) {
      navigate(`/store/${publicSlug}`);
    } else {
      navigate("/store");
    }
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div
        style={{
          padding: "24px 20px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            cursor: "pointer",
          }}
          onClick={() => navigate("/dashboard")}
        >
          <div
            style={{
              width: 36,
              height: 36,
              background: "#9fe870",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              fontSize: "1.1rem",
              color: "#163300",
              flexShrink: 0,
            }}
          >
            V
          </div>
          <span
            style={{
              color: "#fff",
              fontWeight: 900,
              fontSize: "1.2rem",
              letterSpacing: "-0.02em",
              fontFeatureSettings: '"calt"',
            }}
          >
            Vendors
          </span>
        </div>
      </div>

      {/* User info */}
      {user && (
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "rgba(159,232,112,0.15)",
                border: "1.5px solid rgba(159,232,112,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#9fe870",
                fontWeight: 700,
                fontSize: "0.9rem",
                flexShrink: 0,
              }}
            >
              {user.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div style={{ overflow: "hidden" }}>
              <div
                style={{
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user.name}
              </div>
              <div
                style={{
                  color: "#868685",
                  fontSize: "0.75rem",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user.email}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "12px 12px" }}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.key}
            to={item.path}
            onClick={onClose}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "11px 14px",
              borderRadius: 12,
              margin: "2px 0",
              color: isActive ? "#9fe870" : "rgba(255,255,255,0.65)",
              background: isActive ? "rgba(159,232,112,0.1)" : "transparent",
              fontWeight: 600,
              fontSize: "0.9375rem",
              transition: "all 0.12s ease",
              textDecoration: "none",
              fontFeatureSettings: '"calt"',
            })}
          >
            <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>
              {item.icon}
            </span>
            <span>{t("nav", item.key)}</span>
          </NavLink>
        ))}

        {/* Public Store link */}
        <button
          onClick={handleOpenPublicStore}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "11px 14px",
            borderRadius: 12,
            margin: "2px 0",
            color: "rgba(255,255,255,0.4)",
            fontWeight: 500,
            fontSize: "0.875rem",
            textDecoration: "none",
            fontFeatureSettings: '"calt"',
            marginTop: 8,
            borderTop: "1px solid rgba(255,255,255,0.06)",
            paddingTop: 16,
            background: "transparent",
            borderInline: "none",
            borderBottom: "none",
            borderTopWidth: "1px",
            borderTopStyle: "solid",
            borderTopColor: "rgba(255,255,255,0.06)",
            width: "100%",
            textAlign: "start",
            cursor: "pointer",
          }}
        >
          <span style={{ fontSize: "0.875rem" }}>↗</span>
          <span>{t("nav", "publicStore")}</span>
        </button>
      </nav>

      {/* Bottom controls */}
      <div
        style={{
          padding: "12px 12px 20px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        {/* Language toggle */}
        <button
          onClick={toggleLang}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 14px",
            borderRadius: 12,
            border: "none",
            background: "transparent",
            color: "rgba(255,255,255,0.5)",
            fontWeight: 600,
            fontSize: "0.875rem",
            cursor: "pointer",
            width: "100%",
            textAlign: "start",
            transition: "background 0.12s",
            fontFeatureSettings: '"calt"',
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.06)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          <span>🌐</span>
          <span>{lang === "ar" ? "English" : "عربي"}</span>
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 14px",
            borderRadius: 12,
            border: "none",
            background: "transparent",
            color: "rgba(255,255,255,0.5)",
            fontWeight: 600,
            fontSize: "0.875rem",
            cursor: "pointer",
            width: "100%",
            textAlign: "start",
            transition: "background 0.12s",
            fontFeatureSettings: '"calt"',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(208,50,56,0.12)";
            e.currentTarget.style.color = "#d03238";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "rgba(255,255,255,0.5)";
          }}
        >
          <span>→</span>
          <span>{t("nav", "logout")}</span>
        </button>
      </div>
    </aside>
  );
}
