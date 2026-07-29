import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { useConfirm } from '../context/ConfirmContext'
import api from '../services/api'
import { publishSubmissionChatSyncEvent } from '../shared/submissionChatSync'
import type { Submission } from '../pages/admin/ListPendaftar'

export function useSubmissionActions(
    patchSubmission: (id: number, patch: Partial<Submission>) => void,
    selectedSubmission: Submission | null,
    setSelectedSubmission: (updater: (prev: Submission | null) => Submission | null) => void,
    submissions: Submission[] = []
) {
    const queryClient = useQueryClient()
    const confirm = useConfirm()

    const [isUpdating, setIsUpdating] = useState(false)
    const [isDownloading, setIsDownloading] = useState(false)
    const [isUploadingPermit, setIsUploadingPermit] = useState(false)
    const [isStartingDiscussion, setIsStartingDiscussion] = useState(false)

    const handleStatusChange = async (id: number, status: 'approved' | 'rejected', rejection_note?: string, skipConfirm = false) => {
        const isApproving = status === 'approved'

        if (!skipConfirm) {
            const ok = await confirm({
                title: isApproving ? 'Terima permohonan ini?' : 'Tolak permohonan ini?',
                message: isApproving
                    ? 'Status pendaftar akan diubah menjadi Diterima. Pastikan data sudah diperiksa sebelum dikonfirmasi.'
                    : 'Status pendaftar akan diubah menjadi Ditolak. Tindakan ini dapat diubah kembali jika diperlukan.',
                variant: isApproving ? 'default' : 'danger',
                confirmText: isApproving ? 'Ya, Terima' : 'Ya, Tolak',
            })
            if (!ok) return
        }

        try {
            setIsUpdating(true)
            await api.patch(`/admin/submissions/${id}/status`, { status, rejection_note })
            patchSubmission(id, { status, rejection_note })

            if (selectedSubmission?.id === id) {
                setSelectedSubmission(prev => prev ? { ...prev, status, rejection_note } : null)
            }

            publishSubmissionChatSyncEvent({
                kind: 'status-updated',
                submissionId: id,
                status: status,
                rejection_note: rejection_note
            })

            toast.success(`Status permohonan berhasil diperbarui`)
            queryClient.invalidateQueries({ queryKey: ['admin-submissions'] })
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Gagal mengubah status permohonan')
        } finally {
            setIsUpdating(false)
        }
    }

    const handleDatesChange = async (id: number, start_date: string, end_date: string) => {
        try {
            setIsUpdating(true)
            await api.patch(`/admin/submissions/${id}/dates`, { start_date, end_date })
            patchSubmission(id, { start_date, end_date })
            if (selectedSubmission?.id === id) {
                setSelectedSubmission(prev => prev ? { ...prev, start_date, end_date } : null)
            }
            toast.success('Tanggal kegiatan berhasil diperbarui')
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Gagal mengubah tanggal kegiatan')
        } finally {
            setIsUpdating(false)
        }
    }

    const handleDownload = async (id: number, e?: React.MouseEvent) => {
        e?.stopPropagation()
        try {
            setIsDownloading(true)
            const response = await api.get(`/admin/submissions/${id}/download`, { responseType: 'blob' })
            const downloadedAt = new Date().toISOString()
            
            patchSubmission(id, { document_downloaded_at: downloadedAt })
            if (selectedSubmission?.id === id) {
                setSelectedSubmission(prev => prev ? { ...prev, document_downloaded_at: downloadedAt } : null)
            }
            
            const submission = submissions.find(s => s.id === id)
            let filename = `permohonan-${id}.zip`

            if (submission) {
                const ketua = submission.member_1.split('|')[0] || 'ketua'
                const kampus = submission.institution || 'kampus'

                const cleanKetua = ketua.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
                const cleanKampus = kampus.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')

                filename = `permohonan_${cleanKetua}_${cleanKampus}.zip`
            }

            const url = URL.createObjectURL(response.data)
            const a = document.createElement('a')
            a.href = url
            a.download = filename
            document.body.appendChild(a)
            a.click()
            URL.revokeObjectURL(url)
            a.remove()
        } catch (error: unknown) {
            let message = 'Gagal mengunduh berkas ZIP. File mungkin tidak ditemukan.'

            const responseData = error && typeof error === 'object' && 'response' in error
                ? (error as { response?: { data?: unknown } }).response?.data
                : undefined
            if (responseData instanceof Blob) {
                try {
                    const errorPayload = JSON.parse(await responseData.text())
                    message = errorPayload?.message ?? message
                } catch {
                    // Keep the default message when the server returns a non-JSON error body.
                }
            } else {
                message = responseData && typeof responseData === 'object' && 'message' in responseData
                    ? String(responseData.message)
                    : message
            }

            toast.error(message)
        } finally {
            setIsDownloading(false)
        }
    }

    const handleUploadPermit = async (id: number, file: File, replace = false): Promise<boolean> => {
        try {
            setIsUploadingPermit(true)
            const formData = new FormData()
            formData.append('permit_file', file)
            if (replace) formData.append('replace', '1')

            const res = await api.post(`/admin/submissions/${id}/permit`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })

            const updated = res.data.data
            patchSubmission(id, { permit_file_path: updated.permit_file_path, permit_file_name: updated.permit_file_name })
            if (selectedSubmission?.id === id) {
                setSelectedSubmission(prev => prev ? { ...prev, permit_file_path: updated.permit_file_path, permit_file_name: updated.permit_file_name } : null)
            }

            toast.success('Surat izin berhasil diunggah')
            queryClient.invalidateQueries({ queryKey: ['admin-submissions'] })
            return true
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Gagal mengunggah surat izin')
            return false
        } finally {
            setIsUploadingPermit(false)
        }
    }

    const handleStartDiscussion = async (id: number): Promise<boolean> => {
        try {
            setIsStartingDiscussion(true)
            const res = await api.post(`/admin/submissions/${id}/discussion/start`)
            const updated = res.data.data

            patchSubmission(id, { discussion_started_at: updated.discussion_started_at })
            if (selectedSubmission?.id === id) {
                setSelectedSubmission(prev => prev ? { ...prev, discussion_started_at: updated.discussion_started_at } : null)
            }

            publishSubmissionChatSyncEvent({
                kind: 'discussion-started',
                submissionId: id,
                discussionStartedAt: updated.discussion_started_at,
            })

            queryClient.invalidateQueries({ queryKey: ['admin-submissions'] })
            return true
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Gagal memulai diskusi')
            return false
        } finally {
            setIsStartingDiscussion(false)
        }
    }

    return {
        isUpdating,
        isDownloading,
        isUploadingPermit,
        isStartingDiscussion,
        handleStatusChange,
        handleDatesChange,
        handleDownload,
        handleUploadPermit,
        handleStartDiscussion,
    }
}
