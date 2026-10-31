import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { t } from "../translations.js";
import CommentsModal from "../components/CommentsModal.jsx";

function PostCard({ post, lang, user, onOpenComments }) {
  const [image, setImage] = useState(null);
  const [likes, setLikes] = useState(post.likes || 0);
  const [likedByMe, setLikedByMe] = useState(!!post.liked_by_me);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (post.image_url) {
      setImage("http://127.0.0.1:8000" + post.image_url);
    }
  }, [post.image_url]);

  const toggleLike = async () => {
    if (!user || loading) return;
    setLoading(true);
    try {
      const res = await api.likePost(post.id);
      setLikes(res.likes);
      setLikedByMe(res.liked);
    } catch (e) { console.warn(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ 
      background: "var(--bg-card)", 
      boxShadow: "var(--shadow)", 
      borderRadius: "16px", 
      padding: "16px", 
      fontFamily: "Franklin Gothic Medium", 
      width: "220px", 
      display: "flex", 
      flexDirection: "column", 
      color: "var(--text-main)", 
      transition: "transform 0.2s, box-shadow 0.2s",
      cursor: "default"
    }}>
      {/* Картинка */}
      {image ? (
        <img 
          src={image} 
          alt={post.title} 
          style={{ width: "100%", height: "120px", objectFit: "cover", borderRadius: "12px", marginBottom: "12px" }} 
        />
      ) : (
        <div style={{ width: "100%", height: "120px", background: "var(--bg-hover)", borderRadius: "12px", marginBottom: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "12px" }}>
          Нет фото
        </div>
      )}

      <h2 style={{ margin: "0 0 6px", fontSize: "18px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {post.title}
      </h2>
      
      <p style={{ margin: "0 0 12px", fontSize: "13px", color: "var(--text-secondary)" }}>
        {t(lang, "author")}: <Link to={`/user/${post.user_id}`} style={{ color: "var(--accent)", textDecoration: "none", fontWeight: "bold" }}>{post.author || `User ${post.user_id}`}</Link>
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "auto" }}>
        <button 
          onClick={toggleLike} 
          disabled={loading || !user} 
          style={{ border: "none", background: "var(--bg-input)", borderRadius: "20px", cursor: user ? "pointer" : "not-allowed", fontSize: "13px", padding: "6px 10px", color: likedByMe ? "#e91e63" : "var(--text-muted)", fontWeight: "bold" }}
        >
          {likedByMe ? "❤️" : "🤍"} {likes}
        </button>
        
        <button 
          onClick={() => onOpenComments(post)} 
          style={{ border: "none", background: "var(--bg-input)", borderRadius: "20px", cursor: "pointer", fontSize: "13px", padding: "6px 10px", color: "var(--text-muted)" }}
        >
          💬
        </button>
        
        <Link 
          to={`/posts/${post.id}`} 
          style={{ 
            border: "none", borderRadius: "20px", padding: "6px 12px", 
            cursor: "pointer", fontFamily: "Franklin Gothic Medium", 
            textDecoration: "none", display: "inline-block", 
            background: "var(--accent)", color: "white", fontSize: "12px", 
            marginLeft: "auto", fontWeight: "bold"
          }}
        >
          {t(lang, "readMore") || "Читать"}
        </Link>
      </div>
    </div>
  );
}

export default function Posts({ user, lang }) {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [openComments, setOpenComments] = useState(null);

  useEffect(() => {
    api.getPosts(lang, search)
      .then(response => setPosts(response.data || []))
      .catch(e => setError(e.message));
  }, [lang, search]);

  const inputStyle = {
    padding: "10px 16px",
    borderRadius: "12px",
    border: "1px solid var(--border-input)",
    fontFamily: "Franklin Gothic Medium",
    width: "280px",
    fontSize: "14px",
    outline: "none",
    background: "var(--bg-card)",
    color: "var(--text-main)",
    boxShadow: "var(--shadow-small)"
  };

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "15px", marginBottom: "30px", flexWrap: "wrap" }}>
        <h1 style={{ fontFamily: "Franklin Gothic Medium", margin: 0, color: "var(--text-main)", fontSize: "28px" }}>{t(lang, "allPosts")}</h1>
        <input style={inputStyle} type="text" placeholder={t(lang, "search")} value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
      
      <div style={{ display: "flex", gap: "20px", rowGap: "20px", flexWrap: "wrap" }}>
        {posts.map(post => <PostCard key={post.id} post={post} lang={lang} user={user} onOpenComments={setOpenComments} />)}
      </div>
      
      {!posts.length && !error && <p style={{ color: "var(--text-muted)" }}>{t(lang, "noPosts")}</p>}

      {openComments && (
        <CommentsModal post={openComments} user={user} lang={lang} onClose={() => setOpenComments(null)} />
      )}
    </>
  );
}