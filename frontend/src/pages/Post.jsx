import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../api.js";
import { t } from "../translations.js";
import CommentsModal from "../components/CommentsModal.jsx";

export default function Post({ user, lang }) {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [post, setPost] = useState(null);
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Загружаем пост
    api.getPost(id, lang)
      .then((postRes) => {
        const postData = postRes.data || postRes;
        setPost(postData);
        setLoading(false);

        // Параллельно грузим картинку
        api.getPostImage(id)
          .then((imgRes) => {
            if (imgRes && imgRes.image) {
              setImage("http://127.0.0.1:8000" + imgRes.image.url);
            }
          })
          .catch(() => {});
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id, lang]);

  const handleLike = async () => {
    if (!user) return alert("Войдите, чтобы лайкать");
    try {
      const res = await api.likePost(id);
      setPost(prev => ({ ...prev, likes: res.likes, liked_by_me: res.liked }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Вы уверены, что хотите удалить пост?")) return;
    try {
      await api.deletePost(id);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p style={{ textAlign: "center", marginTop: "50px", color: "var(--text-main)" }}>Загрузка...</p>;
  if (error) return <p style={{ textAlign: "center", color: "var(--danger)", marginTop: "50px" }}>{error}</p>;
  if (!post) return <p style={{ textAlign: "center", marginTop: "50px", color: "var(--text-main)" }}>Пост не найден</p>;

  const isAuthor = Number(user?.id) === Number(post.user_id);
  const isAdmin = user?.role === "admin";
  
  // Изменять может ТОЛЬКО автор
  const canEdit = isAuthor; 
  
  // Удалять может автор ИЛИ админ
  const canDelete = isAuthor || isAdmin;

  return (
    <div style={{ maxWidth: "800px", margin: "30px auto", fontFamily: "Franklin Gothic Medium", color: "var(--text-main)" }}>
      
      <div style={{ background: "var(--bg-card)", padding: "30px", borderRadius: "14px", boxShadow: "var(--shadow)", marginBottom: "20px" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <h1 style={{ margin: "0 0 10px" }}>{post.title}</h1>
          
          <div style={{ display: "flex", gap: "10px" }}>
            {/* Кнопка "Редактировать" - только автору */}
            {canEdit && (
              <Link to={`/posts/${post.id}/edit`} style={{ textDecoration: "none", background: "var(--accent)", color: "white", padding: "6px 12px", borderRadius: "8px", fontSize: "13px" }}>
                Редактировать
              </Link>
            )}
            
            {/* Кнопка "Удалить" - автору и админу */}
            {canDelete && (
              <button onClick={handleDelete} style={{ border: "none", background: "var(--danger)", color: "white", padding: "6px 12px", borderRadius: "8px", cursor: "pointer", fontSize: "13px" }}>
                Удалить
              </button>
            )}
          </div>
        </div>

        <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "20px" }}>
          Автор: <Link to={`/user/${post.user_id}`} style={{ color: "var(--accent)", textDecoration: "none" }}>{post.author || `User ${post.user_id}`}</Link>
        </p>

        {image && (
          <div style={{ marginBottom: "20px", textAlign: "center" }}>
            <img src={image} alt={post.title} style={{ maxWidth: "100%", maxHeight: "400px", borderRadius: "10px", objectFit: "cover" }} />
          </div>
        )}

        <p style={{ fontSize: "16px", lineHeight: "1.6", whiteSpace: "pre-wrap", marginBottom: "20px" }}>
          {post.content}
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <button onClick={handleLike} style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: "18px", color: post.liked_by_me ? "#e91e63" : "var(--text-muted)" }}>
            {post.liked_by_me ? "❤️" : "🤍"} {post.likes || 0}
          </button>
          
          <button onClick={() => setIsCommentsOpen(true)} style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: "18px", color: "var(--text-muted)" }}>
            💬 Комментарии
          </button>
        </div>
      </div>

      {isCommentsOpen && (
        <CommentsModal post={post} user={user} lang={lang} onClose={() => setIsCommentsOpen(false)} />
      )}
    </div>
  );
}