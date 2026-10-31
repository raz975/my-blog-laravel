import { useState } from "react";
import { api } from "../api.js";
import { t } from "../translations.js";

export default function CommentItem({ comment, user, postOwnerId, onUpdate, lang }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(comment.content || comment.text || comment.body || "");
  const [error, setError] = useState("");

  const userId = Number(user?.id);
  const commentUserId = Number(comment.user_id);
  
  const isAuthor = userId === commentUserId;
  const isAdmin = user?.role === "admin";

  // Редактировать может ТОЛЬКО автор
  const canEdit = isAuthor;
  
  // Удалять может автор ИЛИ админ
  const canDelete = isAuthor || isAdmin;

  const handleUpdate = async () => {
    if (!text.trim()) return;
    try {
      await api.updateComment(comment.id, text.trim());
      setEditing(false);
      onUpdate();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t(lang, "confirmDeleteComment") || "Удалить комментарий?")) return;
    try {
      await api.deleteComment(comment.id);
      onUpdate();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div style={{ background: "var(--bg-card)", padding: "12px 15px", borderRadius: "10px", marginBottom: "10px", boxShadow: "var(--shadow-small)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
        <strong style={{ color: "var(--accent)", fontSize: "14px" }}>
          {comment.author_name || comment.author || `User ${comment.user_id}`}
        </strong>
        <small style={{ color: "var(--text-muted)", fontSize: "11px" }}>
          {comment.created_at ? new Date(comment.created_at).toLocaleDateString('ru-RU') : ""}
        </small>
      </div>

      {error && <p style={{ color: "var(--danger)", fontSize: "12px" }}>{error}</p>}

      {editing ? (
        <div>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{ width: "100%", padding: "5px", marginBottom: "5px", borderRadius: "5px", border: "1px solid var(--border-input)", background: "var(--bg-input)", color: "var(--text-main)" }}
          />
          <button onClick={handleUpdate} style={{ marginRight: "5px", background: "var(--accent)", color: "white", border: "none", padding: "3px 8px", borderRadius: "5px", cursor: "pointer" }}>
            {t(lang, "save") || "Сохранить"}
          </button>
          <button onClick={() => setEditing(false)} style={{ background: "var(--danger)", color: "white", border: "none", padding: "3px 8px", borderRadius: "5px", cursor: "pointer" }}>
            {t(lang, "cancel") || "Отмена"}
          </button>
        </div>
      ) : (
        <p style={{ margin: "0 0 8px", fontSize: "14px", wordBreak: "break-word" }}>
          {comment.content || comment.text || comment.body}
        </p>
      )}

      {!editing && (canEdit || canDelete) && (
        <div style={{ display: "flex", gap: "10px", fontSize: "12px" }}>
          
          {canEdit && (
            <button onClick={() => setEditing(true)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 0 }}>
              {t(lang, "edit") || "Изменить"}
            </button>
          )}

          {canDelete && (
            <button onClick={handleDelete} style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", padding: 0 }}>
              {t(lang, "delete") || "Удалить"}
            </button>
          )}
          
        </div>
      )}
    </div>
  );
}