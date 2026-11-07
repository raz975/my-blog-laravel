import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { t } from "../translations.js";

export default function EditPost({ user, lang }) {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [titleTrans, setTitleTrans] = useState({});
  const [contentTrans, setContentTrans] = useState({});
  const [languages, setLanguages] = useState([]);
  const [activeTab, setActiveTab] = useState("en");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getPublicLanguages().then(res => {
      const langs = res.data || [];
      setLanguages(langs);
      
      const active = langs.find(l => l.code === lang) || langs[0];
      if (active) setActiveTab(active.code);

      api.getPost(id, lang).then(postRes => {
        const post = postRes.data || postRes;
        
        const initialTitles = {};
        const initialContents = {};
        langs.forEach(l => {
          initialTitles[l.code] = l.code === active.code ? (post.title || "") : "";
          initialContents[l.code] = l.code === active.code ? (post.content || "") : "";
        });
        
        setTitleTrans(initialTitles);
        setContentTrans(initialContents);
        setLoading(false);
      }).catch(err => {
        setError(err.message);
        setLoading(false);
      });
    }).catch(() => setLoading(false));
  }, [id, lang]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const translations = languages.map(l => ({
      locale: l.code,
      title: titleTrans[l.code] || "",
      content: contentTrans[l.code] || ""
    })).filter(tr => tr.title.trim() && tr.content.trim());

    if (translations.length === 0) {
      setError(t(lang, "fillFields") || "Заполните хотя бы один язык");
      return;
    }
    
    setSaving(true);
    try {
      await api.updatePost({ id, translations });
      navigate(`/posts/${id}`); 
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: "100%", height: "38px", padding: "8px 12px",
    border: "1px solid var(--border-input)", borderRadius: "9px",
    fontFamily: "Franklin Gothic Medium", boxSizing: "border-box",
    outline: "none", background: "var(--bg-input)", color: "var(--text-main)",
    marginBottom: "12px", fontSize: "14px"
  };

  if (loading) return <p style={{ textAlign: "center", marginTop: "50px", color: "var(--text-main)" }}>{t(lang, "loading")}</p>;

  return (
    <div style={{ maxWidth: "400px", margin: "40px auto", fontFamily: "Franklin Gothic Medium", color: "var(--text-main)" }}>
      <div style={{ background: "var(--bg-card)", boxShadow: "var(--shadow)", borderRadius: "14px", padding: "20px" }}>
        <h2 style={{ margin: "0 0 15px", textAlign: "center", fontSize: "30px" }}>
          {t(lang, "editPost") || "Изменить пост"}
        </h2>
        
        {error && <p style={{ color: "var(--danger)", marginBottom: "10px", fontSize: "13px", textAlign: "center" }}>{error}</p>}

        <div style={{ display: "flex", gap: "5px", marginBottom: "15px", flexWrap: "wrap" }}>
          {languages.map(l => (
            <button
              key={l.code}
              type="button"
              onClick={() => setActiveTab(l.code)}
              style={{
                border: "none", borderRadius: "6px", padding: "5px 10px", cursor: "pointer",
                fontFamily: "Franklin Gothic Medium",
                background: activeTab === l.code ? "var(--accent)" : "var(--bg-hover)",
                color: activeTab === l.code ? "white" : "var(--text-main)", fontSize: "12px"
              }}
            >
              {l.name}
            </button>
          ))}
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>
          <input
            style={inputStyle}
            type="text"
            placeholder={`${t(lang, "title")} (${activeTab})`}
            value={titleTrans[activeTab] || ""}
            onChange={(e) => setTitleTrans({ ...titleTrans, [activeTab]: e.target.value })}
          />

          <input
            style={inputStyle}
            type="text"
            placeholder={`${t(lang, "content")} (${activeTab})`}
            value={contentTrans[activeTab] || ""}
            onChange={(e) => setContentTrans({ ...contentTrans, [activeTab]: e.target.value })}
          />

          <button
            type="submit"
            disabled={saving}
            style={{
              border: "none", borderRadius: "9px", padding: "10px",
              cursor: saving ? "not-allowed" : "pointer",
              background: saving ? "var(--text-muted)" : "var(--accent)",
              color: "white", fontFamily: "Franklin Gothic Medium",
              fontSize: "15px", width: "100%", boxSizing: "border-box",
              transition: "background-color 0.3s ease"
            }}
          >
            {saving ? (t(lang, "saving") || "Сохранение...") : (t(lang, "save") || "Сохранить")}
          </button>
        </form>
      </div>
    </div>
  );
}