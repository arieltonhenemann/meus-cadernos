import { supabase } from './supabase'
import { useAppStore } from '../store/useAppStore'

type RealtimeTable = 'books' | 'pages' | 'tasks' | 'board_cards' | 'events'

const TABLES: RealtimeTable[] = ['books', 'pages', 'tasks', 'board_cards', 'events']

let channel: ReturnType<typeof supabase.channel> | null = null
export function setupRealtime(): () => void {
  if (channel) return () => {}

  channel = supabase.channel('realtime-data')

  for (const table of TABLES) {
    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table },
      () => {
        useAppStore.getState().applyRealtimeEvent()
      }
    )
  }

  channel.subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      console.log('[realtime] conectado às tabelas:', TABLES.join(', '))
    }
  })

  return () => {
    supabase.removeChannel(channel!)
    channel = null
  }
}
