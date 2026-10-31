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
    if (!confirm(t(lang, "confirmDelete") || "Удалить этот язык?")) return;
    try {
      await api.deleteLanguage(id);
      load();
    } catch (e) { setError(e.message); }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) {
      setError(t(lang, "fillFields") || "Заполните код и название");
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
    <div style={{ display: "flex", gap: "30px", maxWidth: "1000px", margin: "30px auto", color: "var(--text-main)", fontFamily: "Franklin Gothic Medium", alignItems: "flex-start", gap: "40px" }}>
      
      <div style={{ flex: 1 }}>
        <h1 style={{ margin: "0 0 20px" }}>{t(lang, "languages") || "Языки"}</h1>
        {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
        
        <div style={{ borderRadius: "14px", overflow: "hidden", boxShadow: "var(--shadow)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--bg-row-alt)" }}>
                <th style={cellStyle}>{t(lang, "code")}</th>
                <th style={cellStyle}>{t(lang, "name")}</th>
                <th style={cellStyle}>{t(lang, "actions")}</th>
              </tr>
            </thead>
            <tbody>
              {languages.map(l => (
                <tr key={l.id} style={{ background: "var(--bg-row)" }}>
                  <td style={cellStyle}>{l.code}</td>
                  <td style={cellStyle}>{l.name}</td>
                  <td style={{ ...cellStyle, display: "flex", gap: "8px" }}>
                    <button onClick={() => edit(l)} style={{ border: "none", borderRadius: "8px", padding: "5px 10px", cursor: "pointer", background: "var(--accent)", color: "white" }}>
                      {t(lang, "edit")}
                    </button>
                    <button onClick={() => remove(l.id)} style={{ border: "none", borderRadius: "8px", padding: "5px 10px", cursor: "pointer", background: "var(--danger)", color: "white" }}>
                      {t(lang, "delete")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ 
        width: "340px", 
        background: "var(--bg-card)", 
        boxShadow: "var(--shadow)", 
        borderRadius: "14px", 
        padding: "20px", 
        boxSizing: "border-box",
        color: "var(--text-main)",
        marginTop: "50px"
      }}>
        <h2 style={{ margin: "0 0 20px" }}>
          {editingId ? t(lang, "editLanguage") : t(lang, "addLanguage")}
        </h2>
        <form onSubmit={submit}>
          <input 
            style={inputStyle} 
            placeholder={t(lang, "enterCode")} 
            value={code} 
            onChange={e => setCode(e.target.value)} 
          />
          <input 
            style={inputStyle} 
            placeholder={t(lang, "enterName")} 
            value={name} 
            onChange={e => setName(e.target.value)} 
          />
          
          <div style={{ display: "flex", gap: "10px" }}>
            <button 
              type="submit" 
              disabled={loading} 
              style={{ 
                border: "none", borderRadius: "10px", padding: "9px 17px", 
                cursor: "pointer", background: "var(--accent)", color: "white", fontFamily: "Franklin Gothic Medium"
              }}
            >
              {loading ? t(lang, "saving") : editingId ? t(lang, "save") : t(lang, "create")}
            </button>
            
            {editingId && (
              <button 
                type="button" 
                onClick={reset} 
                style={{ 
                  border: "none", borderRadius: "10px", padding: "9px 17px", 
                  cursor: "pointer", background: "var(--danger)", color: "white", fontFamily: "Franklin Gothic Medium"
                }}
              >
                {t(lang, "cancel")}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}