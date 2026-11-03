import { useEffect, useState } from "react";
import { api } from "../api.js";
import { t } from "../translations.js";
import MenuTree from "../components/MenuTree.jsx";

export default function MenuManager({ user, lang }) {
  const [menu, setMenu] = useState([]);
  const [items, setItems] = useState([]);
  const [langs, setLangs] = useState([]);
  const [tab, setTab] = useState("ru");
  const [trans, setTrans] = useState({});
  const [url, setUrl] = useState("");
  const [parent, setParent] = useState("");
  const [editId, setEditId] = useState(null);
  const [err, setErr] = useState("");
  const [load, setLoad] = useState(false);

  const isAdmin = user?.role === "admin";

  const loadData = () => {
    api.getMenu(lang).then(res => {
      const flat = res.data || [];
      const build = (list, p = null) => list
        .filter(i => Number(i.parent_id) === Number(p))
        .map(i => ({ ...i, children: build(list, i.id) }));
      
      setMenu(build(flat));
      setItems(flat);
    }).catch(e => setErr(e.message));
  };

  useEffect(() => {
    api.getPublicLanguages().then(res => {
      const l = res.data || [];
      setLangs(l);
      const init = {};
      l.forEach(x => init[x.code] = "");
      setTrans(init);
      if (l.length) setTab(l[0].code);
    }).catch(() => {});
    loadData();
  }, [lang]);

  const handleReorder = (newTopItems) => {
    const allOrdered = [];
    const collect = (list, currentParentId = null) => {
      list.forEach((item, index) => {
        allOrdered.push({ 
          id: item.id, 
          sort_order: index, 
          parent_id: currentParentId 
        });
        if (item.children?.length) {
          collect(item.children, item.id);
        }
      });
    };
    collect(newTopItems);

    api.reorderMenu(allOrdered)
      .then(() => loadData()) 
      .catch(err => {
        setErr(err.message);
        loadData(); 
      });
  };

  const reset = () => {
    setEditId(null); setUrl(""); setParent(""); setErr("");
    const init = {};
    langs.forEach(l => init[l.code] = "");
    setTrans(init);
  };

  const edit = (item) => {
    if (!isAdmin) return;
    setEditId(item.id);
    setUrl(item.url || "");
    setParent(item.parent_id || "");
    setTrans({ ...trans, [tab]: item.name || "" });
  };

  const remove = async (id) => {
    if (!isAdmin || !window.confirm(t(lang, "deleteMenuConfirm"))) return;
    try {
      await api.deleteMenuItem(id);
      reset(); loadData();
    } catch (e) { setErr(e.message); }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!isAdmin || load) return;
    setLoad(true); setErr("");

    if (!trans[tab]?.trim()) {
      setErr(t(lang, "titleRequired") + ": " + tab);
      setLoad(false); return;
    }

    const data = { name: trans[tab].trim(), title: trans[tab].trim(), url: url || null, parent_id: parent ? Number(parent) : null };

    try {
      if (editId) await api.updateMenuItem({ id: editId, ...data });
      else await api.createMenuItem(data);
      reset(); loadData();
    } catch (e) { setErr(e.message); }
    finally { setLoad(false); }
  };

  const inp = { width: "100%", height: "36px", padding: "6px 10px", border: "1px solid var(--border-input)", borderRadius: "8px", background: "var(--bg-input)", color: "var(--text-main)", boxSizing: "border-box" };

  return (
    <div style={{ display: "flex", gap: "30px", alignItems: "flex-start", maxWidth: "900px", margin: "20px auto", color: "var(--text-main)", flexWrap: "wrap" }}>
      
      <aside style={{ width: "400px", background: "var(--bg-row-alt)", padding: "15px", borderRadius: "12px", boxShadow: "var(--shadow-small)" }}>
        <h2 style={{ margin: "0 0 15px", fontSize: "18px" }}>{t(lang, "menu") || "Меню"}</h2>
        {err && <p style={{ color: "var(--danger)", fontSize: "12px" }}>{err}</p>}
        {isAdmin && <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "10px" }}>{t(lang, "dragToReorder")}</p>}
        
        {menu.length ? (
          <MenuTree items={menu} setItems={handleReorder} onEdit={edit} onDelete={remove} isAdmin={isAdmin} lang={lang} />
        ) : (
          !err && <p style={{ fontSize: "14px" }}>{t(lang, "noMenuItems")}</p>
        )}
      </aside>

      {isAdmin && (
        <div style={{ width: "320px", background: "var(--bg-card)", padding: "20px", borderRadius: "12px", boxShadow: "var(--shadow)" }}>
          <h2 style={{ margin: "0 0 15px", fontSize: "18px" }}>
            {editId ? t(lang, "editMenu") : t(lang, "createMenu")}
          </h2>

          <div style={{ display: "flex", gap: "5px", marginBottom: "12px", flexWrap: "wrap" }}>
            {langs.map(l => (
              <button key={l.code} onClick={() => setTab(l.code)} type="button" style={{ border: "none", borderRadius: "6px", padding: "4px 8px", cursor: "pointer", background: tab === l.code ? "var(--accent)" : "var(--bg-hover)", color: tab === l.code ? "white" : "var(--text-main)", fontSize: "11px" }}>
                {l.name}
              </button>
            ))}
          </div>

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <input style={inp} placeholder={`${t(lang, "itemName")} (${tab})`} value={trans[tab] || ""} onChange={e => setTrans({ ...trans, [tab]: e.target.value })} required />
            <input style={inp} placeholder={t(lang, "urlRoute")} value={url} onChange={e => setUrl(e.target.value)} />
            
            <select style={{ ...inp, cursor: "pointer" }} value={parent} onChange={e => setParent(e.target.value)}>
              <option value="">{t(lang, "noParent")}</option>
              {items.filter(i => i.id !== editId).map(i => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>

            <div style={{ display: "flex", gap: "8px" }}>
              <button type="submit" disabled={load} style={{ background: "var(--accent)", color: "white", border: "none", padding: "8px 14px", borderRadius: "8px", cursor: load ? "not-allowed" : "pointer", fontSize: "13px" }}>
                {load ? "..." : editId ? t(lang, "save") : t(lang, "create")}
              </button>
              {editId && (
                <button type="button" onClick={reset} style={{ background: "var(--danger)", color: "white", border: "none", padding: "8px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "13px" }}>
                  {t(lang, "cancel")}
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}