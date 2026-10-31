import { useEffect, useState } from "react";
import { api } from "../api.js";

export default function LanguageSelector({ lang, setLang }) {
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPublicLanguages()
      .then(response => {
        // Универсальная проверка: данные могут быть в response.data, response.languages или в самом response
        let langs = [];
        if (Array.isArray(response)) {
          langs = response;
        } else if (response && Array.isArray(response.data)) {
          langs = response.data;
        } else if (response && Array.isArray(response.languages)) {
          langs = response.languages;
        }

        // Если данные есть - ставим их, если нет - ставим дефолтные
        if (langs.length > 0) {
          setLanguages(langs);
        } else {
          setLanguages([
            { id: 1, code: "ru", name: "Русский" },
            { id: 2, code: "en", name: "English" },
            { id: 3, code: "hy", name: "Հայերեն" }
          ]);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Ошибка при загрузке языков:", error);
        // В случае ошибки тоже ставим дефолтные языки, чтобы не висела "Загрузка"
        setLanguages([
          { id: 1, code: "ru", name: "Русский" },
          { id: 2, code: "en", name: "English" },
          { id: 3, code: "hy", name: "Հայերեն" }
        ]);
        setLoading(false);
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
        {loading && <option value="" disabled>Загрузка...</option>}
        {languages.map(l => (
          <option key={l.id} value={l.code}>
            {l.name}
          </option>
        ))}
      </select>
    </div>
  );
}