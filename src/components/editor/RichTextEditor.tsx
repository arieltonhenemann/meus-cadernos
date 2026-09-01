import { useEffect, useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import { Bold, Italic, Strikethrough, Code, List, ListOrdered, Heading1, Heading2, Quote, Minus, ImageIcon, Loader2 } from 'lucide-react'
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

export function RichTextEditor({ content, onChange, placeholder, editable = true }: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: { languageClassPrefix: 'language-' },
      }),
      Placeholder.configure({
        placeholder: placeholder ?? 'Comece a escrever…',
      }),
      Image.configure({
        allowBase64: false,
        HTMLAttributes: {
          class: 'max-w-full rounded-md my-2',
        },
      }),
    ],
    content: content || '',
    editable,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    },
  })

  useEffect(() => {
    if (editor && content !== undefined && content !== editor.getHTML()) {
      editor.commands.setContent(content || '', { emitUpdate: false })
    }
  }, [content, editor])

  if (!editor) return null

  const handleImageUpload = async (file: File) => {
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
      <EditorContent editor={editor} className="flex-1" />
    </div>
  )
}
