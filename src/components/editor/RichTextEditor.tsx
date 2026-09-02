import { useEffect, useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  ListChecks,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Minus,
  ImageIcon,
  Link2,
  Loader2,
  Type,
} from 'lucide-react'
import type { Editor } from '@tiptap/core'
import { cn } from '../../lib/utils'
import { uploadImage } from '../../lib/storage'

interface RichTextEditorProps {
  content?: string
  onChange?: (html: string) => void
  placeholder?: string
  editable?: boolean
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={(e) => {
        e.preventDefault()
        onClick()
      }}
      className={cn(
        'p-1.5 rounded-md transition-colors disabled:opacity-40',
        active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
      )}
    >
      {children}
    </button>
  )
}

interface SlashItem {
  command: string
  label: string
  keywords: string[]
  icon: React.ReactNode
}

const SLASH_ITEMS: SlashItem[] = [
  { command: 'paragraph', label: 'Texto', keywords: ['texto', 'text', 'paragrafo'], icon: <Type className="h-4 w-4" /> },
  { command: 'h1', label: 'Título 1', keywords: ['titulo', 'h1', 'heading'], icon: <Heading1 className="h-4 w-4" /> },
  { command: 'h2', label: 'Título 2', keywords: ['titulo', 'h2', 'heading'], icon: <Heading2 className="h-4 w-4" /> },
  { command: 'h3', label: 'Título 3', keywords: ['titulo', 'h3', 'heading'], icon: <Heading3 className="h-4 w-4" /> },
  { command: 'bulletList', label: 'Lista', keywords: ['lista', 'list', 'bolinha'], icon: <List className="h-4 w-4" /> },
  { command: 'orderedList', label: 'Lista ordenada', keywords: ['lista', 'enumerada', 'ordenada', 'order'], icon: <ListOrdered className="h-4 w-4" /> },
  { command: 'taskList', label: 'Checklist', keywords: ['checklist', 'tarefas', 'check', 'todo'], icon: <ListChecks className="h-4 w-4" /> },
  { command: 'codeInline', label: 'Código', keywords: ['codigo', 'code', 'inline'], icon: <Code className="h-4 w-4" /> },
  { command: 'codeBlock', label: 'Bloco de código', keywords: ['codigo', 'bloco', 'code'], icon: <Code className="h-4 w-4" /> },
  { command: 'blockquote', label: 'Citação', keywords: ['citacao', 'quote', 'comentario'], icon: <Quote className="h-4 w-4" /> },
  { command: 'horizontalRule', label: 'Divisor', keywords: ['divisor', 'linha', 'separador', 'rule'], icon: <Minus className="h-4 w-4" /> },
  { command: 'image', label: 'Imagem', keywords: ['imagem', 'image', 'foto', 'upload'], icon: <ImageIcon className="h-4 w-4" /> },
  { command: 'link', label: 'Link', keywords: ['link', 'url', 'site'], icon: <Link2 className="h-4 w-4" /> },
]

interface SlashState {
  query: string
  from: number
  to: number
  top: number
  left: number
  bottom: number
}

function computeSlashState(ed: Editor): SlashState | null {
  if (!ed.isEditable || !ed.isFocused) return null
  const { selection } = ed.state
  const { $from } = selection
  if ($from.parent.isTextblock !== true) return null
  const textBefore = $from.parent.textBetween(0, $from.parentOffset, '\n')
  const match = textBefore.match(/^\/([\p{L}\p{N}-]*)$/u)
  if (!match) return null
  const from = $from.pos - match[0].length
  const coords = ed.view.coordsAtPos($from.pos)
  return {
    query: match[1],
    from,
    to: $from.pos,
    top: coords.top,
    left: coords.left,
    bottom: coords.bottom,
  }
}

export function RichTextEditor({ content, onChange, placeholder, editable = true }: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [slashState, setSlashState] = useState<SlashState | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const uploadAndInsertRef = useRef<(file: File) => Promise<void>>(async () => {})

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: { languageClassPrefix: 'language-' },
      }),
      Placeholder.configure({
        placeholder: placeholder ?? 'Comece a escrever… (digite "/" para comandos)',
      }),
      Image.configure({
        allowBase64: false,
        HTMLAttributes: {
          class: 'max-w-full rounded-md my-2',
        },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https',
        HTMLAttributes: { rel: 'noopener noreferrer nofollow', target: '_blank' },
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content: content || '',
    editable,
    editorProps: {
      handlePaste: (_view, event) => {
        const items = event.clipboardData?.items
        if (!items) return false
        for (const item of Array.from(items)) {
          if (item.type.startsWith('image/')) {
            const file = item.getAsFile()
            if (file) {
              event.preventDefault()
              uploadAndInsertRef.current(file)
            }
            return true
          }
        }
        return false
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
      setSlashState(computeSlashState(editor))
    },
    onSelectionUpdate: ({ editor }) => {
      setSlashState(computeSlashState(editor))
    },
  })

  useEffect(() => {
    if (!editor || editor.isFocused) return
    if (content !== undefined && content !== editor.getHTML()) {
      editor.commands.setContent(content || '', { emitUpdate: false })
    }
  }, [content, editor])

  useEffect(() => {
    if (!editor) return
    const onBlur = () => setSlashState(null)
    editor.on('blur', onBlur)
    return () => {
      editor.off('blur', onBlur)
    }
  }, [editor])

  useEffect(() => {
    if (!editor) return
    uploadAndInsertRef.current = async (file: File) => {
      if (!file.type.startsWith('image/')) return
      setUploading(true)
      try {
        const url = await uploadImage(file)
        editor.chain().focus().setImage({ src: url }).run()
      } catch (e) {
        console.error('Falha ao enviar imagem', e)
      } finally {
        setUploading(false)
      }
    }
  }, [editor, setUploading])

  useEffect(() => {
    setActiveIndex(0)
  }, [slashState])

  const trimmed = slashState ? slashState.query.trim().toLowerCase() : ''
  const filteredItems = slashState
    ? SLASH_ITEMS.filter((item) =>
        `${item.label} ${item.keywords.join(' ')}`.toLowerCase().includes(trimmed)
      )
    : []

  const applySlashCommand = (item: SlashItem) => {
    if (!editor) return
    const live = computeSlashState(editor)
    if (!live) {
      setSlashState(null)
      return
    }
    const { from, to } = live
    const chain = editor.chain().focus()
    chain.deleteRange({ from, to })

    if (item.command === 'paragraph') {
      chain.setParagraph()
    } else if (item.command === 'h1') {
      chain.toggleHeading({ level: 1 })
    } else if (item.command === 'h2') {
      chain.toggleHeading({ level: 2 })
    } else if (item.command === 'h3') {
      chain.toggleHeading({ level: 3 })
    } else if (item.command === 'bulletList') {
      chain.toggleBulletList()
    } else if (item.command === 'orderedList') {
      chain.toggleOrderedList()
    } else if (item.command === 'taskList') {
      chain.toggleTaskList()
    } else if (item.command === 'codeInline') {
      chain.toggleCode()
    } else if (item.command === 'codeBlock') {
      chain.toggleCodeBlock()
    } else if (item.command === 'blockquote') {
      chain.toggleBlockquote()
    } else if (item.command === 'horizontalRule') {
      chain.setHorizontalRule()
    } else if (item.command === 'link') {
      const url = window.prompt('Informe a URL do link (ex.: https://exemplo.com)')
      if (url && url.trim()) {
        const href = url.trim()
        chain.insertContent({
          type: 'text',
          marks: [{ type: 'link', attrs: { href } }],
          text: href,
        })
      }
    } else if (item.command === 'image') {
      chain.run()
      setSlashState(null)
      fileInputRef.current?.click()
      return
    }

    chain.run()
    setSlashState(null)
  }

  useEffect(() => {
    if (!editor) return
    if (!slashState) return
    const el = editor.view.dom
    const total = filteredItems.length
    if (total === 0) return

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex((i) => (i + 1) % total)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((i) => (i - 1 + total) % total)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const item = filteredItems[activeIndex] ?? filteredItems[0]
        if (item) applySlashCommand(item)
      } else if (e.key === 'Escape') {
        e.preventDefault()
        setSlashState(null)
      } else if (e.key === 'Tab') {
        e.preventDefault()
      }
    }

    el.addEventListener('keydown', handleKeydown)
    return () => el.removeEventListener('keydown', handleKeydown)
  })

  useEffect(() => {
    if (!editor || !slashState) return
    const onScroll = () => setSlashState(computeSlashState(editor))
    window.addEventListener('scroll', onScroll, true)
    return () => window.removeEventListener('scroll', onScroll, true)
  })

  if (!editor) return null

  const handleImageUpload = (file: File) => {
    uploadAndInsertRef.current(file)
  }

  const menuStyle = slashState
    ? {
        top:
          slashState.bottom + 6 + 320 > window.innerHeight
            ? Math.max(8, slashState.top - 320 - 6)
            : slashState.bottom + 6,
        left: Math.max(8, Math.min(slashState.left, window.innerWidth - 296)),
      }
    : undefined

  return (
    <div className="flex flex-col h-full">
      {editable && (
        <div className="flex flex-wrap gap-0.5 items-center border-b border-border pb-2 mb-3 sticky top-0 bg-card z-10">
          <ToolbarButton
            title="Negrito"
            active={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            title="Itálico"
            active={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            title="Riscado"
            active={editor.isActive('strike')}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <Strikethrough className="h-4 w-4" />
          </ToolbarButton>
          <div className="w-px h-5 bg-border mx-1" />
          <ToolbarButton
            title="Título 1"
            active={editor.isActive('heading', { level: 1 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          >
            <Heading1 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            title="Título 2"
            active={editor.isActive('heading', { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>
          <div className="w-px h-5 bg-border mx-1" />
          <ToolbarButton
            title="Lista"
            active={editor.isActive('bulletList')}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            title="Lista ordenada"
            active={editor.isActive('orderedList')}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            title="Checklist"
            active={editor.isActive('taskList')}
            onClick={() => editor.chain().focus().toggleTaskList().run()}
          >
            <ListChecks className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            title="Bloco de código"
            active={editor.isActive('codeBlock')}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          >
            <Code className="h-4 w-4" />
          </ToolbarButton>
          <div className="w-px h-5 bg-border mx-1" />
          <ToolbarButton
            title="Citação"
            active={editor.isActive('blockquote')}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <Quote className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            title="Divisor"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
          >
            <Minus className="h-4 w-4" />
          </ToolbarButton>
          <div className="w-px h-5 bg-border mx-1" />
          <ToolbarButton
            title="Inserir imagem"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImageIcon className="h-4 w-4" />
            )}
          </ToolbarButton>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleImageUpload(file)
              e.target.value = ''
            }}
          />
        </div>
      )}

      <div className="relative flex-1">
        <EditorContent editor={editor} className="flex-1" />

        {slashState && editable && (
          <div
            className="fixed z-40 w-72 max-h-72 overflow-y-auto rounded-lg border border-border bg-card shadow-xl p-1"
            style={menuStyle}
          >
            <div className="px-2 py-1.5 text-[11px] text-muted-foreground uppercase tracking-wide">
              Comandos
            </div>
            {filteredItems.length === 0 ? (
              <div className="px-2 py-3 text-sm text-muted-foreground text-center">
                Nenhum comando encontrado
              </div>
            ) : (
              filteredItems.map((item, i) => (
                <button
                  key={item.command}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    applySlashCommand(item)
                  }}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left text-sm transition-colors',
                    i === activeIndex ? 'bg-accent text-accent-foreground' : 'text-foreground hover:bg-accent/60'
                  )}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground">
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}