import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLang } from "../contexts/LangContext";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { registerApi } from "../api/auth";
import AuthSessionBanner from "../components/AuthSessionBanner";
import Spinner from "../components/ui/Spinner";

export default function RegisterPage() {
  const { t, lang, toggleLang, dir } = useLang();
  const { login, authReady } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!authReady) {
    return <Spinner center brand />;
  }

  const handleChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const { data } = await registerApi({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      const token = data?.token;
      const user = data?.user;

      if (token && user) {
        login(token, user);
        addToast(
          lang === "ar"
            ? "تم إنشاء الحساب بنجاح"
            : "Account created successfully",
          "success",
        );
        navigate("/dashboard", { replace: true });
      } else {
        addToast(
          lang === "ar"
            ? "تم إنشاء الحساب. سجّل الدخول الآن."
            : "Account created. Please sign in now.",
          "success",
        );
        navigate("/login", { replace: true });
      }
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        (lang === "ar" ? "فشل إنشاء الحساب" : "Failed to create account");

      setError(message);
      addToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      dir={dir}
      style={{
        minHeight: "100vh",
        background: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Top row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <Link
            to="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                background: "#9fe870",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#163300",
                fontWeight: 900,
                fontSize: "0.875rem",
              }}
            >
              V
            </div>
            <span
              style={{
                fontWeight: 800,
                color: "#0e0f0c",
                letterSpacing: "-0.02em",
                fontSize: "1.05rem",
              }}
            >
              Vendors
            </span>
          </Link>

          <button
            onClick={toggleLang}
            className="btn btn-ghost btn-sm"
            style={{ fontWeight: 700, minWidth: 44 }}
            type="button"
          >
            {lang === "ar" ? "EN" : "عر"}
          </button>
        </div>

        {/* Auth card */}
        <div
          className="card"
          style={{
            borderRadius: 40,
            padding: 40,
            boxShadow: "0 4px 24px rgba(14,15,12,0.12)",
            border: "1px solid #e8ebe6",
          }}
        >
          <h1
            style={{
              margin: 0,
              color: "#0e0f0c",
              fontWeight: 800,
              fontSize: "1.75rem",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            {t("auth", "register_title")}
          </h1>

          <p
            style={{
              marginTop: 10,
              marginBottom: 28,
              color: "#868685",
              fontSize: "0.96rem",
              lineHeight: 1.6,
            }}
          >
            {t("auth", "register_sub")}
          </p>

          <AuthSessionBanner />

          <form onSubmit={handleSubmit}>
            <div className="input-group" style={{ marginBottom: 16 }}>
              <label className="input-label" htmlFor="name">
                {t("auth", "name")}
              </label>
              <input
                id="name"
                type="text"
                className="input-field"
                value={form.name}
                onChange={handleChange("name")}
                required
                autoComplete="name"
                placeholder={lang === "ar" ? "الاسم الكامل" : "Your full name"}
              />
            </div>

            <div className="input-group" style={{ marginBottom: 16 }}>
              <label className="input-label" htmlFor="email">
                {t("auth", "email")}
              </label>
              <input
                id="email"
                type="email"
                className="input-field"
                value={form.email}
                onChange={handleChange("email")}
                required
                autoComplete="email"
                placeholder="name@company.com"
                dir="ltr"
              />
            </div>

            <div className="input-group" style={{ marginBottom: 20 }}>
              <label className="input-label" htmlFor="password">
                {t("auth", "password")}
              </label>
              <input
                id="password"
                type="password"
                className="input-field"
                value={form.password}
                onChange={handleChange("password")}
                required
                minLength={6}
                autoComplete="new-password"
                placeholder="••••••••"
                dir="ltr"
              />
            </div>

            <button
              type="submit"
              className="btn btn-dark w-full"
              disabled={loading}
              style={{ width: "100%", justifyContent: "center", minHeight: 46 }}
            >
              {loading
                ? `⏳ ${t("auth", "registering")}`
                : t("auth", "register_btn")}
            </button>

            {error ? (
              <p
                style={{
                  marginTop: 12,
                  marginBottom: 0,
                  color: "#d03238",
                  fontSize: "0.9rem",
                  lineHeight: 1.5,
                }}
              >
                {error}
              </p>
            ) : null}
          </form>

          <p
            style={{
              marginTop: 24,
              marginBottom: 0,
              color: "#868685",
              fontSize: "0.94rem",
            }}
          >
            {t("auth", "have_account")}{" "}
            <Link
              to="/login"
              style={{
                color: "#0e0f0c",
                fontWeight: 700,
                textDecoration: "underline",
                textUnderlineOffset: 3,
              }}
            >
              {t("auth", "login_link")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
