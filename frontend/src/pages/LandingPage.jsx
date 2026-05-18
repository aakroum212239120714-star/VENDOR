import { useState } from "react";
import { Link } from "react-router-dom";
import { useLang } from "../contexts/LangContext";

/* ─── Mini sidebar used inside tab preview mocks ─────────── */
function MiniSidebar({ activeIndex }) {
  const items = [
    { icon: "⊞", label: "Dashboard" },
    { icon: "◫", label: "Products" },
    { icon: "≡", label: "Orders" },
    { icon: "⚙", label: "Settings" },
  ];
  return (
    <div
      style={{
        width: 152,
        background: "#f4f6f2",
        borderRadius: 16,
        padding: "14px 10px",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          marginBottom: 16,
          paddingBottom: 13,
          borderBottom: "1px solid #e8ebe6",
        }}
      >
        <div
          style={{
            width: 22,
            height: 22,
            background: "#9fe870",
            borderRadius: 5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 900,
            fontSize: "0.6rem",
            color: "#163300",
            flexShrink: 0,
          }}
        >
          V
        </div>
        <span
          style={{
            fontWeight: 800,
            fontSize: "0.75rem",
            color: "#0e0f0c",
            letterSpacing: "-0.01em",
          }}
        >
          Vendors
        </span>
      </div>
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "6px 9px",
            borderRadius: 8,
            fontSize: "0.71rem",
            fontWeight: i === activeIndex ? 700 : 500,
            color: i === activeIndex ? "#163300" : "#868685",
            background: i === activeIndex ? "#9fe870" : "transparent",
            marginBottom: 2,
            letterSpacing: "-0.01em",
          }}
        >
          <span style={{ fontSize: "0.75rem" }}>{item.icon}</span>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Mock form field for tab previews ───────────────────── */
function MockField({ label, value, tall }) {
  return (
    <div>
      <div
        style={{
          fontSize: "0.6rem",
          color: "#868685",
          fontWeight: 700,
          letterSpacing: "0.07em",
          marginBottom: 5,
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div
        style={{
          background: "#f9faf8",
          border: "1px solid #e8ebe6",
          borderRadius: 9,
          padding: "8px 11px",
          fontSize: "0.77rem",
          color: "#0e0f0c",
          minHeight: tall ? 58 : "auto",
          lineHeight: 1.45,
        }}
      >
        {value}
      </div>
    </div>
  );
}

/* ─── Landing Page ───────────────────────────────────────── */
export default function LandingPage() {
  const { t, lang, toggleLang, dir } = useLang();
  const [activeTab, setActiveTab] = useState("setup");

  const tabs = [
    { id: "setup", label: t("landing", "tab_setup") },
    { id: "products", label: t("landing", "tab_products") },
    { id: "orders", label: t("landing", "tab_orders") },
    { id: "customize", label: t("landing", "tab_customize") },
  ];

  const features = [
    {
      icon: "🏪",
      bg: "#e2f6d5",
      title: t("landing", "f1_title"),
      desc: t("landing", "f1_desc"),
    },
    {
      icon: "📦",
      bg: "#fff4e2",
      title: t("landing", "f2_title"),
      desc: t("landing", "f2_desc"),
    },
    {
      icon: "📋",
      bg: "#e2ebff",
      title: t("landing", "f3_title"),
      desc: t("landing", "f3_desc"),
    },
    {
      icon: "🎨",
      bg: "#ffe2f4",
      title: t("landing", "f4_title"),
      desc: t("landing", "f4_desc"),
    },
  ];

  const brands = [
    "ShopFlow",
    "Tradex",
    "MartHub",
    "QuickSell",
    "ZenStore",
    "FlowMart",
  ];

  /* ── Tab mock content ── */
  const tabData = [
    {
      id: "setup",
      content: (
        <div style={{ display: "flex", gap: 20 }}>
          <MiniSidebar activeIndex={3} />
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 13,
            }}
          >
            <div
              style={{
                fontWeight: 800,
                fontSize: "0.875rem",
                color: "#0e0f0c",
              }}
            >
              Store Identity
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 11,
              }}
            >
              <MockField label="Store Name" value="My Beautiful Store" />
              <MockField label="URL Slug" value="my-beautiful-store" />
            </div>
            <MockField
              label="Description"
              value="Premium quality products for everyday life."
              tall
            />
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  background: "#9fe870",
                  borderRadius: 9999,
                  padding: "8px 18px",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "#163300",
                  cursor: "pointer",
                }}
              >
                Save changes
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#e2f6d5",
                  borderRadius: 9999,
                  padding: "8px 13px",
                  fontSize: "0.68rem",
                  fontWeight: 600,
                  color: "#163300",
                }}
              >
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "#5a9e30",
                    display: "inline-block",
                    flexShrink: 0,
                  }}
                />
                vendors.app/store/my-beautiful-store
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "products",
      content: (
        <div style={{ display: "flex", gap: 20 }}>
          <MiniSidebar activeIndex={1} />
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  fontWeight: 800,
                  fontSize: "0.875rem",
                  color: "#0e0f0c",
                }}
              >
                Products
              </div>
              <div
                style={{
                  background: "#9fe870",
                  borderRadius: 9999,
                  padding: "6px 13px",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: "#163300",
                }}
              >
                + Add product
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 10,
              }}
            >
              {[
                {
                  emoji: "🎧",
                  name: "Wireless Earbuds",
                  price: "149",
                  stock: 42,
                  bg: "#e2f6d5",
                },
                {
                  emoji: "⌚",
                  name: "Smart Watch",
                  price: "299",
                  stock: 18,
                  bg: "#e2ebff",
                },
                {
                  emoji: "☕",
                  name: "Coffee Mug Set",
                  price: "49",
                  stock: 95,
                  bg: "#fff4e2",
                },
              ].map((p, i) => (
                <div
                  key={i}
                  style={{
                    border: "1px solid #e8ebe6",
                    borderRadius: 12,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: 70,
                      background: p.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.5rem",
                    }}
                  >
                    {p.emoji}
                  </div>
                  <div style={{ padding: "8px 10px" }}>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: "0.7rem",
                        color: "#0e0f0c",
                        marginBottom: 4,
                      }}
                    >
                      {p.name}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: "0.75rem",
                          color: "#163300",
                        }}
                      >
                        {p.price} DZD
                      </span>
                      <span
                        style={{
                          fontSize: "0.62rem",
                          color: "#163300",
                          background: "#e2f6d5",
                          padding: "2px 7px",
                          borderRadius: 9999,
                          fontWeight: 600,
                        }}
                      >
                        {p.stock}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "orders",
      content: (
        <div style={{ display: "flex", gap: 20 }}>
          <MiniSidebar activeIndex={2} />
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontWeight: 800,
                fontSize: "0.875rem",
                color: "#0e0f0c",
                marginBottom: 13,
              }}
            >
              Orders
            </div>
            <div
              style={{
                display: "flex",
                gap: 5,
                marginBottom: 14,
                flexWrap: "wrap",
              }}
            >
              {[
                "All (12)",
                "Pending (3)",
                "Confirmed (5)",
                "Delivered (4)",
              ].map((s, i) => (
                <div
                  key={s}
                  style={{
                    padding: "4px 11px",
                    borderRadius: 9999,
                    fontSize: "0.65rem",
                    fontWeight: 600,
                    background: i === 0 ? "#0e0f0c" : "#f4f6f2",
                    color: i === 0 ? "#fff" : "#868685",
                    cursor: "pointer",
                  }}
                >
                  {s}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                {
                  id: "#3841",
                  name: "Ahmed K.",
                  total: "448 DZD",
                  status: "Pending",
                  sc: "#fff4e2",
                  st: "#7a4e00",
                },
                {
                  id: "#3840",
                  name: "Sara M.",
                  total: "299 DZD",
                  status: "Confirmed",
                  sc: "#e2ebff",
                  st: "#1a3a8a",
                },
                {
                  id: "#3839",
                  name: "Omar H.",
                  total: "149 DZD",
                  status: "Delivered",
                  sc: "#e2f6d5",
                  st: "#163300",
                },
                {
                  id: "#3838",
                  name: "Layla Q.",
                  total: "597 DZD",
                  status: "Shipped",
                  sc: "#f4f6f2",
                  st: "#454745",
                },
              ].map((o, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 11px",
                    background: "#f9faf8",
                    borderRadius: 9,
                    fontSize: "0.7rem",
                  }}
                >
                  <span
                    style={{ fontWeight: 700, color: "#0e0f0c", minWidth: 44 }}
                  >
                    {o.id}
                  </span>
                  <span style={{ flex: 1, color: "#4d5049" }}>{o.name}</span>
                  <span style={{ fontWeight: 600, color: "#0e0f0c" }}>
                    {o.total}
                  </span>
                  <span
                    style={{
                      padding: "3px 9px",
                      borderRadius: 9999,
                      fontWeight: 600,
                      fontSize: "0.63rem",
                      background: o.sc,
                      color: o.st,
                    }}
                  >
                    {o.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "customize",
      content: (
        <div style={{ display: "flex", gap: 20 }}>
          <MiniSidebar activeIndex={3} />
          <div style={{ flex: 1, display: "flex", gap: 24 }}>
            {/* Controls panel */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: "0.875rem",
                  color: "#0e0f0c",
                  marginBottom: 15,
                }}
              >
                Brand Colors
              </div>
              {[
                { label: "Primary Color", color: "#9fe870" },
                { label: "Card Background", color: "#ffffff" },
                { label: "Page Background", color: "#f9faf8" },
              ].map((c, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 11,
                  }}
                >
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 7,
                      background: c.color,
                      border: "2px solid #e8ebe6",
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <div
                      style={{
                        fontSize: "0.66rem",
                        color: "#868685",
                        fontWeight: 600,
                      }}
                    >
                      {c.label}
                    </div>
                    <div
                      style={{
                        fontSize: "0.71rem",
                        color: "#0e0f0c",
                        fontWeight: 600,
                      }}
                    >
                      {c.color}
                    </div>
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 8 }}>
                <div
                  style={{
                    fontSize: "0.6rem",
                    color: "#868685",
                    fontWeight: 700,
                    letterSpacing: "0.07em",
                    marginBottom: 7,
                    textTransform: "uppercase",
                  }}
                >
                  Corner Radius
                </div>
                <div style={{ display: "flex", gap: 5 }}>
                  {["None", "Small", "Large", "Pill"].map((r, i) => (
                    <div
                      key={r}
                      style={{
                        padding: "5px 9px",
                        fontSize: "0.63rem",
                        fontWeight: 600,
                        background: i === 2 ? "#0e0f0c" : "#f4f6f2",
                        color: i === 2 ? "#fff" : "#868685",
                        borderRadius: 6,
                        cursor: "pointer",
                      }}
                    >
                      {r}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Live mini-store preview */}
            <div
              style={{
                width: 186,
                background: "#f9faf8",
                borderRadius: 16,
                padding: "13px",
                border: "1px solid #e8ebe6",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  fontSize: "0.58rem",
                  color: "#868685",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  marginBottom: 9,
                  textTransform: "uppercase",
                }}
              >
                Live Preview
              </div>
              <div
                style={{
                  background: "linear-gradient(135deg, #9fe870, #7ac952)",
                  borderRadius: 10,
                  height: 42,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 9,
                }}
              >
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 800,
                    color: "#163300",
                  }}
                >
                  My Store
                </span>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 5,
                }}
              >
                {["🎧", "⌚", "☕", "👜"].map((e, i) => (
                  <div
                    key={i}
                    style={{
                      background: "#fff",
                      borderRadius: 9,
                      padding: "9px 4px",
                      textAlign: "center",
                      fontSize: "1rem",
                      border: "1px solid #e8ebe6",
                    }}
                  >
                    {e}
                  </div>
                ))}
              </div>
              <div
                style={{
                  marginTop: 9,
                  background: "#9fe870",
                  borderRadius: 9999,
                  padding: "6px 10px",
                  textAlign: "center",
                  fontSize: "0.63rem",
                  fontWeight: 700,
                  color: "#163300",
                }}
              >
                Order Now
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div
      dir={dir}
      style={{
        fontFamily: "Inter, sans-serif",
        background: "#fff",
        minHeight: "100vh",
        overflowX: "hidden",
      }}
    >
      {/* ════════════════════════════════════════
          NAVBAR
      ════════════════════════════════════════ */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: "rgba(255,255,255,0.93)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: "rgba(14,15,12,0.10) 0px 0px 0px 1px",
          height: 68,
          display: "flex",
          alignItems: "center",
          padding: "0 max(24px, calc((100vw - 1200px) / 2))",
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              background: "#9fe870",
              borderRadius: 9,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              fontSize: "0.875rem",
              color: "#163300",
            }}
          >
            V
          </div>
          <span
            style={{
              fontWeight: 800,
              fontSize: "1.0625rem",
              letterSpacing: "-0.025em",
              color: "#0e0f0c",
            }}
          >
            Vendors
          </span>
        </Link>

        <div style={{ flex: 1 }} />

        {/* Right controls */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button
            onClick={toggleLang}
            className="btn btn-ghost btn-sm"
            style={{ fontWeight: 700, letterSpacing: "0.01em", minWidth: 44 }}
          >
            {lang === "ar" ? "EN" : "عر"}
          </button>
          <Link to="/login" className="btn btn-ghost btn-sm">
            {t("landing", "cta_login")}
          </Link>
          <Link to="/register" className="btn btn-primary btn-sm">
            {t("landing", "cta_start")}
          </Link>
        </div>
      </nav>

      {/* ════════════════════════════════════════
          HERO
      ════════════════════════════════════════ */}
      <section
        style={{
          padding: "148px max(24px, calc((100vw - 860px) / 2)) 96px",
          textAlign: "center",
          background:
            "radial-gradient(ellipse 80% 55% at 50% -5%, #d5efbf 0%, #ffffff 62%)",
        }}
      >
        {/* Eyebrow badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "#e2f6d5",
            color: "#163300",
            borderRadius: "9999px",
            padding: "7px 18px",
            fontSize: "0.875rem",
            fontWeight: 600,
            letterSpacing: "-0.01em",
            marginBottom: 32,
            boxShadow: "rgba(14,15,12,0.08) 0px 0px 0px 1px",
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#5aaa28",
              display: "inline-block",
              flexShrink: 0,
            }}
          />
          {t("landing", "hero_eyebrow")}
        </div>

        {/* Mega headline */}
        <h1
          style={{
            fontSize: "clamp(3rem, 7vw, 6.5rem)",
            fontWeight: 900,
            lineHeight: 0.85,
            letterSpacing: "-0.03em",
            color: "#0e0f0c",
            whiteSpace: "pre-line",
            margin: "0 0 30px",
          }}
        >
          {t("landing", "hero_title")}
        </h1>

        {/* Subtitle */}
        <p
          style={{
            color: "#4d5049",
            fontSize: "1.2rem",
            lineHeight: 1.65,
            maxWidth: 480,
            margin: "0 auto 48px",
          }}
        >
          {t("landing", "hero_subtitle")}
        </p>

        {/* CTA pair */}
        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <Link to="/register" className="btn btn-primary btn-lg">
            {t("landing", "cta_start")}
          </Link>
          <Link to="/login" className="btn btn-secondary btn-lg">
            {t("landing", "cta_login")}
          </Link>
        </div>

        {/* Social proof stats */}
        <div
          style={{
            display: "flex",
            gap: 40,
            justifyContent: "center",
            marginTop: 60,
            flexWrap: "wrap",
          }}
        >
          {[
            {
              value: "10K+",
              label: lang === "ar" ? "متجر نشط" : "Active stores",
            },
            {
              value: "500K+",
              label: lang === "ar" ? "طلب تمت معالجته" : "Orders processed",
            },
            {
              value: "99.9%",
              label: lang === "ar" ? "وقت التشغيل" : "Uptime SLA",
            },
          ].map((stat) => (
            <div key={stat.value} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontWeight: 900,
                  fontSize: "1.625rem",
                  letterSpacing: "-0.03em",
                  color: "#0e0f0c",
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </div>
              <div
                style={{ color: "#868685", fontSize: "0.875rem", marginTop: 5 }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════
          FEATURE TABS SHOWCASE
      ════════════════════════════════════════ */}
      <section
        style={{
          background: "#f9faf8",
          padding: "80px max(24px, calc((100vw - 1100px) / 2))",
        }}
      >
        <p
          style={{
            textAlign: "center",
            color: "#868685",
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            margin: "0 0 16px",
          }}
        >
          {lang === "ar" ? "نظرة عامة على المنصة" : "Platform overview"}
        </p>

        {/* Tab pill buttons */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 28,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="btn btn-sm"
              style={{
                background:
                  activeTab === tab.id ? "#0e0f0c" : "rgba(14,15,12,0.06)",
                color: activeTab === tab.id ? "#fff" : "#4d5049",
                border: "none",
                transition:
                  "background 0.2s ease, color 0.2s ease, transform 0.12s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Preview window */}
        <div
          style={{
            background: "#fff",
            borderRadius: 30,
            boxShadow:
              "rgba(14,15,12,0.10) 0px 0px 0px 1px, 0 24px 64px rgba(14,15,12,0.07)",
            overflow: "hidden",
          }}
        >
          {/* Browser chrome */}
          <div
            style={{
              background: "#f4f6f2",
              padding: "12px 20px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              borderBottom: "1px solid #e8ebe6",
            }}
          >
            <div style={{ display: "flex", gap: 5 }}>
              {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                <div
                  key={c}
                  style={{
                    width: 11,
                    height: 11,
                    borderRadius: "50%",
                    background: c,
                  }}
                />
              ))}
            </div>
            <div
              style={{
                flex: 1,
                maxWidth: 256,
                margin: "0 auto",
                background: "#fff",
                borderRadius: "9999px",
                padding: "5px 14px",
                fontSize: "0.69rem",
                color: "#868685",
                textAlign: "center",
                border: "1px solid #e8ebe6",
              }}
            >
              app.vendors.sa/dashboard
            </div>
          </div>

          {/* Animated tab content */}
          <div style={{ position: "relative", minHeight: 380 }}>
            {tabData.map((tab) => (
              <div
                key={tab.id}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  padding: "28px 32px",
                  opacity: activeTab === tab.id ? 1 : 0,
                  transform:
                    activeTab === tab.id ? "translateY(0)" : "translateY(8px)",
                  transition: "opacity 0.3s ease, transform 0.3s ease",
                  pointerEvents: activeTab === tab.id ? "auto" : "none",
                }}
              >
                {tab.content}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FEATURES GRID  (2 × 2)
      ════════════════════════════════════════ */}
      <section
        style={{
          background: "#fff",
          padding: "100px max(24px, calc((100vw - 1100px) / 2))",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            fontWeight: 900,
            lineHeight: 0.88,
            letterSpacing: "-0.03em",
            color: "#0e0f0c",
            whiteSpace: "pre-line",
            textAlign: "center",
            margin: "0 0 64px",
          }}
        >
          {t("landing", "feature_title")}
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 20,
          }}
        >
          {features.map((f, i) => (
            <div
              key={i}
              style={{
                background: "#fff",
                borderRadius: 30,
                boxShadow: "rgba(14,15,12,0.10) 0px 0px 0px 1px",
                padding: "36px 32px",
                display: "flex",
                flexDirection: "column",
                gap: 18,
                transition: "transform 0.25s ease, box-shadow 0.25s ease",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow =
                  "rgba(14,15,12,0.10) 0px 0px 0px 1px, 0 24px 52px rgba(14,15,12,0.10)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "rgba(14,15,12,0.10) 0px 0px 0px 1px";
              }}
            >
              <div
                style={{
                  width: 54,
                  height: 54,
                  background: f.bg,
                  borderRadius: 15,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.6rem",
                  flexShrink: 0,
                }}
              >
                {f.icon}
              </div>
              <div>
                <h3
                  style={{
                    fontWeight: 700,
                    fontSize: "1.125rem",
                    margin: "0 0 10px",
                    color: "#0e0f0c",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {f.title}
                </h3>
                <p
                  style={{
                    color: "#868685",
                    margin: 0,
                    lineHeight: 1.65,
                    fontSize: "0.9375rem",
                  }}
                >
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════
          TRUST SECTION
      ════════════════════════════════════════ */}
      <section
        style={{
          background: "#0e0f0c",
          padding: "80px max(24px, calc((100vw - 1100px) / 2))",
          textAlign: "center",
        }}
      >
        <p
          style={{
            color: "rgba(255,255,255,0.38)",
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            margin: "0 0 36px",
          }}
        >
          {t("landing", "trusted")}
        </p>
        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {brands.map((brand) => (
            <div
              key={brand}
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.09)",
                borderRadius: "9999px",
                padding: "11px 26px",
                color: "rgba(255,255,255,0.5)",
                fontSize: "0.9375rem",
                fontWeight: 600,
                letterSpacing: "-0.01em",
              }}
            >
              {brand}
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════
          CTA SECTION
      ════════════════════════════════════════ */}
      <section
        style={{
          background: "#e2f6d5",
          padding: "100px max(24px, calc((100vw - 860px) / 2))",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(2rem, 5vw, 3.75rem)",
            fontWeight: 900,
            lineHeight: 0.88,
            letterSpacing: "-0.03em",
            color: "#0e0f0c",
            margin: "0 0 20px",
          }}
        >
          {t("landing", "cta_section")}
        </h2>
        <p
          style={{
            color: "#3d5a2d",
            fontSize: "1.0625rem",
            lineHeight: 1.65,
            margin: "0 auto 44px",
            maxWidth: 460,
          }}
        >
          {t("landing", "cta_sub")}
        </p>
        <Link
          to="/register"
          className="btn btn-primary btn-lg"
          style={{ padding: "16px 48px", fontSize: "1.0625rem" }}
        >
          {t("landing", "cta_btn")}
        </Link>
      </section>

      {/* ════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════ */}
      <footer
        style={{
          background: "#0e0f0c",
          padding: "28px max(24px, calc((100vw - 1200px) / 2))",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 28,
              height: 28,
              background: "#9fe870",
              borderRadius: 7,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              fontSize: "0.7rem",
              color: "#163300",
            }}
          >
            V
          </div>
          <span
            style={{ color: "rgba(255,255,255,0.38)", fontSize: "0.875rem" }}
          >
            Vendors © 2025
          </span>
        </div>
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          {["Twitter", "Instagram", "LinkedIn"].map((s) => (
            <a
              key={s}
              href="#"
              style={{
                color: "rgba(255,255,255,0.35)",
                fontSize: "0.875rem",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "rgba(255,255,255,0.8)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(255,255,255,0.35)";
              }}
            >
              {s}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}
