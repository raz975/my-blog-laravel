import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { t } from "../translations.js";
import CommentsModal from "../components/CommentsModal.jsx";

function PostCard({ post, lang, user, onOpenComments }) {
  const [image, setImage] = useState(null);
  const [likes, setLikes] = useState(post.likes || 0);
  const [likedByMe, setLikedByMe] = useState(post.liked_by_me === 1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Теперь мы берем путь напрямую из поста, который присылает Laravel
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
    <div style={{ background: "var(--bg-card)", boxShadow: "var(--shadow)", borderRadius: "14px", padding: "20px", fontFamily: "Franklin Gothic Medium", width: "205px", height: "260px", boxSizing: "border-box", overflow: "hidden", display: "flex", flexDirection: "column", color: "var(--text-main)", transition: "background 0.3s" }}>
      {image && (
        <img src={image} alt={post.title} style={{ width: "100%", height: "90px", objectFit: "cover", borderRadius: "8px", marginBottom: "8px" }} />
      )}
      <h2 style={{ margin: "0 0 8px", fontSize: "20px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{post.title}</h2>
      
      <p style={{ margin: "5px 0", fontSize: "13px", color: "var(--text-secondary)" }}>
        {t(lang, "author")}: <Link to={`/user/${post.user_id}`} style={{ color: "var(--accent)", textDecoration: "none" }}>{post.author || `User ${post.user_id}`}</Link>
      </p>
      
      <p style={{ margin: "5px 0 8px", fontSize: "13px", overflow: "hidden", flex: 1 }}>{post.content?.substring(0, 40)}{post.content?.length > 40 ? "..." : ""}</p>

      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "auto" }}>
        <button onClick={toggleLike} disabled={loading || !user} style={{ border: "none", background: "transparent", cursor: user ? "pointer" : "not-allowed", fontSize: "15px", padding: "4px", color: likedByMe ? "#e91e63" : "var(--text-muted)" }}>
          {likedByMe ? "❤️" : "🤍"} {likes}
        </button>
        <button onClick={() => onOpenComments(post)} style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: "15px", padding: "4px", color: "var(--text-muted)" }}>💬</button>
        <Link to={`/posts/${post.id}`} style={{ border: "none", borderRadius: "10px", padding: "6px 10px", cursor: "pointer", fontFamily: "Franklin Gothic Medium", textDecoration: "none", display: "inline-block", background: "var(--accent)", color: "white", fontSize: "12px", marginLeft: "auto" }}>{t(lang, "readMore")}</Link>
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
    padding: "8px 12px",
    borderRadius: "9px",
    border: "1px solid var(--border-input)",
    fontFamily: "Franklin Gothic Medium",
    width: "250px",
    fontSize: "14px",
    outline: "none",
    background: "var(--bg-input)",
    color: "var(--text-main)"
  };

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "25px", flexWrap: "wrap" }}>
        <h1 style={{ fontFamily: "Franklin Gothic Medium", margin: 0, color: "var(--text-main)" }}>{t(lang, "allPosts")}</h1>
        <input style={inputStyle} type="text" placeholder={t(lang, "search")} value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
      <div style={{ display: "flex", gap: "20px", rowGap: "20px", flexWrap: "wrap" }}>
        {posts.map(post => <PostCard key={post.id} post={post} lang={lang} user={user} onOpenComments={setOpenComments} />)}
      </div>
      {!posts.length && !error && <p style={{ color: "var(--text-main)" }}>{t(lang, "noPosts")}</p>}

      {openComments && (
        <CommentsModal post={openComments} user={user} lang={lang} onClose={() => setOpenComments(null)} />
      )}
    </>
  );
}