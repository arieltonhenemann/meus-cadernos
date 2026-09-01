import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import {
  BookOpen,
  Calendar,
  CheckSquare,
  Columns3,
  Plus,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  FileText,
  Trash2,
  Pencil,
  Home,
  PanelLeftClose,
  PanelLeft,
  NotebookPen,
  LogOut,
  Moon,
  Sun,
  X,
} from 'lucide-react'
import { useAppStore, generateId } from '../../store/useAppStore'
import { useAuthStore } from '../../store/useAuthStore'
import { useTheme } from '../../hooks/useTheme'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { cn } from '../../lib/utils'

const NAV_ITEMS = [
  { to: '/', label: 'Início', icon: Home },
  { to: '/agenda', label: 'Agenda', icon: Calendar },
  { to: '/tarefas', label: 'Tarefas', icon: CheckSquare },
  { to: '/kanban', label: 'Quadro', icon: Columns3 },
]

export function Sidebar() {
  const {
    books,
    sidebarCollapsed,
    toggleSidebar,
    addBook,
    deleteBook,
    addPage,
    mobileSidebarOpen,
    setMobileSidebarOpen,
  } = useAppStore()
  const signOut = useAuthStore((s) => s.signOut)
  const { theme, toggleTheme } = useTheme()
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [collapsedBooks, setCollapsedBooks] = useState<boolean>(false)
  const [newBookName, setNewBookName] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)

  const closeMobile = () => setMobileSidebarOpen(false)

  const handleCreateBook = () => {
    if (!newBookName.trim()) return
    addBook({
      id: generateId(),
      name: newBookName.trim(),
      icon: '📔',
      color: 'text-purple-600',
      pages: [],
      createdAt: Date.now(),
    })
    setNewBookName('')
    setDialogOpen(false)
  }

  const fullAsideClasses = cn(
    'w-64 flex flex-col border-r border-border bg-card h-screen shrink-0 overflow-hidden transition-transform duration-200',
    // Mobile: fixed drawer (always full width)
    'fixed inset-y-0 left-0 z-40',
    mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full',
    // Desktop: static in flow; hidden if collapsed so the slim version takes over
    sidebarCollapsed ? 'md:hidden' : 'md:static md:translate-x-0'
  )

  return (
    <>
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Slim collapsed sidebar (desktop only) */}
      {sidebarCollapsed && (
        <aside className="hidden md:flex w-14 flex flex-col items-center border-r border-border bg-card h-screen shrink-0">
          <button
            onClick={toggleSidebar}
            className="p-2 mt-2 text-muted-foreground hover:text-foreground"
            title="Expandir menu"
          >
            <PanelLeft className="h-5 w-5" />
          </button>
          <nav className="flex flex-col gap-1 mt-4 w-full px-2">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                title={label}
                className={({ isActive }) =>
                  cn(
                    'flex justify-center p-2 rounded-md transition-colors',
                    isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
                  )
                }
              >
                <Icon className="h-5 w-5" />
              </NavLink>
            ))}
          </nav>
          <div className="border-t border-border mt-4 pt-2 w-full px-2">
            {books.slice(0, 3).map((book) => (
              <NavLink
                key={book.id}
                to={`/livro/${book.id}`}
                title={book.name}
                className={({ isActive }) =>
                  cn(
                    'flex justify-center p-2 rounded-md transition-colors',
                    isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
                  )
                }
              >
                <BookOpen className="h-5 w-5" />
              </NavLink>
            ))}
          </div>
          <div className="flex flex-col gap-1 mt-auto w-full px-2 pb-2">
            <button
              onClick={toggleTheme}
              className="flex justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </aside>
      )}

      {/* Full sidebar: desktop in-flow (when not collapsed) + mobile drawer */}
      <aside className={fullAsideClasses}>
        <div className="p-3 flex items-center justify-between border-b border-border">
          <Link to="/" onClick={closeMobile} className="flex items-center gap-2 font-semibold text-lg">
            <NotebookPen className="h-6 w-6 text-primary" />
            <span>Meus Cadernos</span>
          </Link>
          <div className="flex items-center gap-1">
            <button
              onClick={closeMobile}
              className="text-muted-foreground hover:text-foreground md:hidden"
              title="Fechar menu"
            >
              <X className="h-5 w-5" />
            </button>
            <button
              onClick={toggleSidebar}
              className="text-muted-foreground hover:text-foreground hidden md:inline-flex"
              title="Recolher menu"
            >
              <PanelLeftClose className="h-5 w-5" />
            </button>
          </div>
        </div>

        <nav onClick={closeMobile} className="p-2 flex flex-col gap-0.5">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted'
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-2 flex-1 overflow-y-auto px-2">
          <div className="flex items-center justify-between px-3 py-2">
            <button
              onClick={() => setCollapsedBooks((v) => !v)}
              className="flex items-center gap-1 text-xs font-semibold uppercase text-muted-foreground"
            >
              {collapsedBooks ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              Livros
            </button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Novo Livro</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nome do livro..."
                      value={newBookName}
                      onChange={(e) => setNewBookName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateBook()}
                      autoFocus
                    />
                    <Button onClick={handleCreateBook}>Criar</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {!collapsedBooks &&
            books.map((book) => {
              const isExpanded = expanded[book.id]
              return (
                <div key={book.id} className="mb-0.5">
                  <div className="group flex items-center rounded-md">
                    <button
                      onClick={() => setExpanded((e) => ({ ...e, [book.id]: !isExpanded }))}
                      className="flex items-center gap-1 text-muted-foreground hover:text-foreground p-1"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRight className="h-3 w-3" />
                      )}
                    </button>
                    <NavLink
                      to={`/livro/${book.id}`}
                      onClick={closeMobile}
                      className={({ isActive }) =>
                        cn(
                          'flex-1 flex items-center gap-2 px-1 py-1.5 rounded-md text-sm transition-colors',
                          isActive
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-foreground hover:bg-muted'
                        )
                      }
                    >
                      <BookOpen className="h-4 w-4" />
                      <span className="truncate">{book.name}</span>
                    </NavLink>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            addPage(book.id, {
                              id: generateId(),
                              title: 'Sem título',
                              icon: '📄',
                              content: '',
                              createdAt: Date.now(),
                              updatedAt: Date.now(),
                            })
                          }
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Nova página
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => deleteBook(book.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir livro
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {isExpanded &&
                    book.pages.map((page) => (
                      <NavLink
                        key={page.id}
                        to={`/livro/${book.id}/pagina/${page.id}`}
                        onClick={closeMobile}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-2 pl-7 pr-2 py-1.5 rounded-md text-sm transition-colors',
                            isActive
                              ? 'bg-primary/10 text-primary'
                              : 'text-muted-foreground hover:bg-muted'
                          )
                        }
                      >
                        <span className="text-xs">{page.icon}</span>
                        <span className="truncate flex-1">{page.title || 'Sem título'}</span>
                      </NavLink>
                    ))}
                </div>
              )
            })}

          {books.length === 0 && !collapsedBooks && (
            <div className="px-3 py-4 text-xs text-muted-foreground text-center border border-dashed border-border rounded-md mx-1">
              <Pencil className="h-4 w-4 mx-auto mb-1" />
              Crie seu primeiro livro clicando em +
            </div>
          )}
        </div>

        <div className="p-2 border-t border-border">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors mb-0.5"
            title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
          </button>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </aside>
    </>
  )
}