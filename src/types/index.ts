export interface Page {
  id: string
  title: string
  icon: string
  content: string
  createdAt: number
  updatedAt: number
}

export interface Book {
  id: string
  name: string
  icon: string
  color: string
  pages: Page[]
  createdAt: number
}

export interface Task {
  id: string
  title: string
  done: boolean
  bookId?: string
  pageId?: string
  createdAt: number
}

export type BoardStatus = 'todo' | 'doing' | 'done'

export interface BoardCard {
  id: string
  title: string
  description?: string
  status: BoardStatus
  createdAt: number
}

export interface EventItem {
  id: string
  title: string
  date: string
  time?: string
  color: string
  createdAt: number
}
