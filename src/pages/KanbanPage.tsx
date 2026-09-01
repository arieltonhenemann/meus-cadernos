import { useState } from 'react'
import {
  DndContext,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Columns3, Plus, Trash2, GripVertical } from 'lucide-react'
import { useAppStore, generateId } from '../store/useAppStore'
import type { BoardCard, BoardStatus } from '../types'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'

const COLUMNS: { status: BoardStatus; title: string; color: string }[] = [
  { status: 'todo', title: 'A fazer', color: 'bg-slate-400' },
  { status: 'doing', title: 'Em andamento', color: 'bg-sky-500' },
  { status: 'done', title: 'Concluído', color: 'bg-emerald-500' },
]

function SortableCard({ card }: { card: BoardCard }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id })
  const deleteBoardCard = useAppStore((s) => s.deleteBoardCard)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-card border border-border rounded-md p-3 cursor-grab active:cursor-grabbing shadow-sm group"
    >
      <div className="flex items-start gap-2">
        <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium">{card.title}</p>
          {card.description && (
            <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
          )}
        </div>
        <button
          onClick={() => deleteBoardCard(card.id)}
          className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export function KanbanPage() {
  const { boardCards, addBoardCard, updateBoardCard } = useAppStore()
  const [newTitle, setNewTitle] = useState<Record<BoardStatus, string>>({
    todo: '',
    doing: '',
    done: '',
  })
  const [dragCard, setDragCard] = useState<BoardCard | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const handleDragStart = (event: any) => {
    const card = boardCards.find((c) => c.id === event.active.id)
    setDragCard(card ?? null)
  }

  const handleDragEnd = (event: any) => {
    setDragCard(null)
    const { active, over } = event
    if (!over) return

    const card = boardCards.find((c) => c.id === active.id)
    if (!card) return

    // If dropped over another card, get its status
    const overCard = boardCards.find((c) => c.id === over.id)
    if (overCard && overCard.status !== card.status) {
      updateBoardCard(card.id, { status: overCard.status })
    }
    // If dropped over a column id
    else if (['todo', 'doing', 'done'].includes(over.id)) {
      updateBoardCard(card.id, { status: over.id })
    }
  }

  const handleAdd = (status: BoardStatus) => {
    if (!newTitle[status].trim()) return
    addBoardCard({
      id: generateId(),
      title: newTitle[status].trim(),
      status,
      createdAt: Date.now(),
    })
    setNewTitle((s) => ({ ...s, [status]: '' }))
  }

  return (
    <div className="p-4 md:p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Columns3 className="h-6 w-6 text-primary" />
          Quadro Kanban
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Arraste os cartões para organizar seu fluxo de trabalho.
        </p>
      </header>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible snap-x snap-mandatory md:snap-none">
          {COLUMNS.map(({ status, title, color }) => {
            const cards = boardCards.filter((c) => c.status === status)
            return (
              <div
                key={status}
                className="bg-muted/50 rounded-lg p-3 w-72 shrink-0 snap-start md:w-auto md:flex-1"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
                  <h2 className="font-semibold text-sm">{title}</h2>
                  <span className="text-xs text-muted-foreground ml-auto">{cards.length}</span>
                </div>

                <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2 min-h-[100px]">
                    {cards.map((card) => (
                      <SortableCard key={card.id} card={card} />
                    ))}
                  </div>
                </SortableContext>

                <div className="mt-3 flex gap-2">
                  <Input
                    placeholder="Novo cartão..."
                    value={newTitle[status]}
                    onChange={(e) => setNewTitle((s) => ({ ...s, [status]: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd(status)}
                  />
                  <Button size="icon" variant="ghost" onClick={() => handleAdd(status)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        <DragOverlay>
          {dragCard && (
            <div className="bg-card border border-primary rounded-md p-3 shadow-lg">
              <p className="text-sm font-medium">{dragCard.title}</p>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
