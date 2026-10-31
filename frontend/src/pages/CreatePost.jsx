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
      setError("Заполните заголовок и текст поста");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.createPost({ title, content });
      
      if (response.success === false) {
        throw new Error(response.message || "Ошибка при создании поста");
      }

      const newPostId = response.data.id;

      if (image) {
        await api.uploadImage(newPostId, image);
      }

      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "260px",
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
      <div style={{ 
        background: "var(--bg-card)", 
        boxShadow: "var(--shadow)", 
        borderRadius: "14px", 
        padding: "20px"
      }}>
        <h2 style={{ margin: "0 0 15px", textAlign: "center", fontSize: "20px" }}>
          {t(lang, "createPost") || "Создать пост"}
        </h2>

        {error && <p style={{ color: "var(--danger)", marginBottom: "10px", fontSize: "13px" }}>{error}</p>}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", alignItems: 'center' }}>
          
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
              style={{ fontSize: "13px", color: "var(--text-secondary)" }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              border: "none", 
              borderRadius: "9px", 
              padding: "9px 15px", 
              cursor: loading ? "not-allowed" : "pointer", 
              background: "var(--accent)", 
              color: "white",
              fontFamily: "Franklin Gothic Medium",
              fontSize: "14px",
              width: "150px"
            }}
          >
            {loading ? "Создание..." : (t(lang, "create") || "Создать")}
          </button>

        </form>
      </div>
    </div>
  );
}