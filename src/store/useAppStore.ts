import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Book, BoardCard, EventItem, Page, Task } from '../types'
import {
  fetchUserData,
  insertBook,
  updateBook as dbUpdateBook,
  deleteBook as dbDeleteBook,
  insertPage,
  updatePage as dbUpdatePage,
  deletePage as dbDeletePage,
  insertTask,
  updateTask as dbUpdateTask,
  deleteTask as dbDeleteTask,
  insertBoardCard,
  updateBoardCard as dbUpdateBoardCard,
  deleteBoardCard as dbDeleteBoardCard,
  insertEvent,
  updateEvent as dbUpdateEvent,
  deleteEvent as dbDeleteEvent,
} from '../lib/dataService'
import { ensureBucket } from '../lib/storage'

interface AppState {
  books: Book[]
  tasks: Task[]
  boardCards: BoardCard[]
  events: EventItem[]
  sidebarCollapsed: boolean
  mobileSidebarOpen: boolean
  loaded: boolean

  loadData: () => Promise<void>
  clearData: () => void

  addBook: (book: Book) => void
  updateBook: (id: string, updates: Partial<Book>) => void
  deleteBook: (id: string) => void

  addPage: (bookId: string, page: Page) => void
  updatePage: (bookId: string, pageId: string, updates: Partial<Page>) => void
  deletePage: (bookId: string, pageId: string) => void

  addTask: (task: Task) => void
  toggleTask: (id: string) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void

  addBoardCard: (card: BoardCard) => void
  updateBoardCard: (id: string, updates: Partial<BoardCard>) => void
  deleteBoardCard: (id: string) => void

  addEvent: (event: EventItem) => void
  updateEvent: (id: string, updates: Partial<EventItem>) => void
  deleteEvent: (id: string) => void

  applyRealtimeEvent: () => void

  toggleSidebar: () => void
  setMobileSidebarOpen: (open: boolean) => void
}

export const generateId = (): string =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2, 10) + Date.now().toString(36)

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      books: [],
      tasks: [],
      boardCards: [],
      events: [],
      sidebarCollapsed: false,
      mobileSidebarOpen: false,
      loaded: false,

      loadData: async () => {
        try {
          ensureBucket().catch((e) => console.error('Falha ao garantir bucket de imagens', e))
          const data = await fetchUserData()
          set({
            books: data.books,
            tasks: data.tasks,
            boardCards: data.boardCards,
            events: data.events,
            loaded: true,
          })
        } catch (e) {
          console.error('Falha ao carregar dados do Supabase', e)
          set({ loaded: true })
        }
      },

      clearData: () =>
        set({ books: [], tasks: [], boardCards: [], events: [], loaded: false }),

      addBook: (book) => {
        set((s) => ({ books: [...s.books, book] }))
        insertBook(book).catch(console.error)
      },
      updateBook: (id, updates) => {
        set((s) => ({
          books: s.books.map((b) => (b.id === id ? { ...b, ...updates } : b)),
        }))
        dbUpdateBook(id, updates).catch(console.error)
      },
      deleteBook: (id) => {
        set((s) => ({ books: s.books.filter((b) => b.id !== id) }))
        dbDeleteBook(id).catch(console.error)
      },

      addPage: (bookId, page) => {
        set((s) => ({
          books: s.books.map((b) =>
            b.id === bookId ? { ...b, pages: [...b.pages, page] } : b
          ),
        }))
        insertPage(bookId, page).catch(console.error)
      },
      updatePage: (bookId, pageId, updates) => {
        set((s) => ({
          books: s.books.map((b) =>
            b.id === bookId
              ? {
                  ...b,
                  pages: b.pages.map((p) =>
                    p.id === pageId
                      ? { ...p, ...updates, updatedAt: Date.now() }
                      : p
                  ),
                }
              : b
          ),
        }))
        dbUpdatePage(pageId, updates).catch(console.error)
      },
      deletePage: (bookId, pageId) => {
        set((s) => ({
          books: s.books.map((b) =>
            b.id === bookId
              ? { ...b, pages: b.pages.filter((p) => p.id !== pageId) }
              : b
          ),
        }))
        dbDeletePage(pageId).catch(console.error)
      },

      addTask: (task) => {
        set((s) => ({ tasks: [...s.tasks, task] }))
        insertTask(task).catch(console.error)
      },
      toggleTask: (id) => {
        const task = get().tasks.find((t) => t.id === id)
        if (!task) return
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
        }))
        dbUpdateTask(id, { done: !task.done }).catch(console.error)
      },
      updateTask: (id, updates) => {
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }))
        dbUpdateTask(id, updates).catch(console.error)
      },
      deleteTask: (id) => {
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }))
        dbDeleteTask(id).catch(console.error)
      },

      addBoardCard: (card) => {
        set((s) => ({ boardCards: [...s.boardCards, card] }))
        insertBoardCard(card).catch(console.error)
      },
      updateBoardCard: (id, updates) => {
        set((s) => ({
          boardCards: s.boardCards.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        }))
        dbUpdateBoardCard(id, updates).catch(console.error)
      },
      deleteBoardCard: (id) => {
        set((s) => ({ boardCards: s.boardCards.filter((c) => c.id !== id) }))
        dbDeleteBoardCard(id).catch(console.error)
      },

      addEvent: (event) => {
        set((s) => ({ events: [...s.events, event] }))
        insertEvent(event).catch(console.error)
      },
      updateEvent: (id, updates) => {
        set((s) => ({
          events: s.events.map((e) => (e.id === id ? { ...e, ...updates } : e)),
        }))
        dbUpdateEvent(id, updates).catch(console.error)
      },
      deleteEvent: (id) => {
        set((s) => ({ events: s.events.filter((e) => e.id !== id) }))
        dbDeleteEvent(id).catch(console.error)
      },

      applyRealtimeEvent: async () => {
        try {
          const data = await fetchUserData()
          set({
            books: data.books,
            tasks: data.tasks,
            boardCards: data.boardCards,
            events: data.events,
            loaded: true,
          })
        } catch (e) {
          console.error('Falha ao sincronizar dados em tempo real', e)
        }
      },

      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
    }),
    {
      name: 'notebook-app',
      partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed }),
      // Mantém sidebarCollapsed persistido localmente, mas não os dados (que vêm do banco)
    }
  )
)
