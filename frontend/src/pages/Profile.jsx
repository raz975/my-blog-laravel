import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { t } from "../translations.js";

export default function Profile({ user: currentUser, lang }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Состояние для модалки настроек
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Состояния для формы настроек
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const isMyProfile = !id || Number(id) === Number(currentUser?.id);
  const profileId = id || currentUser?.id;

  const loadProfile = () => {
    if (!profileId) return;
    setLoading(true);
    api.getUserProfile(profileId)
      .then(res => {
        const data = res.data || res;
        setProfile(data);
        // Заполняем форму текущими данными
        setName(data.name || "");
        setEmail(data.email || "");
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => { loadProfile(); }, [profileId]);

  const handleSubscribe = async () => {
    if (!currentUser) return navigate("/login");
    try {
      if (profile.is_subscribed) {
        await api.unsubscribe(profileId);
      } else {
        await api.subscribe(profileId);
      }
      loadProfile();
    } catch (err) {
      alert(err.message);
    }
  };

  // Сохранение имени и email
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccessMsg("");
    try {
      await api.updateProfile({ name, email });
      setSuccessMsg("Данные профиля обновлены!");
      loadProfile(); // Обновляем данные на странице
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Смена пароля
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      setError("Заполните оба поля пароля");
      return;
    }
    setSaving(true);
    setError("");
    setSuccessMsg("");
    try {
      await api.changePassword({ old_password: oldPassword, new_password: newPassword });
      setSuccessMsg("Пароль успешно изменен!");
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid var(--border-input)",
    borderRadius: "9px",
    fontFamily: "Franklin Gothic Medium",
    boxSizing: "border-box",
    outline: "none",
    background: "var(--bg-input)",
    color: "var(--text-main)",
    marginBottom: "10px"
  };

  if (loading) return <p style={{ textAlign: "center", marginTop: "50px", color: "var(--text-main)" }}>Загрузка...</p>;
  if (error) return <p style={{ textAlign: "center", color: "var(--danger)", marginTop: "50px" }}>{error}</p>;

  return (
    <div style={{ maxWidth: "900px", margin: "30px auto", fontFamily: "Franklin Gothic Medium", color: "var(--text-main)" }}>
      
      {/* Шапка профиля */}
      <div style={{ background: "var(--bg-card)", padding: "30px", borderRadius: "14px", boxShadow: "var(--shadow)", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: "0 0 10px" }}>{profile.name}</h1>
          <p style={{ color: "var(--text-muted)", margin: "0 0 15px" }}>{profile.email}</p>
          
          <div style={{ display: "flex", gap: "20px", fontSize: "14px" }}>
            <span><strong>{profile.posts?.length || 0}</strong> постов</span>
            <span><strong>{profile.followers}</strong> подписчиков</span>
            <span><strong>{profile.following}</strong> подписок</span>
            <span>❤️ <strong>{profile.total_likes}</strong> лайков</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          {isMyProfile ? (
            <button onClick={() => setIsSettingsOpen(true)} style={{ background: "var(--bg-hover)", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", color: "var(--text-main)" }}>
              ⚙️ Настройки
            </button>
          ) : (
            <button onClick={handleSubscribe} style={{ background: profile.is_subscribed ? "var(--danger)" : "var(--accent)", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", color: "white" }}>
              {profile.is_subscribed ? "Отписаться" : "Подписаться"}
            </button>
          )}
        </div>
      </div>

      {/* Посты автора */}
      <h2 style={{ marginBottom: "15px" }}>Посты автора</h2>
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {profile.posts?.length === 0 && <p style={{ color: "var(--text-muted)" }}>У пользователя пока нет постов.</p>}
        {profile.posts?.map(post => (
          <div key={post.id} style={{ background: "var(--bg-card)", borderRadius: "14px", padding: "15px", width: "240px", boxShadow: "var(--shadow)" }}>
            {post.image_url && (
              <img src={"http://127.0.0.1:8000" + post.image_url} alt="" style={{ width: "100%", height: "120px", objectFit: "cover", borderRadius: "8px", marginBottom: "10px" }} />
            )}
            <h3 style={{ margin: "0 0 5px", fontSize: "16px" }}>{post.title}</h3>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "10px" }}>❤️ {post.likes} лайков</p>
            <Link to={`/posts/${post.id}`} style={{ textDecoration: "none", background: "var(--accent)", color: "white", padding: "5px 10px", borderRadius: "6px", fontSize: "12px", display: "inline-block" }}>
              Читать
            </Link>
          </div>
        ))}
      </div>

      {/* Модалка настроек с формами */}
      {isSettingsOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ background: "var(--bg-card)", padding: "30px", borderRadius: "14px", width: "450px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ margin: 0 }}>Настройки профиля</h2>
              <button onClick={() => setIsSettingsOpen(false)} style={{ background: "transparent", border: "none", fontSize: "24px", cursor: "pointer", color: "var(--text-main)" }}>✕</button>
            </div>

            {successMsg && <p style={{ color: "var(--success)", marginBottom: "15px", textAlign: "center" }}>{successMsg}</p>}

            {/* Форма 1: Имя и Email */}
            <form onSubmit={handleUpdateProfile} style={{ marginBottom: "30px" }}>
              <h3 style={{ fontSize: "16px", marginBottom: "10px" }}>Личные данные</h3>
              
              <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", color: "var(--text-secondary)" }}>Имя</label>
              <input style={inputStyle} type="text" value={name} onChange={e => setName(e.target.value)} />

              <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", color: "var(--text-secondary)" }}>Email</label>
              <input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} />

              <button type="submit" disabled={saving} style={{ width: "100%", background: "var(--accent)", color: "white", border: "none", padding: "10px", borderRadius: "8px", cursor: saving ? "not-allowed" : "pointer", marginTop: "5px" }}>
                {saving ? "Сохранение..." : "Сохранить данные"}
              </button>
            </form>

            {/* Форма 2: Смена пароля */}
            <form onSubmit={handleChangePassword}>
              <h3 style={{ fontSize: "16px", marginBottom: "10px" }}>Смена пароля</h3>
              
              <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", color: "var(--text-secondary)" }}>Текущий пароль</label>
              <input style={inputStyle} type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} />

              <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", color: "var(--text-secondary)" }}>Новый пароль</label>
              <input style={inputStyle} type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />

              <button type="submit" disabled={saving} style={{ width: "100%", background: "var(--danger)", color: "white", border: "none", padding: "10px", borderRadius: "8px", cursor: saving ? "not-allowed" : "pointer", marginTop: "5px" }}>
                {saving ? "Смена..." : "Изменить пароль"}
              </button>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}