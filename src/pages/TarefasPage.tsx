import { useState } from 'react'
import { CheckSquare, Plus, Trash2, Check } from 'lucide-react'
import { useAppStore, generateId } from '../store/useAppStore'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { cn } from '../lib/utils'

export function TarefasPage() {
  const { tasks, addTask, toggleTask, deleteTask } = useAppStore()
  const [newTask, setNewTask] = useState('')

  const handleAdd = () => {
    if (!newTask.trim()) return
    addTask({
      id: generateId(),
      title: newTask.trim(),
      done: false,
      createdAt: Date.now(),
    })
    setNewTask('')
  }

  const pending = tasks.filter((t) => !t.done)
  const done = tasks.filter((t) => t.done)

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CheckSquare className="h-6 w-6 text-primary" />
          Tarefas
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {pending.length} pendentes · {done.length} concluídas
        </p>
      </header>

      <div className="flex gap-2 mb-6">
        <Input
          placeholder="Adicionar uma nova tarefa..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4" />
          Adicionar
        </Button>
      </div>

      {pending.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase mb-2">Pendentes</h2>
          <div className="bg-card border border-border rounded-lg divide-y divide-border">
            {pending.map((t) => (
              <div key={t.id} className="flex items-center gap-3 px-4 py-3 group">
                <button
                  onClick={() => toggleTask(t.id)}
                  className="h-5 w-5 rounded border-2 border-muted-foreground/40 hover:border-primary transition-colors shrink-0"
                />
                <span className="flex-1">{t.title}</span>
                <button
                  onClick={() => deleteTask(t.id)}
                  className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {done.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase mb-2">Concluídas</h2>
          <div className="bg-card border border-border rounded-lg divide-y divide-border">
            {done.map((t) => (
              <div key={t.id} className="flex items-center gap-3 px-4 py-3 group">
                <button
                  onClick={() => toggleTask(t.id)}
                  className="h-5 w-5 rounded bg-emerald-500 text-white flex items-center justify-center shrink-0"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
                <span className={cn('flex-1 line-through text-muted-foreground')}>{t.title}</span>
                <button
                  onClick={() => deleteTask(t.id)}
                  className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {tasks.length === 0 && (
        <div className="text-center text-muted-foreground py-16">
          <CheckSquare className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
          <p>Nenhuma tarefa ainda. Adicione acima para começar!</p>
        </div>
      )}
    </div>
  )
}
