import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { t } from "../translations.js";

export default function Login({ onLogin, lang }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const data = await api.login({ email, password });
      if (!data?.user) throw new Error("Invalid response");
      onLogin(data.user);
      navigate("/");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "220px",
    height: "38px",
    padding: "8px 12px",
    border: "1px solid var(--border-input)",
    borderRadius: "9px",
    fontFamily: "Franklin Gothic Medium",
    boxSizing: "border-box",
    outline: "none",
    background: "var(--bg-input)",
    color: "var(--text-main)"
  };

  return (
    <div style={{ background: "var(--bg-card)", boxShadow: "var(--shadow)", borderRadius: "14px", padding: "20px", fontFamily: "Franklin Gothic Medium", width: "400px", minHeight: "300px", margin: "30px auto", textAlign: "center", boxSizing: "border-box", color: "var(--text-main)", transition: "background 0.3s" }}>
      <h2 style={{ margin: "0 0 28px", color: "var(--text-main)", fontSize: "30px" }}>{t(lang, "loginTitle")}</h2>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "18px" }}>
        <input style={inputStyle} type="email" placeholder={t(lang, "email")} value={email} onChange={e => setEmail(e.target.value)} required />
        <input style={inputStyle} type="password" placeholder={t(lang, "password")} value={password} onChange={e => setPassword(e.target.value)} required />
        {error && <p style={{ color: "var(--danger)", margin: "0" }}>{error}</p>}
        <button className="glow-accent" disabled={loading} style={{ border: "none", borderRadius: "10px", padding: "9px 17px", cursor: "pointer", fontFamily: "Franklin Gothic Medium", marginTop: "5px", background: "var(--accent)", color: "white", width: "80px", height: "35px" }}>
          {loading ? t(lang, "loading") : t(lang, "login")}
        </button>
      </form>
    </div>
  );
}