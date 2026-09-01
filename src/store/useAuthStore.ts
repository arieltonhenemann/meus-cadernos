import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  loading: boolean
  ready: boolean

  initialize: () => (() => void) | void
  signIn: (email: string, password: string) => Promise<string | null>
  signUp: (email: string, password: string) => Promise<string | null>
  signInWithMagicLink: (email: string) => Promise<string | null>
  signInWithGoogle: () => Promise<string | null>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<string | null>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  ready: false,

  initialize: () => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user ?? null, ready: true })
    })

    supabase.auth.getSession().then(({ data }) => {
      set({ user: data.session?.user ?? null, ready: true })
    })

    return () => subscription.unsubscribe()
  },

  signIn: async (email, password) => {
    set({ loading: true })
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    set({ loading: false })
    return error?.message ?? null
  },

  signUp: async (email, password) => {
    set({ loading: true })
    const { error } = await supabase.auth.signUp({ email, password })
    set({ loading: false })
    return error?.message ?? null
  },

  signInWithMagicLink: async (email) => {
    set({ loading: true })
    const { error } = await supabase.auth.signInWithOtp({ email })
    set({ loading: false })
    return error?.message ?? null
  },

  signInWithGoogle: async () => {
    set({ loading: true })
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`
      }
    })
    set({ loading: false })
    return error?.message ?? null
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null })
  },

  resetPassword: async (email) => {
    set({ loading: true })
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    set({ loading: false })
    return error?.message ?? null
  },
}))
