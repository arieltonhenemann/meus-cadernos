import { Link } from 'react-router-dom'
import { BookOpen, CheckSquare, Calendar, Columns3, ArrowRight, Sparkles, Clock } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'

const QUICK_ACTIONS = [
  { to: '/agenda', label: 'Agenda', desc: 'Eventos e compromissos', icon: Calendar, color: 'bg-rose-500' },
  { to: '/tarefas', label: 'Tarefas', desc: 'Sua lista de tarefas', icon: CheckSquare, color: 'bg-emerald-500' },
  { to: '/kanban', label: 'Quadro Kanban', desc: 'Organize seu fluxo', icon: Columns3, color: 'bg-sky-500' },
]

export function HomePage() {
  const { books, tasks, events } = useAppStore()

  const today = new Date().toISOString().split('T')[0]
  const todayEvents = events.filter((e) => e.date === today)
  const openTasks = tasks.filter((t) => !t.done)

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Sparkles className="h-7 w-7 text-primary" />
          Bem-vindo aos seus Cadernos
        </h1>
        <p className="text-muted-foreground mt-1">
          Crie livros, anote suas ideias, organize tarefas e gerencie seu dia.
        </p>
      </header>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3 text-muted-foreground">Acesso rápido</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {QUICK_ACTIONS.map(({ to, label, desc, icon: Icon, color }) => (
            <Link
              key={to}
              to={to}
              className="group bg-card border border-border rounded-lg p-4 flex flex-col gap-3 transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <span className={`h-10 w-10 rounded-lg flex items-center justify-center text-white ${color}`}>
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <div className="font-medium flex items-center gap-1">
                  {label}
                  <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <section className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Eventos de hoje
            </h2>
            <Link to="/agenda" className="text-xs text-primary hover:underline">
              Ver agenda
            </Link>
          </div>
          {todayEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Nenhum evento para hoje. Adicione na agenda.
            </p>
          ) : (
            <ul className="space-y-2">
              {todayEvents.map((e) => (
                <li key={e.id} className="flex items-center gap-3 text-sm">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: e.color }} />
                  <span>{e.title}</span>
                  {e.time && <span className="text-xs text-muted-foreground ml-auto">{e.time}</span>}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-primary" />
              Tarefas pendentes
            </h2>
            <Link to="/tarefas" className="text-xs text-primary hover:underline">
              Ver tarefas
            </Link>
          </div>
          {openTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Nenhuma tarefa pendente. Ótimo trabalho!
            </p>
          ) : (
            <ul className="space-y-2">
              {openTasks.slice(0, 5).map((t) => (
                <li key={t.id} className="flex items-center gap-3 text-sm">
                  <span className="h-4 w-4 rounded border border-border" />
                  <span className="line-clamp-1">{t.title}</span>
                </li>
              ))}
              {openTasks.length > 5 && (
                <li className="text-xs text-muted-foreground">
                  +{openTasks.length - 5} outras tarefas...
                </li>
              )}
            </ul>
          )}
        </section>
      </div>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-muted-foreground">Seus livros</h2>
        </div>
        {books.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-lg p-10 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground mb-4">
              Você ainda não criou nenhum livro.
              <br />
              Crie um livro pelo menu lateral (botão +) para começar.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {books.map((book) => (
              <Link
                key={book.id}
                to={`/livro/${book.id}`}
                className="group bg-card border border-border rounded-lg p-5 transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-white" />
                  </span>
                  <div>
                    <div className="font-medium line-clamp-1">{book.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {book.pages.length} {book.pages.length === 1 ? 'página' : 'páginas'}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
