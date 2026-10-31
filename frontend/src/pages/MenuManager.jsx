import { useEffect, useState } from "react";
import { api } from "../api.js";
import { t } from "../translations.js";
import MenuTree from "../components/MenuTree.jsx";

export default function MenuManager({ user, lang }) {
  const [menu, setMenu] = useState([]);
  const [items, setItems] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [activeTab, setActiveTab] = useState("ru");
  const [translations, setTranslations] = useState({});
  const [url, setUrl] = useState("");
  const [parentId, setParentId] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isAdmin = user?.role === "admin";

  const load = async () => {
    try {
      const response = await api.getMenu(lang);
      const flatItems = response.data || [];
      
      const buildTree = (list, parent = null) => {
        return list
          .filter(item => item.parent_id === parent)
          .map(item => ({
            ...item,
            children: buildTree(list, item.id)
          }));
      };

      const tree = buildTree(flatItems);
      setMenu(tree);
      setItems(flatItems);
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => {
    api.getPublicLanguages()
      .then(response => {
        const langs = response.data || [];
        setLanguages(langs);
        
        const initial = {};
        langs.forEach(l => { initial[l.code] = ""; });
        setTranslations(initial);
        
        const active = langs.find(l => l.is_active === 1) || langs[0];
        if (active) setActiveTab(active.code);
      })
      .catch(() => {});
    load();
  }, [lang]);

  const reset = () => {
    setEditingId(null);
    setUrl("");
    setParentId("");
    const empty = {};
    languages.forEach(l => { empty[l.code] = ""; });
    setTranslations(empty);
    setError("");
  };

  const edit = item => {
    if (!isAdmin) return;
    setEditingId(item.id);
    setUrl(item.url || "");
    setParentId(item.parent_id || "");

    const initial = {};
    languages.forEach(l => {
      initial[l.code] = l.code === (lang || "ru") ? (item.name || "") : "";
    });
    setTranslations(initial);
    setError("");
  };

  const remove = async id => {
    if (!isAdmin) return;
    if (!confirm(t(lang, "deleteMenuConfirm"))) return;
    try {
      await api.deleteMenuItem(id);
      reset();
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const submit = async e => {
    e.preventDefault();
    if (!isAdmin) return;
    setLoading(true);
    setError("");

    const mainName = translations[activeTab] || "";
    if (!mainName.trim()) {
      setError(`${t(lang, "titleRequired")}: ${activeTab}`);
      setLoading(false);
      return;
    }

    const data = {
      title: mainName.trim(),
      name: mainName.trim(),
      url: url || null,
      parent_id: parentId ? Number(parentId) : null,
    };

    try {
      if (editingId) {
        await api.updateMenuItem({ id: editingId, ...data });
      } else {
        await api.createMenuItem(data);
      }
      reset();
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = newTopItems => {
    const allOrdered = [];
    const collect = (list, parentId = null) => {
      list.forEach((it, i) => {
        allOrdered.push({ id: it.id, sort_order: i, parent_id: parentId });
        if (it.children?.length) collect(it.children, it.id);
      });
    };
    collect(newTopItems);

    api.reorderMenu(allOrdered)
      .then(() => load())
      .catch(err => console.warn("Reorder error:", err.message));
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
    <div style={{ display: "flex", gap: "35px", alignItems: "flex-start", maxWidth: "950px", margin: "30px auto", fontFamily: "Franklin Gothic Medium", color: "var(--text-main)" }}>
      <aside style={{ width: "360px", background: "var(--bg-row-alt)", borderRadius: "14px", padding: "20px", boxSizing: "border-box", boxShadow: "var(--shadow-small)", color: "var(--text-main)", transition: "background 0.3s" }}>
        <h2 style={{ margin: "0 0 20px", color: "var(--text-main)" }}>{t(lang, "menu")}</h2>

        {error && <p style={{ color: "var(--danger)", marginBottom: "15px" }}>{error}</p>}

        {isAdmin && <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "10px" }}>{t(lang, "dragToReorder")}</p>}

        {menu.length ? (
          <MenuTree
            items={menu}
            setItems={handleReorder}
            onEdit={edit}
            onDelete={remove}
            isAdmin={isAdmin}
            lang={lang}
          />
        ) : (
          !error && <p style={{ color: "var(--text-main)" }}>{t(lang, "noMenuItems")}</p>
        )}
      </aside>

      {isAdmin && (
        <div style={{ background: "var(--bg-card)", boxShadow: "var(--shadow)", borderRadius: "14px", padding: "20px", fontFamily: "Franklin Gothic Medium", width: "340px", boxSizing: "border-box", color: "var(--text-main)", transition: "background 0.3s" }}>
          <h2 style={{ margin: "0 0 20px", color: "var(--text-main)" }}>
            {editingId ? t(lang, "editMenu") : t(lang, "createMenu")}
          </h2>

          <div style={{ display: "flex", gap: "5px", marginBottom: "15px", flexWrap: "wrap" }}>
            {languages.map(l => (
              <button
                key={l.code}
                type="button"
                onClick={() => setActiveTab(l.code)}
                style={{
                  border: "none",
                  borderRadius: "8px",
                  padding: "6px 12px",
                  cursor: "pointer",
                  fontFamily: "Franklin Gothic Medium",
                  background: activeTab === l.code ? "var(--accent)" : "var(--bg-hover)",
                  color: activeTab === l.code ? "white" : "var(--text-main)",
                  fontSize: "13px"
                }}
              >
                {l.name}
              </button>
            ))}
          </div>

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <input
              style={inputStyle}
              placeholder={`${t(lang, "itemName")} (${activeTab})`}
              value={translations[activeTab] || ""}
              onChange={e => setTranslations({ ...translations, [activeTab]: e.target.value })}
            />

            <input
              style={inputStyle}
              placeholder={t(lang, "urlRoute")}
              value={url}
              onChange={e => setUrl(e.target.value)}
            />

            <select
              style={{ ...inputStyle, width: "240px", cursor: "pointer" }}
              value={parentId}
              onChange={e => setParentId(e.target.value)}
            >
              <option value="">{t(lang, "noParent")}</option>
              {items
                .filter(x => Number(x.id) !== Number(editingId))
                .map(x => (
                  <option key={x.id} value={x.id}>{x.name}</option>
                ))}
            </select>

            <div style={{ display: "flex", gap: "10px" }}>
              <button type="submit" disabled={loading} style={{ border: "none", borderRadius: "10px", padding: "9px 17px", cursor: "pointer", fontFamily: "Franklin Gothic Medium", background: "var(--accent)", color: "white", width: "80px", height: "35px" }}>
                {loading ? t(lang, "saving") : editingId ? t(lang, "save") : t(lang, "create")}
              </button>

              {editingId && (
                <button type="button" onClick={reset} style={{ border: "none", borderRadius: "10px", padding: "9px 17px", cursor: "pointer", fontFamily: "Franklin Gothic Medium", width: "80px", height: "35px", color: "white", backgroundColor: "var(--danger)" }}>
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