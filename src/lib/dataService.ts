import { supabase } from './supabase'
import { useAuthStore } from '../store/useAuthStore'
import type { Book, BoardCard, EventItem, Page, Task } from '../types'

function currentUserId(): string {
  const user = useAuthStore.getState().user
  if (!user) throw new Error('Usuário não autenticado')
  return user.id
}

interface DbBook {
  id: string
  user_id: string
  name: string
  icon: string
  color: string
  created_at: string
  sort_order: number
}

interface DbPage {
  id: string
  book_id: string
  user_id: string
  title: string
  icon: string
  content: string
  full_width: boolean
  created_at: string
  updated_at: string
  sort_order: number
}

interface DbTask {
  id: string
  user_id: string
  title: string
  done: boolean
  book_id: string | null
  page_id: string | null
  created_at: string
}

interface DbBoardCard {
  id: string
  user_id: string
  title: string
  description: string | null
  status: string
  subtasks: { id: string; title: string; done: boolean }[] | null
  created_at: string
}

interface DbEvent {
  id: string
  user_id: string
  title: string
  date: string
  time: string | null
  color: string
  created_at: string
}

// ---------- Carregar todos os dados do usuário ----------
export interface UserData {
  books: Book[]
  tasks: Task[]
  boardCards: BoardCard[]
  events: EventItem[]
}

export async function fetchUserData(): Promise<UserData> {
  const [booksRes, pagesRes, tasksRes, cardsRes, eventsRes] = await Promise.all([
    supabase.from('books').select('*').order('created_at'),
    supabase.from('pages').select('*').order('created_at'),
    supabase.from('tasks').select('*').order('created_at'),
    supabase.from('board_cards').select('*').order('created_at'),
    supabase.from('events').select('*').order('created_at'),
  ])

  const books = (booksRes.data as DbBook[] | null) ?? []
  const pages = (pagesRes.data as DbPage[] | null) ?? []
  const tasks = (tasksRes.data as DbTask[] | null) ?? []
  const cards = (cardsRes.data as DbBoardCard[] | null) ?? []
  const events = (eventsRes.data as DbEvent[] | null) ?? []

  return {
    books: books.map((b) => ({
      id: b.id,
      name: b.name,
      icon: b.icon,
      color: b.color,
      createdAt: new Date(b.created_at).getTime(),
      pages: pages
        .filter((p) => p.book_id === b.id)
        .map((p) => ({
          id: p.id,
          title: p.title,
          icon: p.icon,
          content: p.content ?? '',
          fullWidth: p.full_width ?? false,
          createdAt: new Date(p.created_at).getTime(),
          updatedAt: new Date(p.updated_at).getTime(),
        })),
    })),
    tasks: tasks.map((t) => ({
      id: t.id,
      title: t.title,
      done: t.done,
      bookId: t.book_id ?? undefined,
      pageId: t.page_id ?? undefined,
      createdAt: new Date(t.created_at).getTime(),
    })),
    boardCards: cards.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description ?? undefined,
      status: c.status as BoardCard['status'],
      subtasks: c.subtasks ?? undefined,
      createdAt: new Date(c.created_at).getTime(),
    })),
    events: events.map((e) => ({
      id: e.id,
      title: e.title,
      date: e.date,
      time: e.time ?? undefined,
      color: e.color,
      createdAt: new Date(e.created_at).getTime(),
    })),
  }
}

// ---------- Books ----------
export async function insertBook(book: Book): Promise<void> {
  await supabase.from('books').insert({
    id: book.id,
    user_id: currentUserId(),
    name: book.name,
    icon: book.icon,
    color: book.color,
  })
}

export async function updateBook(id: string, updates: Partial<Book>): Promise<void> {
  const db: Record<string, unknown> = {}
  if (updates.name !== undefined) db.name = updates.name
  if (updates.icon !== undefined) db.icon = updates.icon
  if (updates.color !== undefined) db.color = updates.color
  if (Object.keys(db).length > 0) {
    await supabase.from('books').update(db).eq('id', id).eq('user_id', currentUserId())
  }
}

export async function deleteBook(id: string): Promise<void> {
  await supabase.from('books').delete().eq('id', id).eq('user_id', currentUserId())
}

// ---------- Pages ----------
export async function insertPage(bookId: string, page: Page): Promise<void> {
  await supabase.from('pages').insert({
    id: page.id,
    book_id: bookId,
    user_id: currentUserId(),
    title: page.title,
    icon: page.icon,
    content: page.content,
    full_width: page.fullWidth ?? false,
  })
}

export async function updatePage(pageId: string, updates: Partial<Page>): Promise<void> {
  const db: Record<string, unknown> = {}
  if (updates.title !== undefined) db.title = updates.title
  if (updates.icon !== undefined) db.icon = updates.icon
  if (updates.content !== undefined) db.content = updates.content
  if (updates.fullWidth !== undefined) db.full_width = updates.fullWidth
  if (Object.keys(db).length > 0) {
    await supabase.from('pages').update(db).eq('id', pageId)
  }
}

export async function deletePage(id: string): Promise<void> {
  await supabase.from('pages').delete().eq('id', id)
}

// ---------- Tasks ----------
export async function insertTask(task: Task): Promise<void> {
  await supabase.from('tasks').insert({
    id: task.id,
    user_id: currentUserId(),
    title: task.title,
    done: task.done,
    book_id: task.bookId ?? null,
    page_id: task.pageId ?? null,
  })
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<void> {
  const db: Record<string, unknown> = {}
  if (updates.title !== undefined) db.title = updates.title
  if (updates.done !== undefined) db.done = updates.done
  if (updates.bookId !== undefined) db.book_id = updates.bookId
  if (updates.pageId !== undefined) db.page_id = updates.pageId
  if (Object.keys(db).length > 0) {
    await supabase.from('tasks').update(db).eq('id', id)
  }
}

export async function deleteTask(id: string): Promise<void> {
  await supabase.from('tasks').delete().eq('id', id)
}

// ---------- Board cards ----------
export async function insertBoardCard(card: BoardCard): Promise<void> {
  await supabase.from('board_cards').insert({
    id: card.id,
    user_id: currentUserId(),
    title: card.title,
    description: card.description ?? null,
    status: card.status,
    subtasks: card.subtasks ?? [],
  })
}

export async function updateBoardCard(id: string, updates: Partial<BoardCard>): Promise<void> {
  const db: Record<string, unknown> = {}
  if (updates.title !== undefined) db.title = updates.title
  if (updates.description !== undefined) db.description = updates.description
  if (updates.status !== undefined) db.status = updates.status
  if (updates.subtasks !== undefined) db.subtasks = updates.subtasks
  if (Object.keys(db).length > 0) {
    await supabase.from('board_cards').update(db).eq('id', id)
  }
}

export async function deleteBoardCard(id: string): Promise<void> {
  await supabase.from('board_cards').delete().eq('id', id)
}

// ---------- Events ----------
export async function insertEvent(event: EventItem): Promise<void> {
  await supabase.from('events').insert({
    id: event.id,
    user_id: currentUserId(),
    title: event.title,
    date: event.date,
    time: event.time ?? null,
    color: event.color,
  })
}

export async function updateEvent(id: string, updates: Partial<EventItem>): Promise<void> {
  const db: Record<string, unknown> = {}
  if (updates.title !== undefined) db.title = updates.title
  if (updates.date !== undefined) db.date = updates.date
  if (updates.time !== undefined) db.time = updates.time
  if (updates.color !== undefined) db.color = updates.color
  if (Object.keys(db).length > 0) {
    await supabase.from('events').update(db).eq('id', id)
  }
}

export async function deleteEvent(id: string): Promise<void> {
  await supabase.from('events').delete().eq('id', id)
}
