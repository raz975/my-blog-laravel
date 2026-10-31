import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { t } from "../translations.js";

export default function EditPost({ user, lang }) {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getPost(id, lang)
      .then(response => {
        const post = response.data || response;
        setTitle(post.title || "");
        setContent(post.content || "");
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id, lang]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError(t(lang, "fillFields") || "Заполните заголовок и текст");
      return;
    }
    setSaving(true);
    try {
      await api.updatePost({ id, title, content });
      navigate(`/posts/${id}`); 
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "10px 12px", border: "1px solid var(--border-input)",
    borderRadius: "9px", fontFamily: "Franklin Gothic Medium", boxSizing: "border-box",
    outline: "none", background: "var(--bg-input)", color: "var(--text-main)", marginBottom: "15px"
  };

  if (loading) return <p style={{ textAlign: "center", marginTop: "50px", color: "var(--text-main)" }}>{t(lang, "loading") || "Загрузка..."}</p>;

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", fontFamily: "Franklin Gothic Medium", color: "var(--text-main)" }}>
      <div style={{ background: "var(--bg-card)", boxShadow: "var(--shadow)", borderRadius: "14px", padding: "30px" }}>
        <h1 style={{ margin: "0 0 20px", textAlign: "center" }}>{t(lang, "editPost") || "Редактировать пост"}</h1>

        {error && <p style={{ color: "var(--danger)", marginBottom: "15px" }}>{error}</p>}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>
          <input style={inputStyle} type="text" placeholder={t(lang, "title") || "Заголовок"} value={title} onChange={(e) => setTitle(e.target.value)} />

          <textarea style={{ ...inputStyle, minHeight: "150px", resize: "vertical" }} placeholder={t(lang, "content") || "Текст поста..."} value={content} onChange={(e) => setContent(e.target.value)} />

          <button type="submit" disabled={saving} style={{ border: "none", borderRadius: "10px", padding: "12px", cursor: saving ? "not-allowed" : "pointer", background: "var(--accent)", color: "white", fontFamily: "Franklin Gothic Medium", fontSize: "16px" }}>
            {saving ? (t(lang, "saving") || "Сохранение...") : (t(lang, "save") || "Сохранить изменения")}
          </button>
        </form>
      </div>
    </div>
  );
}