import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { t } from "../translations.js";

export default function CreatePost({ lang }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError(t(lang, "fillFields") || "Заполните все поля");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const response = await api.createPost({ title, content });
      if (response.success === false) throw new Error(response.message);

      const newPostId = response.data.id;
      if (image) {
        try {
          await api.uploadImage(newPostId, image);
        } catch (imgError) {
          alert("Пост создан, но картинка не загрузилась: " + imgError.message);
        }
      }
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    height: "38px",
    padding: "8px 12px",
    border: "1px solid var(--border-input)",
    borderRadius: "9px",
    fontFamily: "Franklin Gothic Medium",
    boxSizing: "border-box",
    outline: "none",
    background: "var(--bg-input)",
    color: "var(--text-main)",
    marginBottom: "12px",
    fontSize: "14px"
  };

  return (
    <div style={{ maxWidth: "400px", margin: "40px auto", fontFamily: "Franklin Gothic Medium", color: "var(--text-main)" }}>
      <div style={{ background: "var(--bg-card)", boxShadow: "var(--shadow)", borderRadius: "14px", padding: "20px" }}>
        <h2 style={{ margin: "0 0 15px", textAlign: "center", fontSize: "28px" }}>
          {t(lang, "createPost") || "Создать пост"}
        </h2>

        {error && <p style={{ color: "var(--danger)", marginBottom: "10px", fontSize: "13px", textAlign: "center" }}>{error}</p>}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>

          <input
            style={inputStyle}
            type="text"
            placeholder={t(lang, "title") || "Заголовок"}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            style={inputStyle}
            type="text"
            placeholder={t(lang, "content") || "Текст поста"}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <div style={{ marginBottom: "15px" }}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              style={{ fontSize: "13px", color: "var(--text-secondary)", width: "100%" }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ border: "none", borderRadius: "10px", padding: "8px 14px", cursor: "pointer", fontFamily: "Franklin Gothic Medium", background: loading ? "var(--text-muted)" : "var(--accent)", color: "white", fontSize: "14px" }}
          >
            {loading ? (t(lang, "saving") || "Создание...") : (t(lang, "create") || "Создать")}
          </button>
        </form>
      </div>
    </div>
  );
}