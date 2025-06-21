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
import { type OrderedItem } from "../../types/ordered";
import { sortByOrderKey } from "../../utils/orderKey";

interface DragDropListProps<T extends OrderedItem> {
  items: T[];
  onReorder: (oldIndex: number, newIndex: number) => void;
  children: (item: T, index: number) => React.ReactNode;
  disabled?: boolean;
  showHandle?: boolean;
}

export function DragDropList<T extends OrderedItem>({
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

  // Always ensure items are sorted by order_key for consistent display
  const sortedItems = sortByOrderKey(items);

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
          {disabled && (
            <div className="flex items-center justify-center p-4 text-sm text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mr-2" />
              Reordering...
            </div>
          )}
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
