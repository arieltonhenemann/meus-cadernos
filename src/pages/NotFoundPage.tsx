import { Link } from 'react-router-dom'
import { FileQuestion } from 'lucide-react'

export function NotFoundPage() {
  return (
    <div className="flex items-center justify-center h-full flex-col gap-4">
      <FileQuestion className="h-16 w-16 text-muted-foreground/30" />
      <h1 className="text-xl font-semibold">Página não encontrada</h1>
      <p className="text-muted-foreground">O conteúdo que você procura não existe ou foi removido.</p>
      <Link to="/" className="text-primary hover:underline">
        Voltar ao início
      </Link>
    </div>
  )
}
