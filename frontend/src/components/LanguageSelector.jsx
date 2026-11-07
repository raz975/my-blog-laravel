import { useEffect, useState } from "react";
import { api } from "../api.js";
import { translations } from "../translations.js";

export default function LanguageSelector({ lang, setLang }) {
  const [languages, setLanguages] = useState([]);

  useEffect(() => {
    api.getPublicLanguages()
      .then(response => {
        const dbLangs = response.data || [];
        
        const supportedLangs = dbLangs.filter(l => translations[l.code]);
        
        if (supportedLangs.length > 0) {
          setLanguages(supportedLangs);
        } else {
          setLanguages([{ id: 1, code: "ru", name: "Русский" }]);
        }
      })
      .catch(() => {
        setLanguages([
          { id: 1, code: "ru", name: "Русский" },
          { id: 2, code: "en", name: "English" },
        ]);
      });
  }, []);

  const changeLanguage = e => {
    const code = e.target.value;
    setLang(code);
    localStorage.setItem("language", code);
  };

  const selectStyle = {
    padding: "8px 12px",
    border: "1px solid var(--border-input)",
    borderRadius: "9px",
    fontFamily: "Franklin Gothic Medium",
    background: "var(--bg-input)",
    color: "var(--text-main)",
    fontSize: "13px",
    cursor: "pointer",
    outline: "none",
    transition: "background 0.2s"
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <select value={lang} onChange={changeLanguage} style={selectStyle}>
        {languages.map(l => (
          <option key={l.id} value={l.code}>
            {l.name}
          </option>
        ))}
      </select>
    </div>
  );
}