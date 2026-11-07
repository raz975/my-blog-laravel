import React, { useState } from "react";
import { t } from "../translations.js";

export default function MenuTree({ items, setItems, onEdit, onDelete, isAdmin, lang }) {
  const [draggedItem, setDraggedItem] = useState(null);

  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = "move";
    setTimeout(() => { e.target.style.opacity = "0.4"; }, 0);
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = "1";
    setDraggedItem(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, targetItem) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.id === targetItem.id) return;

    const removeNode = (list) => {
      return list.filter(node => {
        if (node.id === draggedItem.id) return false;
        if (node.children) node.children = removeNode(node.children);
        return true;
      });
    };

    const insertNode = (list) => {
      return list.map(node => {
        if (node.id === targetItem.id) {
          return { ...node, children: [...(node.children || []), draggedItem] };
        }
        if (node.children) return { ...node, children: insertNode(node.children) };
        return node;
      });
    };

    let newTree = removeNode([...items]);
    newTree = insertNode(newTree);

    const flatten = (list, parentId = null) => {
      let flat = [];
      list.forEach((it, i) => {
        flat.push({ id: it.id, sort_order: i, parent_id: parentId });
        if (it.children) flat = [...flat, ...flatten(it.children, it.id)];
      });
      return flat;
    };
    
    setItems(flatten(newTree));
  };

  const renderTree = (list, level = 0) => {
    return list.map((item) => (
      <div 
        key={item.id} 
        style={{ marginLeft: `${level * 15}px`, marginBottom: "8px" }}
      >
        <div 
          draggable={isAdmin}
          onDragStart={(e) => handleDragStart(e, item)}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, item)}
          style={{ 
            display: "flex", alignItems: "center", background: "var(--bg-card)", 
            padding: "10px 15px", borderRadius: "8px", boxShadow: "var(--shadow-small)",
            gap: "10px", cursor: isAdmin ? "grab" : "default",
            border: draggedItem?.id === item.id ? "2px dashed var(--accent)" : "2px solid transparent",
            transition: "background 0.2s"
          }}
        >
          {isAdmin && (
            <span style={{ color: "var(--text-muted)", fontSize: "18px", flexShrink: 0 }}>
              ☰
            </span>
          )}

          <span style={{ fontSize: "16px", flexShrink: 0 }}>
            {item.children && item.children.length > 0 ? "📁" : "📄"}
          </span>

          <span style={{ 
            flex: 1, fontWeight: "bold", whiteSpace: "nowrap", fontSize: "14px",
            overflow: "hidden", textOverflow: "ellipsis", minWidth: 0
          }}>
            {item.name}
          </span>

          {item.url && (
            <span style={{ 
              fontSize: "12px", color: "var(--text-muted)", 
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
            }}>
              ({item.url})
            </span>
          )}

          {isAdmin && (
            <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
              <button onClick={() => onEdit(item)} style={{ border: "none", borderRadius: "6px", padding: "5px 10px", cursor: "pointer", background: "var(--accent)", color: "white", fontSize: "11px" }}>
                {t(lang, "edit")}
              </button>
              <button onClick={() => onDelete(item.id)} style={{ border: "none", borderRadius: "6px", padding: "5px 10px", cursor: "pointer", background: "var(--danger)", color: "white", fontSize: "11px" }}>
                {t(lang, "delete")}
              </button>
            </div>
          )}
        </div>

        {item.children && item.children.length > 0 && (
          <div style={{ marginTop: "8px" }}>
            {renderTree(item.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div>
      {items && items.length > 0 ? (
        renderTree(items)
      ) : (
        <p style={{ color: "var(--text-muted)", textAlign: "center", marginTop: "20px", fontSize: "14px" }}>
          {t(lang, "noMenuItems")}
        </p>
      )}
    </div>
  );
}