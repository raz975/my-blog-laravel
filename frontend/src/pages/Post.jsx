import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../api.js";
import { t } from "../translations.js";
import CommentsModal from "../components/CommentsModal.jsx";

export default function Post({ user, lang }) {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [post, setPost] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.getPost(id, lang)
      .then((postRes) => {
        const postData = postRes.data || postRes;
        setPost(postData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id, lang]);

  const handleLike = async () => {
    if (!user) return alert(t(lang, "loginToLike") || "Войдите, чтобы лайкать");
    try {
      const res = await api.likePost(id);
      setPost(prev => ({ ...prev, likes: res.likes, liked_by_me: res.liked }));
    } catch (err) { console.error(err); }
  };

  const handleDelete = async () => {
    if (!confirm(t(lang, "confirmDeletePost") || "Вы уверены, что хотите удалить пост?")) return;
    try {
      await api.deletePost(id);
      navigate("/");
    } catch (err) { setError(err.message); }
  };

  if (loading) return <p style={{ textAlign: "center", marginTop: "50px", color: "var(--text-main)" }}>{t(lang, "loading") || "Загрузка..."}</p>;
  if (error) return <p style={{ textAlign: "center", color: "var(--danger)", marginTop: "50px" }}>{error}</p>;
  if (!post) return <p style={{ textAlign: "center", marginTop: "50px", color: "var(--text-main)" }}>{t(lang, "notFound") || "Пост не найден"}</p>;

  const isAuthor = Number(user?.id) === Number(post.user_id);
  const isAdmin = user?.role === "admin";
  const canEdit = isAuthor; 
  const canDelete = isAuthor || isAdmin;

  return (
    <div style={{ maxWidth: "700px", margin: "30px auto", fontFamily: "Franklin Gothic Medium", color: "var(--text-main)" }}>
      <div style={{ background: "var(--bg-card)", padding: "30px", borderRadius: "16px", boxShadow: "var(--shadow)", marginBottom: "20px" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px", gap: "15px" }}>
          <h1 style={{ margin: 0, fontSize: "26px", lineHeight: "1.3" }}>{post.title}</h1>
          
          <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
            {canEdit && (
              <Link to={`/posts/${post.id}/edit`} style={{ textDecoration: "none", background: "var(--accent)", color: "white", padding: "6px 12px", borderRadius: "8px", fontSize: "13px" }}>
                {t(lang, "edit") || "Изменить"}
              </Link>
            )}
            {canDelete && (
              <button onClick={handleDelete} style={{ border: "none", background: "var(--danger)", color: "white", padding: "6px 12px", borderRadius: "8px", cursor: "pointer", fontSize: "13px" }}>
                {t(lang, "delete") || "Удалить"}
              </button>
            )}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", marginBottom: "20px", fontSize: "13px", color: "var(--text-secondary)" }}>
          <span>{t(lang, "author") || "Автор"}: </span>
          <Link to={`/user/${post.user_id}`} style={{ color: "var(--accent)", textDecoration: "none", marginLeft: "5px", fontWeight: "bold" }}>
            {post.author || `User ${post.user_id}`}
          </Link>
        </div>

        {post.image_url && (
          <div style={{ marginBottom: "20px", display: "flex", justifyContent: "center" }}>
            <img 
              src={"http://127.0.0.1:8000" + post.image_url} 
              alt={post.title} 
              style={{ maxWidth: "100%", maxHeight: "220px", borderRadius: "10px", objectFit: "cover", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }} 
              onError={e => { e.target.style.display = "none"; }}
            />
          </div>
        )}

        <p style={{ fontSize: "15px", lineHeight: "1.6", whiteSpace: "pre-wrap", marginBottom: "20px" }}>
          {post.content}
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: "15px", paddingTop: "15px", borderTop: "1px solid var(--border-color)" }}>
          <button 
            onClick={handleLike} 
            style={{ display: "flex", alignItems: "center", gap: "6px", border: "none", background: "var(--bg-input)", cursor: "pointer", fontSize: "14px", padding: "8px 14px", borderRadius: "20px", color: post.liked_by_me ? "#e91e63" : "var(--text-main)", fontWeight: "bold" }}
          >
            {post.liked_by_me ? "❤️" : "🤍"} {post.likes || 0}
          </button>
          
          <button 
            onClick={() => setIsCommentsOpen(true)} 
            style={{ display: "flex", alignItems: "center", gap: "6px", border: "none", background: "var(--bg-input)", cursor: "pointer", fontSize: "14px", padding: "8px 14px", borderRadius: "20px", color: "var(--text-main)", fontWeight: "bold" }}
          >
            💬 {t(lang, "comments") || "Комментарии"}
          </button>
        </div>
      </div>

      {isCommentsOpen && (
        <CommentsModal post={post} user={user} lang={lang} onClose={() => setIsCommentsOpen(false)} />
      )}
    </div>
  );
}