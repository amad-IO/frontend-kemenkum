import { useState, useId, useEffect } from 'react'
import {
  Video,
  Plus,
  Trash2,
  RefreshCw,
  Upload,
  Link2,
  FileVideo,
  ExternalLink,
  AlertCircle,
  X,
  Loader2,
  Calendar,
  Play,
  Film,
} from 'lucide-react'
import { toast } from 'react-toastify'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getAllTutorials,
  createTutorial,
  deleteTutorial,
  parseEmbedUrl,
  type Tutorial,
} from '../../services/tutorialService'
import { useConfirm } from '../../context/ConfirmContext'
import { Skeleton } from '../../components/ui/Skeleton'

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024 // 50 MB

const TutorialPage = () => {
  const queryClient = useQueryClient()
  const confirm = useConfirm()
  const fileInputId = useId()

  // ── 1. Data Fetching (TanStack Query) ──────────────────────────────────────
  const {
    data: tutorials = [],
    isLoading,
    isFetching: refreshing,
    refetch,
  } = useQuery({
    queryKey: ['admin-tutorials'],
    queryFn: async () => {
      const res = await getAllTutorials()
      return (res.data?.data || []) as Tutorial[]
    },
    staleTime: 30_000,
    throwOnError: false,
  })

  // ── 2. Modal & Form State ──────────────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'upload' | 'link'>('upload')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [linkUrl, setLinkUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Delete state
  const [deletingId, setDeletingId] = useState<number | null>(null)

  // Lightbox state — menyimpan tutorial yang sedang ditonton
  const [playingTutorial, setPlayingTutorial] = useState<Tutorial | null>(null)

  // Clean up blob preview URL on unmount or file change
  useEffect(() => {
    return () => {
      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl)
      }
    }
  }, [filePreviewUrl])

  const handleOpenAdd = () => {
    setTitle('')
    setDescription('')
    setActiveTab('upload')
    setVideoFile(null)
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl)
      setFilePreviewUrl(null)
    }
    setFileError(null)
    setLinkUrl('')
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    if (isSubmitting) return
    setModalOpen(false)
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl)
      setFilePreviewUrl(null)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null)
    const file = e.target.files?.[0]
    if (!file) return

    // Validate mime type / extension
    const validExtensions = ['video/mp4', 'video/webm', 'video/quicktime']
    const hasValidExt = /\.(mp4|webm)$/i.test(file.name)
    if (!validExtensions.includes(file.type) && !hasValidExt) {
      setFileError('Format file tidak didukung. Harap pilih file .mp4 atau .webm.')
      return
    }

    // Validate size (max 50MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1)
      setFileError(`Ukuran file (${sizeMb} MB) melebihi batas maksimal 50 MB.`)
      return
    }

    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl)
    }

    setVideoFile(file)
    setFilePreviewUrl(URL.createObjectURL(file))
  }

  const handleRemoveFile = () => {
    setVideoFile(null)
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl)
      setFilePreviewUrl(null)
    }
    setFileError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.warn('Judul tutorial wajib diisi.')
      return
    }

    if (activeTab === 'upload') {
      if (!videoFile) {
        toast.warn('Silakan pilih file video yang ingin diunggah.')
        return
      }
    } else {
      if (!linkUrl.trim()) {
        toast.warn('Silakan masukkan tautan link video.')
        return
      }
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('title', title.trim())
      if (description.trim()) {
        formData.append('description', description.trim())
      }

      if (activeTab === 'upload' && videoFile) {
        formData.append('video_file', videoFile)
      } else if (activeTab === 'link' && linkUrl.trim()) {
        formData.append('video_link', linkUrl.trim())
      }

      const res = await createTutorial(formData)
      toast.success(res.data?.message || 'Tutorial berhasil ditambahkan.')
      handleCloseModal()
      queryClient.invalidateQueries({ queryKey: ['admin-tutorials'] })
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }
      const backendMessage = errorObj.response?.data?.message
      const firstValidationError = errorObj.response?.data?.errors
        ? Object.values(errorObj.response.data.errors)[0]?.[0]
        : null

      toast.error(firstValidationError || backendMessage || 'Gagal menambahkan tutorial.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (tutorial: Tutorial) => {
    const ok = await confirm({
      title: 'Hapus Video Tutorial?',
      message: `Apakah Anda yakin ingin menghapus tutorial "${tutorial.title}"? Tindakan ini permanen dan file video terkait akan dihapus dari server.`,
      variant: 'danger',
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
    })
    if (!ok) return

    setDeletingId(tutorial.id)
    try {
      const res = await deleteTutorial(tutorial.id)
      toast.success(res.data?.message || 'Tutorial berhasil dihapus.')
      queryClient.invalidateQueries({ queryKey: ['admin-tutorials'] })
    } catch {
      toast.error('Gagal menghapus tutorial.')
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
  }

  // Real-time parsed link preview
  const parsedLink = activeTab === 'link' ? parseEmbedUrl(linkUrl) : null

  return (
    <div className="flex flex-col gap-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-neutral-text">
            <Video size={22} className="text-primary" />
            Kelola Video Tutorial
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-neutral-muted">
            Unggah video MP4 atau tautkan link YouTube &amp; Google Drive sebagai panduan peserta magang
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-full border border-neutral-border bg-white px-4 py-2 text-sm font-bold text-primary shadow-sm transition hover:bg-neutral-bg disabled:opacity-60"
            title="Muat ulang data tutorial"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <Plus size={16} />
            Tambah Tutorial
          </button>
        </div>
      </div>

      {/* ── Content Area ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex flex-col overflow-hidden rounded-2xl border border-neutral-border bg-white shadow-card"
            >
              <Skeleton className="aspect-video w-full rounded-none" />
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-3 flex items-center justify-between">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="mb-2 h-5 w-3/4" />
                <Skeleton className="mb-4 h-4 w-full" />
                <div className="mt-auto flex items-center justify-between border-t border-neutral-border/60 pt-4">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : tutorials.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-primary/20 bg-primary/5 px-6 py-20 text-center">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-xl shadow-primary/10">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Film size={28} />
            </div>
          </div>
          <h3 className="mb-2 text-xl font-extrabold text-neutral-text">Belum Ada Video Tutorial</h3>
          <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-neutral-muted">
            Anda belum menambahkan video panduan tutorial. Tambahkan video tutorial pertama dengan mengunggah file MP4 atau menautkan link YouTube / Google Drive.
          </p>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/30 transition hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-xl hover:shadow-primary/40 active:translate-y-0"
          >
            <Plus size={18} />
            Tambah Tutorial Sekarang
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {tutorials.map((tutorial) => {
            const isFile = tutorial.video_type === 'file'
            const isYouTube = tutorial.video_type === 'youtube'
            const isGDrive = tutorial.video_type === 'gdrive'

            return (
              <div
                key={tutorial.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-border bg-white shadow-card transition-all duration-200 hover:shadow-lg"
              >
                {/* Thumbnail — klik untuk buka lightbox */}
                <div
                  className="relative aspect-video w-full overflow-hidden bg-neutral-900 cursor-pointer"
                  onClick={() => setPlayingTutorial(tutorial)}
                >
                  {/* Overlay play button */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition group-hover:bg-black/50 z-10">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-lg transition group-hover:scale-110">
                      <Play size={24} className="ml-1 text-primary fill-primary" />
                    </div>
                  </div>

                  {/* Thumbnail background — iframe/video tidak auto-play */}
                  {tutorial.video_type === 'youtube' ? (
                    (() => {
                      const ytMatch = tutorial.video_source.match(/embed\/([^?]+)/)
                      const ytId = ytMatch ? ytMatch[1] : null
                      return ytId ? (
                        <img
                          src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
                          alt={tutorial.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-red-900 to-red-700" />
                      )
                    })()
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-700">
                      <Film size={40} className="text-white/30" />
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="flex flex-1 flex-col p-5">
                  {/* Top Meta: Badge & Date */}
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                        isYouTube
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : isGDrive
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : isFile
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-teal-50 text-teal-700 border border-teal-200'
                      }`}
                    >
                      {isYouTube ? (
                        <>
                          <Play size={10} className="fill-red-600 text-red-600" />
                          YouTube
                        </>
                      ) : isGDrive ? (
                        <>
                          <ExternalLink size={10} />
                          Google Drive
                        </>
                      ) : isFile ? (
                        <>
                          <FileVideo size={10} />
                          File MP4
                        </>
                      ) : (
                        <>
                          <Link2 size={10} />
                          Link
                        </>
                      )}
                    </span>

                    <div className="flex items-center gap-1 text-[11px] text-neutral-muted">
                      <Calendar size={12} />
                      <span>{formatDate(tutorial.created_at)}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3
                    className="mb-1 text-base font-bold text-neutral-text line-clamp-2"
                    title={tutorial.title}
                  >
                    {tutorial.title}
                  </h3>

                  {/* Description */}
                  {tutorial.description ? (
                    <p className="mb-4 text-xs leading-relaxed text-neutral-muted line-clamp-3">
                      {tutorial.description}
                    </p>
                  ) : (
                    <p className="mb-4 text-xs italic text-neutral-muted/60">
                      Tidak ada deskripsi tambahan.
                    </p>
                  )}

                  {/* Card Action Footer */}
                  <div className="mt-auto flex items-center justify-between border-t border-neutral-border/60 pt-4">
                    <span
                      className="max-w-[200px] truncate text-[11px] font-mono text-neutral-muted"
                      title={tutorial.video_source}
                    >
                      {tutorial.video_source}
                    </span>

                    <button
                      onClick={() => handleDelete(tutorial)}
                      disabled={deletingId === tutorial.id}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-border bg-white text-neutral-muted transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      title="Hapus video tutorial"
                      aria-label={`Hapus tutorial ${tutorial.title}`}
                    >
                      {deletingId === tutorial.id ? (
                        <RefreshCw size={14} className="animate-spin text-red-600" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Add Tutorial Modal ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-text/40 p-4 backdrop-blur-sm">
          <div className="relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl border border-neutral-border animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-border px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Video size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-text">Tambah Video Tutorial</h3>
                  <p className="text-xs text-neutral-muted">
                    Unggah file MP4/WebM atau sematkan link YouTube &amp; Google Drive
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={isSubmitting}
                className="rounded-lg p-1.5 text-neutral-muted hover:bg-neutral-bg hover:text-neutral-text disabled:opacity-50"
                aria-label="Tutup modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body with Form */}
            <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-y-auto p-6">
              <div className="flex flex-col gap-4">
                {/* Field: Judul */}
                <div>
                  <label htmlFor="tutorial-title" className="mb-1.5 block text-xs font-bold text-neutral-text">
                    Judul Tutorial <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="tutorial-title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: Panduan Mengunggah Laporan Akhir"
                    disabled={isSubmitting}
                    className="w-full rounded-xl border border-neutral-border bg-white px-3.5 py-2.5 text-sm text-neutral-text placeholder:text-neutral-muted/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-neutral-bg"
                  />
                </div>

                {/* Field: Deskripsi */}
                <div>
                  <label htmlFor="tutorial-description" className="mb-1.5 block text-xs font-bold text-neutral-text">
                    Deskripsi <span className="font-normal text-neutral-muted">(Opsional)</span>
                  </label>
                  <textarea
                    id="tutorial-description"
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Deskripsi singkat mengenai isi video tutorial..."
                    disabled={isSubmitting}
                    className="w-full resize-none rounded-xl border border-neutral-border bg-white px-3.5 py-2.5 text-sm text-neutral-text placeholder:text-neutral-muted/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-neutral-bg"
                  />
                </div>

                {/* Tab Switcher: Upload File vs Link */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-neutral-text">
                    Sumber Video <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2 rounded-xl bg-neutral-bg p-1 border border-neutral-border">
                    <button
                      type="button"
                      onClick={() => setActiveTab('upload')}
                      disabled={isSubmitting}
                      className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all ${
                        activeTab === 'upload'
                          ? 'bg-white text-primary shadow-sm border border-neutral-border/60'
                          : 'text-neutral-muted hover:text-neutral-text'
                      }`}
                    >
                      <Upload size={14} />
                      Unggah File Video
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('link')}
                      disabled={isSubmitting}
                      className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all ${
                        activeTab === 'link'
                          ? 'bg-white text-primary shadow-sm border border-neutral-border/60'
                          : 'text-neutral-muted hover:text-neutral-text'
                      }`}
                    >
                      <Link2 size={14} />
                      Tautan Link Video
                    </button>
                  </div>
                </div>

                {/* Tab 1: Upload File Video */}
                {activeTab === 'upload' && (
                  <div className="flex flex-col gap-3">
                    {!videoFile ? (
                      <label
                        htmlFor={fileInputId}
                        className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-border bg-neutral-bg/50 p-6 text-center transition hover:border-primary/50 hover:bg-neutral-bg cursor-pointer"
                      >
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Upload size={22} />
                        </div>
                        <p className="text-sm font-bold text-neutral-text">
                          Klik untuk memilih file video
                        </p>
                        <p className="mt-1 text-xs text-neutral-muted">
                          Format didukung: <strong>MP4, WebM</strong> (Maksimal <strong>50 MB</strong>)
                        </p>
                        <input
                          id={fileInputId}
                          type="file"
                          accept="video/mp4,video/webm"
                          onChange={handleFileChange}
                          disabled={isSubmitting}
                          className="hidden"
                        />
                      </label>
                    ) : (
                      <div className="flex flex-col gap-2 rounded-xl border border-neutral-border bg-neutral-bg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                              <FileVideo size={16} />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-xs font-bold text-neutral-text">
                                {videoFile.name}
                              </p>
                              <p className="text-[11px] text-neutral-muted">
                                {formatFileSize(videoFile.size)}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveFile}
                            disabled={isSubmitting}
                            className="rounded-lg p-1.5 text-neutral-muted hover:bg-white hover:text-red-600 transition disabled:opacity-50"
                            title="Hapus file terpilih"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>

                        {filePreviewUrl && (
                          <div className="mt-2 aspect-video w-full overflow-hidden rounded-lg bg-black">
                            <video
                              controls
                              src={filePreviewUrl}
                              className="h-full w-full object-contain"
                            >
                              Browser Anda tidak mendukung preview video.
                            </video>
                          </div>
                        )}
                      </div>
                    )}

                    {fileError && (
                      <div className="flex items-center gap-2 rounded-lg bg-red-50 p-2.5 text-xs text-red-700 border border-red-200">
                        <AlertCircle size={14} className="shrink-0" />
                        <span>{fileError}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 2: Paste Link URL */}
                {activeTab === 'link' && (
                  <div className="flex flex-col gap-3">
                    <div>
                      <div className="relative">
                        <input
                          type="url"
                          value={linkUrl}
                          onChange={(e) => setLinkUrl(e.target.value)}
                          placeholder="https://www.youtube.com/watch?v=... atau https://drive.google.com/file/d/..."
                          disabled={isSubmitting}
                          className="w-full rounded-xl border border-neutral-border bg-white pl-9 pr-3.5 py-2.5 text-sm text-neutral-text placeholder:text-neutral-muted/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-neutral-bg"
                        />
                        <Link2
                          size={16}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-muted"
                        />
                      </div>
                      <p className="mt-1.5 text-[11px] text-neutral-muted">
                        Mendukung tautan standar <strong>YouTube</strong> (watch, share, shorts) dan <strong>Google Drive</strong> (mode view/preview).
                      </p>
                    </div>

                    {/* Live Preview If Parsed */}
                    {linkUrl.trim() && parsedLink && (
                      <div className="flex flex-col gap-2 rounded-xl border border-neutral-border bg-neutral-bg p-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-neutral-text">Live Embed Preview:</span>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              parsedLink.type === 'youtube'
                                ? 'bg-red-100 text-red-800'
                                : parsedLink.type === 'gdrive'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-neutral-200 text-neutral-700'
                            }`}
                          >
                            {parsedLink.type === 'youtube'
                              ? 'Terdeteksi: YouTube'
                              : parsedLink.type === 'gdrive'
                              ? 'Terdeteksi: Google Drive'
                              : 'Terdeteksi: Link Eksternal'}
                          </span>
                        </div>
                        <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
                          <iframe
                            src={parsedLink.embedUrl}
                            title="Live Preview"
                            className="h-full w-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer Buttons */}
              <div className="mt-6 flex items-center justify-end gap-3 border-t border-neutral-border pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="rounded-xl border border-neutral-border bg-white px-4 py-2.5 text-sm font-semibold text-neutral-text transition hover:bg-neutral-bg disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !title.trim() ||
                    (activeTab === 'upload' && !videoFile) ||
                    (activeTab === 'link' && !linkUrl.trim())
                  }
                  className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      <span>Simpan Tutorial</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ── Video Lightbox Modal ── */}
      {playingTutorial && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setPlayingTutorial(null)}
        >
          <div
            className="relative w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-neutral-900 px-5 py-3">
              <p className="text-sm font-bold text-white truncate pr-4">{playingTutorial.title}</p>
              <button
                onClick={() => setPlayingTutorial(null)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
                aria-label="Tutup video"
              >
                <X size={16} />
              </button>
            </div>

            {/* Video Player */}
            <div className="aspect-video w-full bg-black">
              {playingTutorial.video_type === 'file' ? (
                <video
                  controls
                  autoPlay
                  className="h-full w-full"
                  src={playingTutorial.video_url || playingTutorial.video_source}
                >
                  Browser Anda tidak mendukung pemutaran video.
                </video>
              ) : (
                <iframe
                  src={`${playingTutorial.video_source}${playingTutorial.video_type === 'youtube' ? '?autoplay=1' : ''}`}
                  title={playingTutorial.title}
                  className="h-full w-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              )}
            </div>

            {/* Description */}
            {playingTutorial.description && (
              <div className="bg-neutral-900 px-5 py-3">
                <p className="text-xs text-white/70 leading-relaxed">{playingTutorial.description}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default TutorialPage
