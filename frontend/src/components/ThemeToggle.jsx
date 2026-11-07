import { t } from "../translations.js";

export default function ThemeToggle({ lang, theme, toggleTheme }) {
  if (typeof toggleTheme !== "function") return null; 

  return (
    <button 
      className="glow-gray" 
      onClick={toggleTheme} 
      style={{ 
        border: "none", 
        background: "var(--bg-hover)", 
        padding: "8px 12px", 
        borderRadius: "10px", 
        cursor: "pointer", 
        color: "var(--text-main)",
        fontFamily: "Franklin Gothic Medium",
        display: "flex",
        alignItems: "center",
        gap: "6px"
      }}
    >
      {theme === "dark" 
        ? (t(lang, "light") || "☀️ Light") 
        : (t(lang, "dark") || "🌙 Dark")}
    </button>
  );
}