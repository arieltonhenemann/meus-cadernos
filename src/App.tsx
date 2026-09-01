import { useEffect } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { Menu, NotebookPen } from 'lucide-react'
import { Sidebar } from './components/layout/Sidebar'
import { HomePage } from './pages/HomePage'
import { AgendaPage } from './pages/AgendaPage'
import { TarefasPage } from './pages/TarefasPage'
import { KanbanPage } from './pages/KanbanPage'
import { BookPage } from './pages/BookPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { AuthPage } from './pages/AuthPage'
import { TooltipProvider } from './components/ui/tooltip'
import { useAuthStore } from './store/useAuthStore'
import { useAppStore } from './store/useAppStore'
import { setupRealtime } from './lib/realtime'

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground text-sm">Carregando...</p>
      </div>
    </div>
  )
}

function AppRoutes() {
  const { loadData, clearData, setMobileSidebarOpen } = useAppStore()

  useEffect(() => {
    loadData()
    const cleanup = setupRealtime()
    return () => {
      cleanup()
      clearData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="md:hidden flex items-center gap-3 px-4 h-12 border-b border-border bg-card shrink-0">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-1.5 -ml-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            title="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="flex items-center gap-2 font-semibold">
            <NotebookPen className="h-5 w-5 text-primary" />
            Meus Cadernos
          </span>
        </header>
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/agenda" element={<AgendaPage />} />
            <Route path="/tarefas" element={<TarefasPage />} />
            <Route path="/kanban" element={<KanbanPage />} />
            <Route path="/livro/:bookId" element={<BookPage />} />
            <Route path="/livro/:bookId/pagina/:pageId" element={<BookPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

function AppGate() {
  const { user, ready, initialize } = useAuthStore()
  const clearData = useAppStore((s) => s.clearData)

  useEffect(() => {
    const cleanup = initialize()
    return () => {
      cleanup?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Reset local data when user changes (login/logout) to avoid mixing users
  useEffect(() => {
    clearData()
  }, [user?.id, clearData])

  if (!ready) return <LoadingScreen />

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<AuthPage />} />
      </Routes>
    )
  }

  return <AppRoutes />
}

export default function App() {
  return (
    <TooltipProvider>
      <HashRouter>
        <AppGate />
      </HashRouter>
    </TooltipProvider>
  )
}
