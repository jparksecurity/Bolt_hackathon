import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  disabled?: boolean;
  showHandle?: boolean;
}

export const SortableItem: React.FC<SortableItemProps> = ({
  id,
  children,
  disabled = false,
  showHandle = true,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`sortable-item relative group ${isDragging ? "dragging" : ""}`}
    >
      <div className="flex items-stretch">
        {showHandle && (
          <div className="flex items-center">
            <button
              {...attributes}
              {...listeners}
              className={`drag-handle p-3 text-gray-400 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100 ${
                disabled
                  ? "cursor-not-allowed opacity-30"
                  : "cursor-grab active:cursor-grabbing"
              }`}
              disabled={disabled}
              aria-label="Drag to reorder"
            >
              <GripVertical className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className={`flex-1 ${showHandle ? "" : "pl-8"}`}>{children}</div>
      </div>
    </div>
  );
};
