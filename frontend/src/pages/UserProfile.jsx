import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api.js";
import { t } from "../translations.js";
import CommentsModal from "../components/CommentsModal.jsx";

function PostMiniCard({ post, lang, user, onOpenComments }) {
  const [likes, setLikes] = useState(post.likes || 0);
  const [likedByMe, setLikedByMe] = useState(post.liked_by_me === 1);
  const [loading, setLoading] = useState(false);

  const toggleLike = async e => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || loading) return;
    setLoading(true);
    try {
      const res = await api.likePost(post.id);
      setLikes(res.likes);
      setLikedByMe(res.liked);
    } catch (err) { console.warn(err.message); }
    finally { setLoading(false); }
  };

  const openComments = e => {
    e.preventDefault();
    e.stopPropagation();
    onOpenComments(post);
  };

  return (
    <Link
      to={`/posts/${post.id}`}
      style={{ 
        background: "var(--bg-card)", 
        borderRadius: "14px", 
        padding: "15px", 
        boxShadow: "var(--shadow-small)", 
        width: "220px", 
        boxSizing: "border-box", 
        textDecoration: "none", 
        color: "var(--text-main)", 
        display: "flex", 
        flexDirection: "column",
        height: "260px"
      }}
    >
      <div style={{ flexShrink: 0, marginBottom: "10px" }}>
        {post.image_url ? (
          <img 
            src={"http://127.0.0.1:8000" + post.image_url} 
            alt={post.title} 
            style={{ width: "100%", height: "100px", objectFit: "cover", borderRadius: "8px" }} 
            onError={e => { e.target.style.display = "none"; }} 
          />
        ) : (
          <div style={{ width: "100%", height: "100px", background: "var(--bg-hover)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "12px" }}>нет картинки</div>
        )}
      </div>

      <div style={{ flex: 1, overflow: "hidden" }}>
        <h3 style={{ margin: "0 0 5px", fontSize: "16px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{post.title}</h3>
        <p style={{ margin: "0", fontSize: "12px", color: "var(--text-secondary)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {post.content}
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "auto" }}>
        <button 
          onClick={toggleLike} 
          disabled={loading || !user} 
          style={{ border: "none", background: "transparent", cursor: user ? "pointer" : "not-allowed", fontSize: "14px", padding: "4px", color: likedByMe ? "#e91e63" : "var(--text-muted)" }}
        >
          {likedByMe ? "❤️" : "🤍"} {likes}
        </button>
        <button 
          onClick={openComments} 
          style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: "14px", padding: "4px", color: "var(--text-muted)" }}
        >
          💬
        </button>
      </div>
    </Link>
  );
}

export default function UserProfile({ user, lang }) {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [subLoading, setSubLoading] = useState(false);
  const [openComments, setOpenComments] = useState(null);

  const load = () => {
    setLoading(true);
    api.getUserProfile(id)
      .then(response => {
        const data = response.data || response;
        setProfile(data);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const toggleSubscribe = async () => {
    if (!user || subLoading) return;
    setSubLoading(true);
    try {
      if (profile.is_subscribed) {
        await api.unsubscribe(profile.id);
      } else {
        await api.subscribe(profile.id);
      }
      load();
    } catch (e) {
      alert(e.message);
    } finally {
      setSubLoading(false);
    }
  };

  if (loading) return <p style={{ fontFamily: "Franklin Gothic Medium", color: "var(--text-main)", textAlign: "center", marginTop: "40px" }}>{t(lang, "loading") || "Загрузка..."}</p>;
  if (error) return <p style={{ color: "var(--danger)", textAlign: "center", marginTop: "40px" }}>{error}</p>;
  if (!profile) return null;

  const isMe = user && Number(user.id) === Number(profile.id);

  return (
    <>
      <div style={{ maxWidth: "900px", margin: "30px auto", fontFamily: "Franklin Gothic Medium", color: "var(--text-main)" }}>
        <div style={{ background: "var(--bg-card)", borderRadius: "16px", padding: "30px", boxShadow: "var(--shadow)", display: "flex", gap: "30px", alignItems: "center", flexWrap: "wrap", marginBottom: "30px" }}>
          <div style={{ width: "100px", height: "100px", borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px", color: "white", fontWeight: "bold", flexShrink: 0 }}>
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: "250px" }}>
            <h1 style={{ margin: "0", fontSize: "26px" }}>{profile.name}</h1>
            <p style={{ margin: "8px 0", color: "var(--text-secondary)", fontSize: "14px" }}>{profile.email}</p>
            {!isMe && user && (
              <button onClick={toggleSubscribe} disabled={subLoading} style={{ marginTop: "10px", border: profile.is_subscribed ? "1px solid var(--border-color)" : "none", borderRadius: "20px", padding: "8px 24px", cursor: "pointer", fontFamily: "Franklin Gothic Medium", fontSize: "14px", background: profile.is_subscribed ? "transparent" : "var(--accent)", color: profile.is_subscribed ? "var(--text-main)" : "white", fontWeight: "bold" }}>
                {profile.is_subscribed ? (t(lang, "unsubscribe") || "Отписаться") : (t(lang, "subscribe") || "Подписаться")}
              </button>
            )}
          </div>
          <div style={{ display: "flex", gap: "25px", flexWrap: "wrap" }}>
            <Stat label={t(lang, "posts") || "Постов"} value={profile.posts?.length || 0} />
            <Stat label={t(lang, "followers") || "Подписчиков"} value={profile.followers || 0} />
            <Stat label={t(lang, "following") || "Подписок"} value={profile.following || 0} />
            <Stat label={t(lang, "likesReceived") || "Лайков"} value={"❤️ " + (profile.total_likes || 0)} />
          </div>
        </div>

        <h2 style={{ margin: "0 0 20px" }}>{t(lang, "posts") || "Посты"}</h2>
        {profile.posts?.length ? (
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            {profile.posts.map(post => (
              <PostMiniCard key={post.id} post={post} lang={lang} user={user} onOpenComments={setOpenComments} />
            ))}
          </div>
        ) : (
          <p style={{ color: "var(--text-muted)" }}>{t(lang, "noUserPosts") || "У пользователя пока нет постов."}</p>
        )}
      </div>

      {openComments && (
        <CommentsModal post={openComments} user={user} lang={lang} onClose={() => setOpenComments(null)} />
      )}
    </>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "22px", fontWeight: "bold" }}>{value}</div>
      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{label}</div>
    </div>
  );
}