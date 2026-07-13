export type SubmissionChatMessage = {
    id: number
    sender_type: 'admin' | 'applicant'
    sender_name: string
    message: string
    created_at: string
}

export type SubmissionChatSyncEvent =
    | {
        kind: 'message-sent'
        submissionId: number
        message: SubmissionChatMessage
    }
    | {
        kind: 'discussion-started'
        submissionId: number
        discussionStartedAt: string
    }
    | {
        kind: 'status-updated'
        submissionId: number
        status: 'pending' | 'approved' | 'rejected'
    }

const CHANNEL_NAME = 'ruang-magang-submission-chat-sync'
const STORAGE_KEY = 'ruang-magang-submission-chat-sync-event'

let broadcastChannel: BroadcastChannel | null = null

const getBroadcastChannel = () => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) {
        return null
    }

    if (!broadcastChannel) {
        broadcastChannel = new BroadcastChannel(CHANNEL_NAME)
    }

    return broadcastChannel
}

const isSubmissionChatSyncEvent = (value: unknown): value is SubmissionChatSyncEvent => {
    if (!value || typeof value !== 'object') return false

    const event = value as Partial<SubmissionChatSyncEvent> & { kind?: unknown }
    if (event.kind === 'message-sent') {
        return typeof event.submissionId === 'number'
            && typeof event.message === 'object'
            && event.message !== null
    }

    if (event.kind === 'discussion-started') {
        return typeof event.submissionId === 'number' && typeof event.discussionStartedAt === 'string'
    }

    if (event.kind === 'status-updated') {
        return typeof event.submissionId === 'number' && typeof event.status === 'string'
    }

    return false
}

export const publishSubmissionChatSyncEvent = (event: SubmissionChatSyncEvent) => {
    if (typeof window === 'undefined') return

    const channel = getBroadcastChannel()
    if (channel) {
        channel.postMessage(event)
        return
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...event, nonce: Date.now() }))
}

export const subscribeSubmissionChatSyncEvents = (
    listener: (event: SubmissionChatSyncEvent) => void,
) => {
    if (typeof window === 'undefined') {
        return () => { }
    }

    const channel = getBroadcastChannel()

    const handleMessage = (event: MessageEvent) => {
        if (isSubmissionChatSyncEvent(event.data)) {
            listener(event.data)
        }
    }

    const handleStorage = (event: StorageEvent) => {
        if (event.key !== STORAGE_KEY || !event.newValue) return

        try {
            const parsed = JSON.parse(event.newValue) as unknown
            if (isSubmissionChatSyncEvent(parsed)) {
                listener(parsed)
            }
        } catch {
            // Ignore malformed sync payloads.
        }
    }

    channel?.addEventListener('message', handleMessage)
    window.addEventListener('storage', handleStorage)

    return () => {
        channel?.removeEventListener('message', handleMessage)
        window.removeEventListener('storage', handleStorage)
    }
}