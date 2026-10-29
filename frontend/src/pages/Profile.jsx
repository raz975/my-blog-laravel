import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { t } from "../translations.js";
import SettingsModal from "../components/SettingsModal.jsx";
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
        padding: "12px",
        boxShadow: "var(--shadow-small)",
        width: "220px",
        boxSizing: "border-box",
        textDecoration: "none",
        color: "var(--text-main)",
        display: "flex",
        flexDirection: "column"
      }}
    >
      {post.image_url ? (
        <img
          src={"http://my-api" + post.image_url}
          alt={post.title}
          style={{ width: "100%", height: "120px", objectFit: "cover", borderRadius: "10px", marginBottom: "10px" }}
          onError={e => { e.target.style.display = "none"; }}
        />
      ) : (
        <div style={{ width: "100%", height: "120px", background: "var(--bg-hover)", borderRadius: "10px", marginBottom: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "12px" }}>
          нет картинки
        </div>
      )}
      <h3 style={{ margin: "0 0 8px", fontSize: "18px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{post.title}</h3>
      <p style={{ margin: "0 0 10px", fontSize: "13px", color: "var(--text-secondary)", overflow: "hidden", flex: 1 }}>{post.content?.substring(0, 60)}{post.content?.length > 60 ? "..." : ""}</p>

      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "auto" }}>
        <button onClick={toggleLike} disabled={loading || !user} style={{ border: "none", background: "transparent", cursor: user ? "pointer" : "not-allowed", fontSize: "15px", padding: "4px", color: likedByMe ? "#e91e63" : "var(--text-muted)" }}>
          {likedByMe ? "❤️" : "🤍"} {likes}
        </button>
        <button onClick={openComments} style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: "15px", padding: "4px", color: "var(--text-muted)" }}>
          💬
        </button>
      </div>
    </Link>
  );
}

export default function Profile({ user, setUser, lang }) {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [openComments, setOpenComments] = useState(null);

  const load = () => {
    setLoading(true);
    api.getMyProfile()
      .then(data => setProfile(data.profile))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  if (loading) return <p style={{ fontFamily: "Franklin Gothic Medium", color: "var(--text-main)", textAlign: "center", marginTop: "40px" }}>{t(lang, "loading")}</p>;
  if (error) return <p style={{ color: "var(--danger)", textAlign: "center", marginTop: "40px" }}>{error}</p>;
  if (!profile) return null;

  return (
    <>
      <div style={{ maxWidth: "900px", margin: "30px auto", fontFamily: "Franklin Gothic Medium", color: "var(--text-main)" }}>
        <div style={{ background: "var(--bg-card)", borderRadius: "16px", padding: "30px", boxShadow: "var(--shadow)", display: "flex", gap: "30px", alignItems: "center", flexWrap: "wrap", transition: "background 0.3s" }}>
          <div style={{ width: "100px", height: "100px", borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px", color: "white", fontWeight: "bold", flexShrink: 0 }}>
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: "250px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "15px", flexWrap: "wrap" }}>
              <h1 style={{ margin: "0", fontSize: "26px" }}>{profile.name}</h1>
              {profile.role === "admin" && (
                <span style={{ background: "var(--accent)", color: "white", fontSize: "12px", padding: "3px 10px", borderRadius: "20px" }}>ADMIN</span>
              )}
            </div>
            <p style={{ margin: "8px 0", color: "var(--text-secondary)", fontSize: "14px" }}>{profile.email}</p>
          </div>
          <div style={{ display: "flex", gap: "25px", flexWrap: "wrap" }}>
            <Stat label={t(lang, "posts")} value={profile.posts.length} />
            <Stat label={t(lang, "followers")} value={profile.followers} />
            <Stat label={t(lang, "following")} value={profile.following} />
            <Stat label={t(lang, "likesReceived")} value={"" + profile.likes_received} />
            <button onClick={() => setShowSettings(true)} title={t(lang, "settings")} style={{ border: "none", background: "var(--accent)", borderRadius: "10px", padding: "6px 10px", cursor: "pointer", fontSize: "18px" }}>⚙️</button>
          </div>
        </div>

        <h2 style={{ margin: "30px 0 20px" }}>{t(lang, "posts")}</h2>
        {profile.posts.length ? (
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            {profile.posts.map(post => (
              <PostMiniCard key={post.id} post={post} lang={lang} user={user} onOpenComments={setOpenComments} />
            ))}
          </div>
        ) : (
          <p style={{ color: "var(--text-muted)" }}>{t(lang, "noUserPosts")}</p>
        )}
      </div>

      {showSettings && (
        <SettingsModal user={user} setUser={setUser} onClose={() => setShowSettings(false)} lang={lang} />
      )}
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