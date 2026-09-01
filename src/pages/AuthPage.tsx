import { useState } from 'react'
import { NotebookPen, Mail, Lock, Loader2, LogIn, UserPlus, Settings2 } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { isSupabaseConfigured } from '../lib/supabase'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'

export function AuthPage() {
  const { signIn, signUp, loading, resetPassword } = useAuthStore()
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (mode === 'login') {
      const err = await signIn(email, password)
      if (err) setError(err)
    } else if (mode === 'signup') {
      if (password.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres.')
        return
      }
      if (password !== confirmPassword) {
        setError('As senhas não coincidem.')
        return
      }
      const err = await signUp(email, password)
      if (err) {
        setError(err)
      } else {
        setMessage('Conta criada! Verifique seu e-mail para confirmar e depois faça login.')
      }
    } else {
      const err = await resetPassword(email)
      if (err) {
        setError(err)
      } else {
        setMessage('Enviamos um link de redefinição de senha para seu e-mail.')
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center mb-3 shadow-lg shadow-primary/25">
            <NotebookPen className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Meus Cadernos</h1>
          <p className="text-muted-foreground text-sm">
            {mode === 'login' && 'Entre para acessar seus cadernos'}
            {mode === 'signup' && 'Crie sua conta para começar'}
            {mode === 'forgot' && 'Recupere o acesso à sua conta'}
          </p>
        </div>

        {!isSupabaseConfigured && (
          <div className="mb-4 text-sm bg-amber-50 border border-amber-200 rounded-md p-4">
            <div className="flex items-center gap-2 font-medium text-amber-800 mb-1">
              <Settings2 className="h-4 w-4" />
              Configuração pendente
            </div>
            <p className="text-amber-700 mb-2">
              Conecte o app ao seu projeto Supabase preenchendo as variáveis{' '}
              <code className="bg-amber-100 px-1 rounded">VITE_SUPABASE_URL</code> e{' '}
              <code className="bg-amber-100 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> no arquivo{' '}
              <code className="bg-amber-100 px-1 rounded">.env</code>.
            </p>
            <p className="text-xs text-amber-700">
              Depois de preencher, reinicie o <code className="bg-amber-100 px-0.5 rounded">npm run dev</code>.
            </p>
          </div>
        )}

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          {error && (
            <div className="mb-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
              {error}
            </div>
          )}
          {message && (
            <div className="mb-4 text-sm text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 rounded-md p-3">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                required
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
              />
            </div>

            {mode !== 'forgot' && (
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  required
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                />
              </div>
            )}

            {mode === 'signup' && (
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  required
                  placeholder="Confirmar senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-9"
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : mode === 'login' ? (
                <>
                  <LogIn className="h-4 w-4" />
                  Entrar
                </>
              ) : mode === 'signup' ? (
                <>
                  <UserPlus className="h-4 w-4" />
                  Criar conta
                </>
              ) : (
                'Enviar link'
              )}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            {mode === 'login' && (
              <>
                <button
                  onClick={() => setMode('forgot')}
                  className="text-primary hover:underline block mx-auto mb-3"
                >
                  Esqueci minha senha
                </button>
                <p className="text-muted-foreground">
                  Não tem conta?{' '}
                  <button onClick={() => { setMode('signup'); setError(null); setMessage(null) }} className="text-primary hover:underline">
                    Cadastrar
                  </button>
                </p>
              </>
            )}
            {mode === 'signup' && (
              <p className="text-muted-foreground">
                Já tem conta?{' '}
                <button onClick={() => { setMode('login'); setError(null); setMessage(null) }} className="text-primary hover:underline">
                  Entrar
                </button>
              </p>
            )}
            {mode === 'forgot' && (
              <button onClick={() => { setMode('login'); setError(null); setMessage(null) }} className="text-primary hover:underline">
                Voltar ao login
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
