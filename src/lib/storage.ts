import { supabase } from './supabase'
import { useAuthStore } from '../store/useAuthStore'

const BUCKET = 'images'

export async function ensureBucket(): Promise<void> {
  const { data: buckets } = await supabase.storage.listBuckets()
  if (!buckets?.some((b) => b.name === BUCKET)) {
    const { error } = await supabase.storage.createBucket(BUCKET, {
      public: true,
    })
    if (error) throw error
  }
}

export async function uploadImage(file: File): Promise<string> {
  const user = useAuthStore.getState().user
  if (!user) throw new Error('Usuário não autenticado')

  const ext = file.name.split('.').pop()?.toLowerCase() || 'png'
  const filename = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(filename, file)
  if (uploadError) throw uploadError

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename)
  return data.publicUrl
}