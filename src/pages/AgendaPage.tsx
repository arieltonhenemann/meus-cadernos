import { useState } from 'react'
import { Calendar, Plus, Trash2 } from 'lucide-react'
import { useAppStore, generateId } from '../store/useAppStore'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { cn } from '../lib/utils'

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899']

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

export function AgendaPage() {
  const { events, addEvent, deleteEvent } = useAppStore()
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [title, setTitle] = useState('')
  const [time, setTime] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [dialogOpen, setDialogOpen] = useState(false)

  const { year, month } = currentMonth

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()

  const formatDate = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const prevMonth = () => {
    setCurrentMonth((c) => {
      const d = new Date(c.year, c.month - 1, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }

  const nextMonth = () => {
    setCurrentMonth((c) => {
      const d = new Date(c.year, c.month + 1, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }

  const handleAddEvent = () => {
    if (!title.trim()) return
    addEvent({
      id: generateId(),
      title: title.trim(),
      date: selectedDate,
      time: time || undefined,
      color,
      createdAt: Date.now(),
    })
    setTitle('')
    setTime('')
    setDialogOpen(false)
  }

  const selectedEvents = events.filter((e) => e.date === selectedDate).sort((a, b) => (a.time || '').localeCompare(b.time || ''))

  const todayStr = new Date().toISOString().split('T')[0]

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="h-6 w-6 text-primary" />
          Agenda
        </h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="md:size-auto">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Novo evento</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo evento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <Input
                placeholder="Título do evento..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
              <div className="flex gap-2">
                <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Cor</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={cn(
                        'h-7 w-7 rounded-full transition-all',
                        color === c && 'ring-2 ring-offset-2 ring-primary scale-110'
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <Button onClick={handleAddEvent} className="w-full">
                Adicionar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">
              {MONTHS[month]} {year}
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={prevMonth}>◀</Button>
              <Button variant="outline" size="sm" onClick={nextMonth}>▶</Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">
                {d}
              </div>
            ))}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const date = formatDate(day)
              const dayEvents = events.filter((e) => e.date === date)
              const isToday = date === todayStr
              const isSelected = date === selectedDate

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(date)}
                  className={cn(
                    'aspect-square rounded-md text-sm p-1 transition-colors relative',
                    isSelected && 'bg-primary/10 text-primary font-semibold',
                    !isSelected && dayEvents.length === 0 && 'text-foreground hover:bg-muted',
                    !isSelected && dayEvents.length > 0 && 'font-medium hover:bg-muted'
                  )}
                >
                  <span
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-full mx-auto',
                      isToday && 'bg-primary text-primary-foreground'
                    )}
                  >
                    {day}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                      {dayEvents.slice(0, 3).map((e) => (
                        <span key={e.id} className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: e.color }} />
                      ))}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-5">
          <h3 className="font-semibold mb-4">
            Eventos de{' '}
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: '2-digit',
              month: 'long',
            })}
          </h3>
          {selectedEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Sem eventos neste dia.
            </p>
          ) : (
            <ul className="space-y-2">
              {selectedEvents.map((e) => (
                <li
                  key={e.id}
                  className="flex items-center gap-3 p-2 rounded-md border border-border group"
                >
                  <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: e.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{e.title}</div>
                    {e.time && <div className="text-xs text-muted-foreground">{e.time}</div>}
                  </div>
                  <button
                    onClick={() => deleteEvent(e.id)}
                    className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
