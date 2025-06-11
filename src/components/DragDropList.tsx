import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface DragDropItem {
  id: string;
  order_index?: number | null;
}

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  disabled?: boolean;
}

const SortableItem: React.FC<SortableItemProps> = ({ id, children, disabled = false }) => {
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
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div className="flex items-center">
        <button
          {...attributes}
          {...listeners}
          className={`absolute left-2 top-1/2 transform -translate-y-1/2 z-10 p-1 text-gray-400 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100 ${
            disabled ? 'cursor-not-allowed opacity-30' : 'cursor-grab active:cursor-grabbing'
          }`}
          disabled={disabled}
          aria-label="Drag to reorder"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <div className="pl-8 w-full">
          {children}
        </div>
      </div>
    </div>
  );
};

interface DragDropListProps<T extends DragDropItem> {
  items: T[];
  onReorder: (oldIndex: number, newIndex: number) => void;
  children: (item: T, index: number) => React.ReactNode;
  disabled?: boolean;
}

export function DragDropList<T extends DragDropItem>({
  items,
  onReorder,
  children,
  disabled = false,
}: DragDropListProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
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
      <SortableContext items={sortedItems.map(item => item.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {sortedItems.map((item, index) => (
            <SortableItem key={item.id} id={item.id} disabled={disabled}>
              {children(item, index)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
} 