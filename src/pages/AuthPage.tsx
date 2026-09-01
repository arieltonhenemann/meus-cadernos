import { useState } from 'react'
import { NotebookPen, Mail, Lock, Loader2, LogIn, UserPlus, Settings2 } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { isSupabaseConfigured } from '../lib/supabase'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

export function AuthPage() {
  const { signIn, signUp, loading, resetPassword, signInWithGoogle } = useAuthStore()
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

  const handleGoogleSignIn = async () => {
    setError(null)
    setMessage(null)
    const err = await signInWithGoogle()
    if (err) setError(err)
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

          <Button
            type="button"
            variant="outline"
            className="w-full mb-4"
            disabled={loading}
            onClick={handleGoogleSignIn}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <GoogleIcon className="h-4 w-4" />
            )}
            Entrar com Google
          </Button>

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">ou continuar com e-mail</span>
            </div>
          </div>

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
