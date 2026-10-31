import { useEffect, useState } from "react";
import { api } from "../api.js";
import { t } from "../translations.js";

export default function Languages({ user, lang }) {
  const [languages, setLanguages] = useState([]);
  const [error, setError] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = () => {
    api.getLanguages()
      .then(response => setLanguages(response.data || []))
      .catch(e => setError(e.message));
  };

  useEffect(() => { load(); }, []);

  const reset = () => {
    setEditingId(null);
    setCode("");
    setName("");
    setError("");
  };

  const edit = (item) => {
    setEditingId(item.id);
    setCode(item.code);
    setName(item.name);
  };

  const remove = async (id) => {
    if (!confirm("Удалить этот язык?")) return;
    try {
      await api.deleteLanguage(id);
      load();
    } catch (e) { setError(e.message); }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) {
      setError("Заполните код и название");
      return;
    }
    setLoading(true);
    try {
      const data = { code: code.trim(), name: name.trim(), is_active: 1 };
      if (editingId) {
        await api.updateLanguage({ id: editingId, ...data });
      } else {
        await api.createLanguage(data);
      }
      reset();
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const cellStyle = { padding: "10px", border: "1px solid var(--border-color)" };
  
  const inputStyle = {
    width: "100%",
    padding: "8px 12px",
    border: "1px solid var(--border-input)",
    borderRadius: "9px",
    fontFamily: "Franklin Gothic Medium",
    boxSizing: "border-box",
    outline: "none",
    background: "var(--bg-input)",
    color: "var(--text-main)",
    marginBottom: "15px"
  };

  return (
    <div style={{ display: "flex", gap: "30px", maxWidth: "1000px", margin: "30px auto", color: "var(--text-main)", fontFamily: "Franklin Gothic Medium", alignItems: "flex-start" }}>
      
      {/* ЛЕВАЯ ЧАСТЬ: Таблица со списком языков */}
      <div style={{ flex: 1 }}>
        <h1 style={{ margin: "0 0 20px" }}>{t(lang, "languages") || "Языки"}</h1>
        {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
        
        <div style={{ borderRadius: "14px", overflow: "hidden", boxShadow: "var(--shadow)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--bg-row-alt)" }}>
                <th style={cellStyle}>Код</th>
                <th style={cellStyle}>Название</th>
                <th style={cellStyle}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {languages.map(l => (
                <tr key={l.id} style={{ background: "var(--bg-row)" }}>
                  <td style={cellStyle}>{l.code}</td>
                  <td style={cellStyle}>{l.name}</td>
                  <td style={{ ...cellStyle, display: "flex", gap: "8px" }}>
                    <button onClick={() => edit(l)} style={{ border: "none", borderRadius: "8px", padding: "5px 10px", cursor: "pointer", background: "var(--accent)", color: "white" }}>Изменить</button>
                    <button onClick={() => remove(l.id)} style={{ border: "none", borderRadius: "8px", padding: "5px 10px", cursor: "pointer", background: "var(--danger)", color: "white" }}>Удалить</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ПРАВАЯ ЧАСТЬ: Форма создания (Теперь она показывается ВСЕГДА) */}
      <div style={{ 
        width: "340px", 
        background: "var(--bg-card)", 
        boxShadow: "var(--shadow)", 
        borderRadius: "14px", 
        padding: "20px", 
        boxSizing: "border-box",
        color: "var(--text-main)" 
      }}>
        <h2 style={{ margin: "0 0 20px" }}>
          {editingId ? "Изменить язык" : "Добавить язык"}
        </h2>
        <form onSubmit={submit}>
          <input 
            style={inputStyle} 
            placeholder="Код (ru/en/hy)" 
            value={code} 
            onChange={e => setCode(e.target.value)} 
          />
          <input 
            style={inputStyle} 
            placeholder="Название" 
            value={name} 
            onChange={e => setName(e.target.value)} 
          />
          
          <div style={{ display: "flex", gap: "10px" }}>
            <button 
              type="submit" 
              disabled={loading} 
              style={{ 
                border: "none", 
                borderRadius: "10px", 
                padding: "9px 17px", 
                cursor: "pointer", 
                background: "var(--accent)", 
                color: "white",
                fontFamily: "Franklin Gothic Medium"
              }}
            >
              {loading ? "Сохранение..." : editingId ? "Сохранить" : "Создать"}
            </button>
            
            {editingId && (
              <button 
                type="button" 
                onClick={reset} 
                style={{ 
                  border: "none", 
                  borderRadius: "10px", 
                  padding: "9px 17px", 
                  cursor: "pointer", 
                  background: "var(--danger)", 
                  color: "white",
                  fontFamily: "Franklin Gothic Medium"
                }}
              >
                Отмена
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}