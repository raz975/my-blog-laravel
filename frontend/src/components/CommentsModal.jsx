import { useEffect, useState } from "react";
import { api } from "../api.js";
import { t } from "../translations.js";
import CommentItem from "./CommentItem.jsx";

export default function CommentsModal({ post, user, onClose, lang }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    if (!post?.id) return;
    api.getComments(post.id)
      // ИСПРАВЛЕНО: Laravel возвращает { success: true, data: [...] }
      .then(response => setComments(response.data || []))
      .catch(e => setError(e.message));
  };

  useEffect(() => { load(); }, [post?.id]);

  useEffect(() => {
    const onKey = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = async e => {
    e.preventDefault();
    if (!text.trim() || loading) return;
    setLoading(true);
    try {
      await api.createComment(post.id, text.trim());
      setText("");
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!post) return null;

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000 }} />

      <div style={{ position: "fixed", top: 0, right: 0, width: "50%", minWidth: "360px", height: "100vh", background: "var(--bg-main)", borderLeft: "1px solid var(--border-color)", boxShadow: "-4px 0 20px rgba(0,0,0,0.3)", zIndex: 1001, display: "flex", flexDirection: "column", fontFamily: "Franklin Gothic Medium", color: "var(--text-main)", transition: "background 0.3s" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-card)" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "18px" }}>💬 {t(lang, "comments")}</h3>
            <small style={{ color: "var(--text-muted)" }}>{post.title}</small>
          </div>

          <button
            onClick={onClose}
            title={t(lang, "closeEsc")}
            style={{ border: "none", background: "transparent", fontSize: "26px", cursor: "pointer", color: "var(--text-main)", padding: "0 8px", lineHeight: 1, borderRadius: "8px" }}
          >
            ✕
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
          {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
          {comments.length ? (
            comments.map(c => (
              <CommentItem key={c.id} comment={c} user={user} postOwnerId={post.user_id} onUpdate={load} onDelete={load} lang={lang} />
            ))
          ) : (
            <p style={{ color: "var(--text-muted)", textAlign: "center", marginTop: "40px" }}>
              {t(lang, "noComments")}
            </p>
          )}
        </div>

        <form onSubmit={submit} style={{ padding: "14px 20px", borderTop: "1px solid var(--border-color)", display: "flex", gap: "10px", background: "var(--bg-card)" }}>
          <input
            type="text"
            placeholder={user ? t(lang, "writeComment") : t(lang, "loginToComment")}
            value={text}
            onChange={e => setText(e.target.value)}
            disabled={!user}
            style={{ flex: 1, padding: "10px 14px", border: "1px solid var(--border-input)", borderRadius: "20px", background: "var(--bg-input)", color: "var(--text-main)", fontFamily: "Franklin Gothic Medium", outline: "none" }}
          />
          <button type="submit" disabled={!user || loading || !text.trim()} style={{ border: "none", borderRadius: "20px", padding: "10px 20px", cursor: user && text.trim() ? "pointer" : "not-allowed", background: "var(--accent)", color: "white", fontFamily: "Franklin Gothic Medium", opacity: !user || !text.trim() ? 0.5 : 1 }}>
            ➤
          </button>
        </form>
      </div>
    </>
  );
}