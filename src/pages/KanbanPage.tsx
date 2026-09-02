import { useEffect, useState } from 'react'
import {
  DndContext,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Columns3,
  Plus,
  Trash2,
  GripVertical,
  Circle,
  CheckCircle2,
  ListChecks,
} from 'lucide-react'
import { useAppStore, generateId } from '../store/useAppStore'
import type { BoardCard, BoardStatus, BoardSubtask } from '../types'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog'
import { cn } from '../lib/utils'

const COLUMNS: { status: BoardStatus; title: string; color: string }[] = [
  { status: 'todo', title: 'A fazer', color: 'bg-slate-400' },
  { status: 'doing', title: 'Em andamento', color: 'bg-sky-500' },
  { status: 'done', title: 'Concluído', color: 'bg-emerald-500' },
]

function SubtaskProgress({ card }: { card: BoardCard }) {
  const subtasks = card.subtasks ?? []
  if (subtasks.length === 0) return null
  const done = subtasks.filter((s) => s.done).length
  const pct = Math.round((done / subtasks.length) * 100)
  return (
    <div className="mt-2 flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[11px] text-muted-foreground whitespace-nowrap">
        {done}/{subtasks.length}
      </span>
    </div>
  )
}

function SortableCard({
  card,
  onOpen,
}: {
  card: BoardCard
  onOpen: (id: string) => void
}) {
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
      onClick={() => onOpen(card.id)}
      className="bg-card border border-border rounded-md p-3 cursor-grab active:cursor-grabbing shadow-sm group hover:border-primary/40 transition-colors"
    >
      <div className="flex items-start gap-2">
        <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium break-words">{card.title}</p>
          {card.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 break-words">
              {card.description}
            </p>
          )}
          <SubtaskProgress card={card} />
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            deleteBoardCard(card.id)
          }}
          className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function CardDialog({
  card,
  open,
  onOpenChange,
}: {
  card: BoardCard
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const updateBoardCard = useAppStore((s) => s.updateBoardCard)
  const deleteBoardCard = useAppStore((s) => s.deleteBoardCard)

  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description ?? '')
  const [newSubtask, setNewSubtask] = useState('')

  useEffect(() => {
    if (open && card) {
      setTitle(card.title)
      setDescription(card.description ?? '')
      setNewSubtask('')
    }
  }, [open, card?.id])

  const subtasks: BoardSubtask[] = card?.subtasks ?? []
  const doneCount = subtasks.filter((s) => s.done).length

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      const nextTitle = title.trim() || 'Sem título'
      if (nextTitle !== card.title) updateBoardCard(card.id, { title: nextTitle })
      if (description.trim() !== (card.description ?? ''))
        updateBoardCard(card.id, { description: description.trim() })
    }
    onOpenChange(next)
  }

  const setSubtasks = (next: BoardSubtask[]) =>
    updateBoardCard(card.id, { subtasks: next })

  const toggleSubtask = (subId: string) =>
    setSubtasks(
      subtasks.map((s) => (s.id === subId ? { ...s, done: !s.done } : s))
    )

  const removeSubtask = (subId: string) =>
    setSubtasks(subtasks.filter((s) => s.id !== subId))

  const addSubtask = () => {
    const value = newSubtask.trim()
    if (!value) return
    setSubtasks([...subtasks, { id: generateId(), title: value, done: false }])
    setNewSubtask('')
  }

  const handleDeleteCard = () => {
    deleteBoardCard(card.id)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="sr-only">Editar cartão</DialogTitle>
          <DialogDescription className="sr-only">
            Edite o título, a descrição e as subtarefas do cartão.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 block">
              Título
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título do cartão"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 block">
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Adicionar descrição mais detalhada..."
              rows={4}
              className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <ListChecks className="h-4 w-4 text-muted-foreground" />
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Checklist
              </label>
              <span className="text-xs text-muted-foreground ml-auto">
                {doneCount}/{subtasks.length} concluídas
              </span>
            </div>

            {subtasks.length > 0 && (
              <div className="space-y-1">
                {subtasks.map((sub) => (
                  <div key={sub.id} className="group/sub flex items-center gap-2 rounded px-1 py-0.5 hover:bg-accent/50">
                    <button
                      onClick={() => toggleSubtask(sub.id)}
                      className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
                    >
                      {sub.done ? (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      ) : (
                        <Circle className="h-4 w-4" />
                      )}
                    </button>
                    <span
                      className={cn(
                        'flex-1 text-sm break-words',
                        sub.done && 'line-through text-muted-foreground'
                      )}
                    >
                      {sub.title}
                    </span>
                    <button
                      onClick={() => removeSubtask(sub.id)}
                      className="text-muted-foreground hover:text-destructive opacity-0 group-hover/sub:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-2 flex gap-2">
              <Input
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addSubtask()
                }}
                placeholder="Adicionar subtarefa..."
              />
              <Button size="icon" variant="ghost" onClick={addSubtask}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="justify-between sm:justify-between">
          <Button variant="destructive" onClick={handleDeleteCard}>
            <Trash2 className="h-4 w-4" />
            Excluir cartão
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function BoardColumn({
  status,
  title,
  color,
  cards,
  newTitle,
  onNewTitleChange,
  onAdd,
  onOpen,
}: {
  status: BoardStatus
  title: string
  color: string
  cards: BoardCard[]
  newTitle: string
  onNewTitleChange: (value: string) => void
  onAdd: () => void
  onOpen: (id: string) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'bg-muted/50 rounded-lg p-3 w-72 shrink-0 snap-start md:w-auto md:flex-1 transition-shadow',
        isOver && 'ring-2 ring-primary/60'
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
        <h2 className="font-semibold text-sm">{title}</h2>
        <span className="text-xs text-muted-foreground ml-auto">{cards.length}</span>
      </div>

      <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 min-h-[100px]">
          {cards.map((card) => (
            <SortableCard key={card.id} card={card} onOpen={onOpen} />
          ))}
        </div>
      </SortableContext>

      <div className="mt-3 flex gap-2">
        <Input
          placeholder="Novo cartão..."
          value={newTitle}
          onChange={(e) => onNewTitleChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onAdd()}
        />
        <Button size="icon" variant="ghost" onClick={onAdd}>
          <Plus className="h-4 w-4" />
        </Button>
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
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selectedCard = boardCards.find((c) => c.id === selectedId) ?? null

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

    const overCard = boardCards.find((c) => c.id === over.id)
    if (overCard && overCard.status !== card.status) {
      updateBoardCard(card.id, { status: overCard.status })
    } else if (['todo', 'doing', 'done'].includes(over.id)) {
      updateBoardCard(card.id, { status: over.id })
    }
  }

  const handleAdd = (status: BoardStatus) => {
    if (!newTitle[status].trim()) return
    addBoardCard({
      id: generateId(),
      title: newTitle[status].trim(),
      status,
      subtasks: [],
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
          Arraste os cartões para organizar seu fluxo de trabalho. Clique em um cartão para editar ou
          adicionar subtarefas.
        </p>
      </header>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible snap-x snap-mandatory md:snap-none">
          {COLUMNS.map(({ status, title, color }) => (
            <BoardColumn
              key={status}
              status={status}
              title={title}
              color={color}
              cards={boardCards.filter((c) => c.status === status)}
              newTitle={newTitle[status]}
              onNewTitleChange={(value) =>
                setNewTitle((s) => ({ ...s, [status]: value }))
              }
              onAdd={() => handleAdd(status)}
              onOpen={setSelectedId}
            />
          ))}
        </div>

        <DragOverlay>
          {dragCard && (
            <div className="bg-card border border-primary rounded-md p-3 shadow-lg">
              <p className="text-sm font-medium">{dragCard.title}</p>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {selectedCard && (
        <CardDialog
          key={selectedCard.id}
          card={selectedCard}
          open={!!selectedCard}
          onOpenChange={(open) => !open && setSelectedId(null)}
        />
      )}
    </div>
  )
}