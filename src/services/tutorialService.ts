import api from './api'

export interface Tutorial {
  id: number
  title: string
  description: string | null
  video_type: 'file' | 'youtube' | 'gdrive' | 'link'
  video_source: string
  video_url?: string
  created_at: string
  updated_at: string
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

/**
 * Fetch all tutorial videos.
 */
export const getAllTutorials = () =>
  api.get<ApiResponse<Tutorial[]>>('/admin/tutorials')

/**
 * Create a new tutorial video (multipart/form-data for file upload or link).
 */
export const createTutorial = (formData: FormData) =>
  api.post<ApiResponse<Tutorial>>('/admin/tutorials', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

/**
 * Delete a tutorial video by ID.
 */
export const deleteTutorial = (id: number) =>
  api.delete<ApiResponse<null>>(`/admin/tutorials/${id}`)

/**
 * Helper to parse YouTube or Google Drive URL into an embeddable preview URL and detected type.
 */
export function parseEmbedUrl(url: string): { embedUrl: string; type: 'youtube' | 'gdrive' | 'link' } | null {
  if (!url || !url.trim()) return null
  const trimmed = url.trim()

  // YouTube match: watch?v=ID, youtu.be/ID, embed/ID, shorts/ID, live/ID
  const ytMatch = trimmed.match(
    /(?:youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts|live)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i
  )
  if (ytMatch && ytMatch[1]) {
    return {
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}`,
      type: 'youtube',
    }
  }

  // Google Drive match: /file/d/ID/view, open?id=ID, uc?id=ID, /preview
  const gdMatch = trimmed.match(
    /drive\.google\.com\/(?:file\/d\/([a-zA-Z0-9_-]+)|(?:open|uc)\?(?:[\w=&]*[?&])?id=([a-zA-Z0-9_-]+))/i
  )
  if (gdMatch) {
    const fileId = gdMatch[1] || gdMatch[2]
    if (fileId) {
      return {
        embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
        type: 'gdrive',
      }
    }
  }

  // Fallback: direct/other links
  if (/^https?:\/\//i.test(trimmed)) {
    return {
      embedUrl: trimmed,
      type: 'link',
    }
  }

  return null
}
