
import React, { useState, useEffect } from "react";
import { t } from "../translations.js";

const STORAGE_KEY = "menu_collapsed";

export default function MenuTree({ items, setItems, onEdit, onDelete, isAdmin, lang }) {
  const [draggedItem, setDraggedItem] = useState(null);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collapsed));
  }, [collapsed]);

  const toggle = id => setCollapsed(p => ({ ...p, [id]: !p[id] }));

  const contains = (node, id) =>
    node.id === id || (node.children || []).some(c => contains(c, id));

  const removeNode = (list, id) => {
    let removed = null;

    const result = list.filter(node => {
      if (node.id === id) {
        removed = node;
        return false;
      }
      return true;
    }).map(node => {
      const children = removeNode(node.children || [], id);
      if (!removed) removed = children.removed;
      return { ...node, children: children.list };
    });

    return { list: result, removed };
  };

  const insertAsChild = (list, targetId, dragged) =>
    list.map(node => {
      if (node.id === targetId) {
        return { ...node, children: [...(node.children || []), dragged] };
      }
      return {
        ...node,
        children: insertAsChild(node.children || [], targetId, dragged)
      };
    });

  const swapNodes = (list, firstId, secondId) => {
    const first = list.findIndex(x => x.id === firstId);
    const second = list.findIndex(x => x.id === secondId);

    if (first !== -1 && second !== -1) {
      const copy = [...list];
      [copy[first], copy[second]] = [copy[second], copy[first]];
      return copy;
    }

    return list.map(node => ({
      ...node,
      children: swapNodes(node.children || [], firstId, secondId)
    }));
  };

  const findParent = (list, id, parentId = null) => {
    for (const node of list) {
      if (node.id === id) return parentId;
      const found = findParent(node.children || [], id, node.id);
      if (found !== undefined) return found;
    }
    return undefined;
  };

  const handleDrop = (e, target) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedItem || draggedItem.id === target.id) return;
    if (contains(draggedItem, target.id)) return;

    const draggedParent = findParent(items, draggedItem.id);
    const targetParent = findParent(items, target.id);

    // Одинаковый родитель: меняем местами
    if (draggedParent === targetParent) {
      setItems(swapNodes(items, draggedItem.id, target.id));
    } else {
      // Разные родители: перемещаем внутрь
      const result = removeNode(items, draggedItem.id);
      if (result.removed) {
        setItems(insertAsChild(result.list, target.id, result.removed));
      }
    }

    setDraggedItem(null);
  };

  const renderTree = (list, level = 0) =>
    list.map(item => {
      const hasChildren = item.children?.length > 0;
      const isCollapsed = collapsed[item.id];

      return (
        <div key={item.id} style={{
          marginLeft: `${level * 15}px`,
          marginBottom: "8px"
        }}>
          <div
            draggable={isAdmin}
            onDragStart={e => {
              setDraggedItem(item);
              e.dataTransfer.effectAllowed = "move";
            }}
            onDragEnd={() => setDraggedItem(null)}
            onDragOver={e => {
              if (isAdmin) {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
              }
            }}
            onDrop={e => handleDrop(e, item)}
            style={{
              display: "flex",
              alignItems: "center",
              background: "var(--bg-card)",
              padding: "10px 15px",
              borderRadius: "8px",
              boxShadow: "var(--shadow-small)",
              gap: "10px",
              cursor: isAdmin ? "grab" : "default",
              opacity: draggedItem?.id === item.id ? 0.4 : 1,
              border: draggedItem?.id === item.id
                ? "2px dashed var(--accent)"
                : "2px solid transparent"
            }}
          >
            {isAdmin && <span style={{ color: "var(--text-muted)" }}>☰</span>}

            <button type="button"
              onClick={() => hasChildren && toggle(item.id)}
              style={{
                border: "none",
                background: "transparent",
                cursor: hasChildren ? "pointer" : "default",
                fontSize: "15px",
                padding: 0
              }}>
              {hasChildren ? (isCollapsed ? "📁" : "📂") : "📄"}
            </button>

            <span style={{
              flex: 1,
              fontWeight: "bold",
              fontSize: "14px",
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              minWidth: 0
            }}>
              {item.name}
            </span>

            {item.url && (
              <span style={{
                fontSize: "12px",
                color: "var(--text-muted)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}>
                ({item.url})
              </span>
            )}

            {isAdmin && (
              <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                <button onClick={() => onEdit(item)}
                  style={{
                    border: "none", borderRadius: "6px",
                    padding: "5px 10px", cursor: "pointer",
                    background: "var(--accent)", color: "white",
                    fontSize: "11px"
                  }}>
                  {t(lang, "edit")}
                </button>

                <button onClick={() => onDelete(item.id)}
                  style={{
                    border: "none", borderRadius: "6px",
                    padding: "5px 10px", cursor: "pointer",
                    background: "var(--danger)", color: "white",
                    fontSize: "11px"
                  }}>
                  {t(lang, "delete")}
                </button>
              </div>
            )}
          </div>

          {hasChildren && !isCollapsed && (
            <div style={{ marginTop: "8px" }}>
              {renderTree(item.children, level + 1)}
            </div>
          )}
        </div>
      );
    });

  return (
    <div>
      {items?.length ? renderTree(items) : (
        <p style={{
          color: "var(--text-muted)",
          textAlign: "center",
          marginTop: "20px",
          fontSize: "14px"
        }}>
          {t(lang, "noMenuItems")}
        </p>
      )}
    </div>
  );
}
