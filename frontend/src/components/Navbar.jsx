import { Link, useNavigate } from "react-router-dom";
import LanguageSelector from "./LanguageSelector.jsx";
import ThemeToggle from "./ThemeToggle.jsx";
import { t } from "../translations.js";

export default function Navbar({ user, onLogout, lang, setLang }) {
  const isAdmin = user?.role === "admin";
  const navigate = useNavigate();

  const linkStyle = { color: "var(--text-main)", textDecoration: "none", fontWeight: "normal", fontSize: "14px" };

  const selectStyle = {
    padding: "8px 12px",
    border: "1px solid var(--border-input)",
    borderRadius: "9px",
    fontFamily: "Franklin Gothic Medium",
    background: "var(--bg-input)",
    color: "var(--text-main)",
    fontSize: "13px",
    cursor: "pointer",
    outline: "none"
  };

  return (
    <nav style={{ padding: "12px 18px", borderBottom: "1px solid var(--border-color)", background: "var(--bg-nav)", display: "flex", gap: "14px", alignItems: "center", flexWrap: "wrap", fontFamily: "Franklin Gothic Medium", transition: "background 0.3s" }}>
      
      {/* Меню для авторизованных пользователей */}
      {user && (
        <>
          {isAdmin && (
            <select
              value=""
              onChange={e => {
                if (e.target.value) navigate(e.target.value);
                e.target.value = "";
              }}
              style={selectStyle}
            >
              <option value="" disabled>{t(lang, "adminPanel")}</option>
              <option value="/admin/users">{t(lang, "users")}</option>
              <option value="/admin/languages">{t(lang, "languages")}</option>
            </select>
          )}

          <Link to="/" style={linkStyle}>{t(lang, "posts")}</Link>
          <Link to="/menu" style={linkStyle}>{t(lang, "manageMenu")}</Link>
          <Link to="/create" style={linkStyle}>{t(lang, "createPost")}</Link>
          <Link to="/profile" style={linkStyle}>{t(lang, "profile")}</Link>
        </>
      )}

      {/* Меню для гостей (неавторизованных) */}
      {!user && (
        <>
          <Link to="/login" style={linkStyle}>{t(lang, "login")}</Link>
          <Link to="/register" style={linkStyle}>{t(lang, "registration")}</Link>
        </>
      )}

      {/* Правая часть: тема, языки, выход */}
      <div style={{ marginLeft: "auto", display: "flex", gap: "10px", alignItems: "center" }}>
        <ThemeToggle />
        <LanguageSelector lang={lang} setLang={setLang} />
        
        {/* ВОТ ИСПРАВЛЕНИЕ: кнопка "Выйти" показывается только если user не null */}
        {user && (
          <button 
            onClick={onLogout} 
            style={{ border: "none", borderRadius: "10px", padding: "8px 14px", cursor: "pointer", fontFamily: "Franklin Gothic Medium", background: "var(--danger)", color: "white", fontSize: "14px" }}
          >
            {t(lang, "logout")}
          </button>
        )}
      </div>
    </nav>
  );
}