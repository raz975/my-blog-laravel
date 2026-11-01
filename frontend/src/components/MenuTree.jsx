import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { t } from "../translations.js";

function SortableRow({ item, onEdit, onDelete, isAdmin, lang, level, onReorder }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const [open, setOpen] = useState(true); // Состояние: открыта ли папка

  const hasChildren = Array.isArray(item.children) && item.children.length > 0;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : "auto",
    position: "relative"
  };

  return (
    <li style={{ listStyle: "none", marginBottom: "8px", marginLeft: level > 0 ? "25px" : 0 }}>
      <div ref={setNodeRef} style={style} {...attributes}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "9px 11px", background: "var(--bg-row)", borderRadius: "9px", width: "fit-content", maxWidth: "100%", color: "var(--text-main)", flexWrap: "wrap" }}>
          
          {isAdmin && (
            <span {...listeners} style={{ cursor: isDragging ? "grabbing" : "grab", userSelect: "none", fontSize: "18px", color: "var(--text-muted)", touchAction: "none" }} title="Перетащить">
              ☰
            </span>
          )}

          <span 
            onClick={() => hasChildren && setOpen(prev => !prev)} 
            style={{ cursor: hasChildren ? "pointer" : "default", userSelect: "none", display: "flex", alignItems: "center" }}
          >
            {hasChildren && (
              <span style={{ fontSize: "10px", marginRight: "4px", color: "var(--text-muted)" }}>
                {open ? "▼" : "▶"}
              </span>
            )}
            <span style={{ fontSize: "16px" }}>
              {hasChildren ? (open ? "📂" : "📁") : "📄"}
            </span>
          </span>

          <span style={{ fontWeight: "bold", fontSize: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "140px" }}>
            {item.display_name || item.name}
          </span>
          {item.url && (
            <small style={{ color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              ({item.url})
            </small>
          )}

          {isAdmin && (
            <div style={{ display: "flex", gap: "6px", marginLeft: "auto" }}>
              <button type="button" onClick={() => onEdit(item)} style={{ border: "none", borderRadius: "6px", padding: "4px 8px", cursor: "pointer", background: "var(--accent)", color: "white", fontSize: "11px" }}>
                {t(lang, "edit") || "Изменить"}
              </button>
              <button type="button" onClick={() => onDelete(item.id)} style={{ border: "none", borderRadius: "6px", padding: "4px 8px", cursor: "pointer", background: "var(--danger)", color: "white", fontSize: "11px" }}>
                {t(lang, "delete") || "Удалить"}
              </button>
            </div>
          )}
        </div>

        {hasChildren && open && (
          <MenuTree 
            items={item.children} 
            setItems={(newChildren) => onReorder({ ...item, children: newChildren })} 
            onEdit={onEdit} 
            onDelete={onDelete} 
            isAdmin={isAdmin} 
            lang={lang} 
            level={level + 1} 
          />
        )}
      </div>
    </li>
  );
}

export default function MenuTree({ items = [], setItems, onEdit, onDelete, isAdmin, lang, level = 0 }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || String(active.id) === String(over.id)) return;

    const oldIndex = items.findIndex(item => String(item.id) === String(active.id));
    const newIndex = items.findIndex(item => String(item.id) === String(over.id));

    if (oldIndex !== -1 && newIndex !== -1) {
      setItems(arrayMove(items, oldIndex, newIndex));
    }
  };

  const handleChildReorder = (updatedItem) => {
    setItems(items.map(item => String(item.id) === String(updatedItem.id) ? updatedItem : item));
  };

  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis]}>
      <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
        <ul style={{ padding: 0, margin: 0, position: "relative" }}>
          {items.map(item => (
            <SortableRow 
              key={item.id} 
              item={item} 
              onEdit={onEdit} 
              onDelete={onDelete} 
              isAdmin={isAdmin} 
              lang={lang} 
              level={level} 
              onReorder={handleChildReorder} 
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}