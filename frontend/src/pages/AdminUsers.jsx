import { useEffect, useState } from "react";
import { api } from "../api.js";
import { t } from "../translations.js";

export default function AdminUsers({ user, lang }) {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  const load = () => {
    api.getUsers()
      // ГЛАВНОЕ ИСПРАВЛЕНИЕ: Laravel возвращает { success, data }, берем response.data
      .then(response => setUsers(response.data || []))
      .catch(e => setError(e.message));
  };

  useEffect(() => { load(); }, []);

  const toggleBlock = async u => {
    if (u.id === user.id) { alert(t(lang, "cannotBlockSelf")); return; }
    const action = u.is_blocked === 1 ? t(lang, "confirmUnblock") : t(lang, "confirmBlock");
    if (!confirm(action)) return;
    try {
      await api.blockUser(u.id, u.is_blocked === 1 ? 0 : 1);
      load();
    } catch (e) { alert(e.message); }
  };

  const changeRole = async u => {
    if (u.id === user.id) { alert(t(lang, "cannotChangeOwnRole")); return; }
    const newRole = u.role === "admin" ? "user" : "admin";
    if (!confirm(`${t(lang, "confirmChangeRole")} → ${newRole}`)) return;
    try {
      await api.changeRole(u.id, newRole);
      load();
    } catch (e) { alert(e.message); }
  };

  const deleteUser = async u => {
    if (u.id === user.id) { alert(t(lang, "cannotDeleteSelf")); return; }
    if (!confirm(`${t(lang, "confirmDeleteUser")} ${u.name} (${u.email})?`)) return;
    try {
      await api.deleteUser(u.id);
      load();
    } catch (e) { alert(e.message); }
  };

  const cellStyle = { padding: "10px", border: "1px solid var(--border-color)" };

  return (
    <div style={{ fontFamily: "Franklin Gothic Medium", maxWidth: "1000px", margin: "30px auto", color: "var(--text-main)" }}>
      <h1 style={{ color: "var(--text-main)" }}>{t(lang, "users")}</h1>
      {error && <p style={{ color: "var(--danger)" }}>{error}</p>}

      <div style={{ marginTop: "20px", borderRadius: "14px", overflow: "hidden", boxShadow: "var(--shadow)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--bg-row-alt)" }}>
              <th style={cellStyle}>ID</th>
              <th style={cellStyle}>{t(lang, "name")}</th>
              <th style={cellStyle}>{t(lang, "email")}</th>
              <th style={cellStyle}>{t(lang, "role")}</th>
              <th style={cellStyle}>{t(lang, "actions")}</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => {
              const isMe = u.id === user.id;
              return (
                <tr
                  key={u.id}
                  style={{
                    background: isMe
                      ? "var(--bg-me)"
                      : u.is_blocked === 1
                        ? "var(--bg-blocked)"
                        : "var(--bg-row)",
                    fontWeight: isMe ? "bold" : "normal",
                    color: "var(--text-main)"
                  }}
                >
                  <td style={cellStyle}>{u.id}</td>
                  <td style={cellStyle}>
                    {u.name} {isMe && <small style={{ color: "var(--success)" }}>({t(lang, "you")})</small>}
                  </td>
                  <td style={cellStyle}>{u.email}</td>
                  <td style={cellStyle}>
                    {u.role === "admin" ? t(lang, "roleAdmin") : t(lang, "roleUser")}
                    {u.is_blocked === 1 && <span style={{ color: "var(--danger)", marginLeft: "8px" }}>● {t(lang, "blocked")}</span>}
                  </td>
                  <td style={{ ...cellStyle, display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {isMe ? (
                      <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>— {t(lang, "you")} —</span>
                    ) : (
                      <>
                        <button
                          onClick={() => changeRole(u)}
                          style={{ border: "none", borderRadius: "8px", padding: "5px 10px", cursor: "pointer", background: "var(--accent)", color: "white" }}
                        >
                          {u.role === "admin" ? "→ User" : "→ Admin"}
                        </button>

                        <button
                          onClick={() => deleteUser(u)}
                          style={{ border: "none", borderRadius: "8px", padding: "5px 10px", cursor: "pointer", background: "var(--danger)", color: "white" }}
                        >
                          {t(lang, "delete")}
                        </button>

                        <button
                          onClick={() => toggleBlock(u)}
                          style={{ border: "none", borderRadius: "8px", padding: "5px 10px", cursor: "pointer", background: u.is_blocked === 1 ? "var(--success)" : "var(--warning)", color: "white" }}
                        >
                          {u.is_blocked === 1 ? t(lang, "unblock") : t(lang, "block")}
                        </button>

                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}