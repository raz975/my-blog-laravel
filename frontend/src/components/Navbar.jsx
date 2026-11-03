import { Link, useNavigate } from "react-router-dom";
import LanguageSelector from "./LanguageSelector.jsx";
import ThemeToggle from "./ThemeToggle.jsx";
import { t } from "../translations.js";

export default function Navbar({ user, onLogout, lang, setLang, theme, toggleTheme }) {
  const isAdmin = user?.role === "admin";
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      {user && (
        <>
          {isAdmin && (
            <select
              aria-label="Admin panel navigation"
              value=""
              onChange={e => {
                if (e.target.value) navigate(e.target.value);
                e.target.value = "";
              }}
              className="nav-select"
            >
              <option value="" disabled>{t(lang, "adminPanel")}</option>
              <option value="/admin/users">{t(lang, "users")}</option>
              <option value="/admin/languages">{t(lang, "languages")}</option>
            </select>
          )}

          <Link to="/" className="nav-link">{t(lang, "posts")}</Link>
          <Link to="/menu" className="nav-link">{t(lang, "manageMenu")}</Link>
          <Link to="/create" className="nav-link">{t(lang, "createPost")}</Link>
          <Link to="/profile" className="nav-link">{t(lang, "profile")}</Link>
        </>
      )}

      {!user && (
        <>
          <Link to="/login" className="nav-link">{t(lang, "login")}</Link>
          <Link to="/register" className="nav-link">{t(lang, "registration")}</Link>
        </>
      )}

      <div style={{ marginLeft: "auto", display: "flex", gap: "10px", alignItems: "center" }}>
        <ThemeToggle lang={lang} theme={theme} toggleTheme={toggleTheme} />
        <LanguageSelector lang={lang} setLang={setLang} />
        
        {user && (
          <button 
            onClick={onLogout} 
            className="nav-btn-logout"
            aria-label="Logout from account"
          >
            {t(lang, "logout")}
          </button>
        )}
      </div>
    </nav>
  );
}