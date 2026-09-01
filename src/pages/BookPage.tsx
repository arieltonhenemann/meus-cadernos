import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  FilePlus2,
  Trash2,
  ArrowLeft,
  Download,
  MoreHorizontal,
  FileText,
  BookOpen,
  Check,
} from 'lucide-react'
import { useAppStore, generateId } from '../store/useAppStore'
import { RichTextEditor } from '../components/editor/RichTextEditor'
import { PAGE_TEMPLATES } from '../lib/pageTemplates'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../components/ui/dropdown-menu'
import { Button } from '../components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { Input } from '../components/ui/input'
import { cn } from '../lib/utils'

export function BookPage() {
  const { bookId, pageId } = useParams()
  const navigate = useNavigate()
  const { books, addPage, deletePage, updatePage, deleteBook } = useAppStore()
  const [pageTitle, setPageTitle] = useState<string | null>(null)
  const [creatingPage, setCreatingPage] = useState(false)
  const [newPageTitle, setNewPageTitle] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('blank')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const book = books.find((b) => b.id === bookId)

  // Sync pageTitle when page changes
  const currentPageId = pageId
  const currentPage = book?.pages.find((p) => p.id === currentPageId)

  useEffect(() => {
    setPageTitle(currentPage?.title ?? null)
  }, [currentPageId, currentPage?.title])

  if (!book) {
    return (
      <div className="flex items-center justify-center h-full flex-col gap-4">
        <p className="text-muted-foreground">Livro não encontrado.</p>
        <Link to="/" className="text-primary hover:underline">Voltar ao início</Link>
      </div>
    )
  }

  const handleAddPage = () => {
    const template = PAGE_TEMPLATES.find((t) => t.id === selectedTemplate)
    const title = newPageTitle.trim() || template?.title || 'Sem título'
    const newId = generateId()
    addPage(book.id, {
      id: newId,
      title,
      icon: template?.emoji ?? '📄',
      content: template?.content ?? '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
    setCreatingPage(false)
    setNewPageTitle('')
    setSelectedTemplate('blank')
    navigate(`/livro/${book.id}/pagina/${newId}`)
  }

  const handleExportPDF = () => {
    const pageTitle = currentPage?.title || book.name
    const html = currentPage?.content || ''
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <html>
        <head>
          <title>${pageTitle}</title>
          <style>
            body { font-family: -apple-system, system-ui, sans-serif; padding: 40px; }
            h1 { font-size: 24px; }
            h2 { font-size: 20px; }
            h3 { font-size: 17px; }
            pre { background: #f3f4f6; padding: 12px; border-radius: 6px; }
            blockquote { border-left: 3px solid #ccc; padding-left: 12px; color: #555; }
            code { background: #f3f4f6; padding: 2px 4px; border-radius: 4px; }
            img { max-width: 100%; }
          </style>
        </head>
        <body>
          <h1>${pageTitle}</h1>
          ${html}
        </body>
      </html>
    `)
    win.document.close()
    win.focus()
    win.print()
  }

  // Page list sidebar for this book
  return (
    <div className="flex flex-col md:flex-row h-full">
      {/* Book page list: horizontal strip on mobile, side panel on desktop */}
      <div className="md:w-60 md:border-r md:border-border md:bg-card md:h-full md:flex md:flex-col md:shrink-0 border-b border-border md:border-b-0">
        <div className="p-3 md:border-b md:border-border">
          <Link
            to="/"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="h-3 w-3" />
            Voltar
          </Link>
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-sm truncate flex-1">{book.name}</h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <DialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir livro
                    </DropdownMenuItem>
                  </DialogTrigger>
                </Dialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {deleteDialogOpen && (
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Excluir este livro?</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                O livro <strong>{book.name}</strong> e todas as suas páginas serão removidos. Esta
                ação não pode ser desfeita.
              </p>
              <div className="flex justify-end gap-2 mt-2">
                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    deleteBook(book.id)
                    setDeleteDialogOpen(false)
                    navigate('/')
                  }}
                >
                  Excluir
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        <div className="flex-1 overflow-y-auto p-2 flex md:flex-col gap-1 md:gap-0 overflow-x-auto md:overflow-x-visible">
          {book.pages.length === 0 ? (
            <div className="text-xs text-muted-foreground text-center py-8 px-3 md:flex-1">
              <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
              Este livro ainda não tem páginas.
            </div>
          ) : (
            book.pages.map((page) => (
              <Link
                key={page.id}
                to={`/livro/${book.id}/pagina/${page.id}`}
                className={cn(
                  'group flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors whitespace-nowrap md:whitespace-normal',
                  currentPageId === page.id
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-foreground hover:bg-muted'
                )}
              >
                <span className="text-xs">{page.icon}</span>
                <span className="truncate flex-1">{page.title || 'Sem título'}</span>
              </Link>
            ))
          )}
        </div>

        <div className="p-2 border-t border-border">
          <Dialog open={creatingPage} onOpenChange={setCreatingPage}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <FilePlus2 className="h-4 w-4" />
                Nova página
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Nova página</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <Input
                  placeholder="Título da página (opcional)..."
                  value={newPageTitle}
                  onChange={(e) => setNewPageTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddPage()}
                  autoFocus
                />

                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">Modelo</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                    {PAGE_TEMPLATES.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedTemplate(t.id)}
                        className={cn(
                          'flex items-start gap-2 p-2.5 rounded-md border text-left transition-colors',
                          selectedTemplate === t.id
                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                            : 'border-border hover:bg-muted'
                        )}
                      >
                        <span className="text-lg leading-none">{t.emoji}</span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm font-medium">{t.name}</span>
                          <span className="block text-xs text-muted-foreground line-clamp-2">
                            {t.description}
                          </span>
                        </span>
                        {selectedTemplate === t.id && (
                          <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <Button onClick={handleAddPage} className="w-full">
                  Criar página
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Page content */}
      <div className="flex-1 overflow-y-auto">
        {!currentPage ? (
          <div className="flex items-center justify-center h-full flex-col gap-3 text-center p-6">
            <BookOpen className="h-16 w-16 text-primary/30" />
            <h2 className="text-xl font-semibold">{book.name}</h2>
            <p className="text-muted-foreground max-w-sm">
              Selecione uma página na lista ou crie uma nova página para começar a anotar.
            </p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto p-4 md:p-8 min-h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={handleExportPDF}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <Download className="h-3.5 w-3.5" />
                Exportar PDF
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      deletePage(book.id, currentPage.id)
                      navigate(`/livro/${book.id}`)
                    }}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir página
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <input
              type="text"
              value={pageTitle ?? ''}
              onChange={(e) => {
                setPageTitle(e.target.value)
                updatePage(book.id, currentPage.id, { title: e.target.value })
              }}
              placeholder="Título da página..."
              className="text-3xl font-bold bg-transparent border-none outline-none w-full mb-6 placeholder:text-muted-foreground/40"
            />

            <RichTextEditor
              content={currentPage.content}
              onChange={(html) => updatePage(book.id, currentPage.id, { content: html })}
              placeholder="Comece a escrever… Use a barra acima para formatar texto, fazer listas, blocos de código, citações e muito mais."
            />
          </div>
        )}
      </div>
    </div>
  )
}
