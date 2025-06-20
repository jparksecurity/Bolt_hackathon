import React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableItem } from "../ui/SortableItem";

interface DragDropItem {
  id: string;
  order_index?: number | null;
}

interface DragDropListProps<T extends DragDropItem> {
  items: T[];
  onReorder: (oldIndex: number, newIndex: number) => void;
  children: (item: T, index: number) => React.ReactNode;
  disabled?: boolean;
  showHandle?: boolean;
}

export function DragDropList<T extends DragDropItem>({
  items,
  onReorder,
  children,
  disabled = false,
  showHandle = true,
}: DragDropListProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Sort items by order_index, fallback to array index
  const sortedItems = [...items].sort((a, b) => {
    const aOrder = a.order_index ?? 999999;
    const bOrder = b.order_index ?? 999999;
    return aOrder - bOrder;
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = sortedItems.findIndex((item) => item.id === active.id);
    const newIndex = sortedItems.findIndex((item) => item.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      onReorder(oldIndex, newIndex);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={sortedItems.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {sortedItems.map((item, index) => (
            <SortableItem
              key={item.id}
              id={item.id}
              disabled={disabled}
              showHandle={showHandle}
            >
              {children(item, index)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
