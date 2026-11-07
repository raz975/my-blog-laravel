
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

  const canManageMenu = ["admin", "superadmin"].includes(user?.role);

  const loadData = () => {
    api.getMenu(lang).then(res => {
      const flat = (res.data || []).sort(
        (a, b) => Number(a.sort_order) - Number(b.sort_order)
      );

      const build = (list, p = null) =>
        list.filter(i =>
          (i.parent_id == null ? null : Number(i.parent_id)) === p
        ).map(i => ({
          ...i,
          children: build(list, Number(i.id))
        }));

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
    }).catch(e => setErr(e.message));

    loadData();
  }, [lang]);

  const handleReorder = async tree => {
    const ordered = [];

    const collect = (list, parentId = null) => {
      list.forEach((item, index) => {
        ordered.push({
          id: item.id,
          sort_order: index,
          parent_id: parentId
        });

        if (item.children?.length) collect(item.children, item.id);
      });
    };

    collect(tree);

    try {
      await api.reorderMenu(ordered);
      loadData();
    } catch (e) {
      setErr(e.message);
      loadData();
    }
  };

  const reset = () => {
    setEditId(null);
    setUrl("");
    setParent("");
    setErr("");

    const init = {};
    langs.forEach(l => init[l.code] = "");
    setTrans(init);
  };

  const getDescendants = (id) => {
    const result = new Set();
    const find = (parentId) => {
      items.filter(x => Number(x.parent_id) === Number(parentId))
        .forEach(x => {
          result.add(Number(x.id));
          find(x.id);
        });
    };
    find(id);
    return result;
  };

  const edit = item => {
    if (!canManageMenu) return;

    setEditId(item.id);
    setUrl(item.url || "");
    setParent(item.parent_id || "");
    setTrans({ ...trans, [tab]: item.name || "" });
  };

  const remove = async id => {
    if (!canManageMenu ||
      !window.confirm(t(lang, "deleteMenuConfirm"))) return;

    try {
      await api.deleteMenuItem(id);
      reset();
      loadData();
    } catch (e) {
      setErr(e.message);
    }
  };

  const submit = async e => {
    e.preventDefault();
    if (!canManageMenu || load) return;

    setLoad(true);
    setErr("");

    if (!trans.ru?.trim()) {
      setErr(t(lang, "titleRequired") + ": ru");
      setLoad(false);
      return;
    }

    const data = {
      translations: trans,
      url: url || null,
      parent_id: parent ? Number(parent) : null
    };

    try {
      if (editId) {
        await api.updateMenuItem({ id: editId, ...data });
      } else {
        await api.createMenuItem(data);
      }

      reset();
      loadData();
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoad(false);
    }
  };

  const inp = {
    width: "100%",
    height: "38px",
    padding: "8px 12px",
    border: "1px solid var(--border-input)",
    borderRadius: "9px",
    background: "var(--bg-input)",
    color: "var(--text-main)",
    boxSizing: "border-box"
  };

  return (
    <div style={{
      display: "flex", gap: "30px", alignItems: "flex-start",
      maxWidth: "950px", margin: "30px auto",
      color: "var(--text-main)", flexWrap: "wrap"
    }}>
      <aside style={{
        width: "420px", background: "var(--bg-row-alt)",
        padding: "20px", borderRadius: "14px",
        boxShadow: "var(--shadow-small)"
      }}>
        <h2 style={{ margin: "0 0 20px", fontSize: "20px" }}>
          {t(lang, "menu")}
        </h2>

        {err && <p style={{ color: "var(--danger)", fontSize: "13px" }}>{err}</p>}

        {canManageMenu && (
          <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            {t(lang, "dragToReorder")}
          </p>
        )}

        {menu.length ? (
          <MenuTree
            items={menu}
            setItems={handleReorder}
            onEdit={edit}
            onDelete={remove}
            isAdmin={canManageMenu}
            lang={lang}
          />
        ) : (
          !err && <p>{t(lang, "noMenuItems")}</p>
        )}
      </aside>

      {canManageMenu && (
        <div style={{
          background: "var(--bg-card)", boxShadow: "var(--shadow)",
          borderRadius: "14px", padding: "20px",
          width: "340px", boxSizing: "border-box"
        }}>
          <h2 style={{ margin: "0 0 20px", fontSize: "20px" }}>
            {editId ? t(lang, "editMenu") : t(lang, "createMenu")}
          </h2>

          <div style={{
            display: "flex", gap: "5px",
            marginBottom: "15px", flexWrap: "wrap"
          }}>
            {langs.map(l => (
              <button key={l.code} type="button"
                onClick={() => setTab(l.code)}
                style={{
                  border: "none", borderRadius: "6px",
                  padding: "5px 10px", cursor: "pointer",
                  background: tab === l.code ? "var(--accent)" : "var(--bg-hover)",
                  color: tab === l.code ? "white" : "var(--text-main)",
                  fontSize: "12px"
                }}>
                {l.name}
              </button>
            ))}
          </div>

          <form onSubmit={submit} style={{
            display: "flex", flexDirection: "column", gap: "12px"
          }}>
            <input style={inp}
              placeholder={`${t(lang, "itemName")} (${tab})`}
              value={trans[tab] || ""}
              onChange={e => setTrans({ ...trans, [tab]: e.target.value })}
              required
            />

            <input style={inp}
              placeholder={t(lang, "urlRoute")}
              value={url}
              onChange={e => setUrl(e.target.value)}
            />

            <select style={{ ...inp, cursor: "pointer" }}
              value={parent}
              onChange={e => setParent(e.target.value)}>
              <option value="">{t(lang, "noParent")}</option>
              {items.filter(x => {
                const descendants = editId ? getDescendants(editId) : new Set();
                return Number(x.id) !== Number(editId) &&
                  !descendants.has(Number(x.id));
              }).map(x => (
                <option key={x.id} value={x.id}>{x.name}</option>
              ))}
            </select>

            <div style={{ display: "flex", gap: "10px" }}>
              <button type="submit" disabled={load}
                style={{
                  border: "none", borderRadius: "8px",
                  padding: "8px 15px", cursor: "pointer",
                  background: "var(--accent)", color: "white",
                  height: "36px", fontSize: "13px"
                }}>
                {load ? "..." : editId ? t(lang, "save") : t(lang, "create")}
              </button>

              {editId && (
                <button type="button" onClick={reset}
                  style={{
                    border: "none", borderRadius: "8px",
                    padding: "8px 15px", cursor: "pointer",
                    height: "36px", color: "white",
                    background: "var(--danger)", fontSize: "13px"
                  }}>
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
