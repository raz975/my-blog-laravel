import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { t } from "../translations.js";

export default function Register({ lang }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const change = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await api.register(form);
      navigate("/login");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {width: "220px", height: "38px", padding: "8px 12px", border: "1px solid var(--border-input)", borderRadius: "9px", fontFamily: "Franklin Gothic Medium", boxSizing: "border-box", outline: "none", background: "var(--bg-input)", color: "var(--text-main)"};

  return (
    <div style={{ background: "var(--bg-card)", boxShadow: "var(--shadow)", borderRadius: "14px", padding: "20px", fontFamily: "Franklin Gothic Medium", width: "400px", minHeight: "330px", margin: "30px auto", textAlign: "center", boxSizing: "border-box", color: "var(--text-main)", transition: "background 0.3s" }}>
      <h2 style={{ margin: "0 0 28px", color: "var(--text-main)",fontSize: "30px" }}>{t(lang, "registerTitle")}</h2>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "17px" }}>
        <input style={inputStyle} name="name" placeholder={t(lang, "name")} value={form.name} onChange={change} required />
        <input style={inputStyle} name="email" type="email" placeholder={t(lang, "email")} value={form.email} onChange={change} required />
        <input style={inputStyle} name="password" type="password" placeholder={t(lang, "password")} value={form.password} onChange={change} required />
        {error && <p style={{ color: "var(--danger)", margin: "0" }}>{error}</p>}
        <button disabled={loading} style={{ border: "none", borderRadius: "10px", padding: "9px 17px", cursor: "pointer", fontFamily: "Franklin Gothic Medium", marginTop: "5px", background: "var(--accent)", color: "white", width: "105px", height: "35px" }}>
          {loading ? t(lang, "loading") : t(lang, "registration")}
        </button>
      </form>
    </div>
  );
}