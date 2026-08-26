'use client'

import { ExternalLink, PlayCircle, X } from 'lucide-react'
import { useEffect, useId, useRef, useState, type SyntheticEvent } from 'react'
import { createPortal } from 'react-dom'

import { type TrainingVideo, youtubeNoCookieEmbedURL } from '@/utilities/trainingVideos'

type TrainingVideoLinksProps = {
  videos: TrainingVideo[]
  tone?: 'light' | 'dark'
}

export function TrainingVideoLinks({ videos, tone = 'light' }: TrainingVideoLinksProps) {
  const [activeURL, setActiveURL] = useState<string | null>(null)
  const playerID = `training-video-${useId().replaceAll(':', '')}`
  const playerTitleID = `${playerID}-title`
  const playerRef = useRef<HTMLElement | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const activeVideo = videos.find((video) => video.url === activeURL) || null
  const activeEmbedURL = youtubeNoCookieEmbedURL(activeVideo?.url)
  const stopPropagation = (event: SyntheticEvent) => event.stopPropagation()

  useEffect(() => {
    if (!activeEmbedURL) return

    const previousOverflow = document.body.style.overflow
    const ownsScrollLock = previousOverflow !== 'hidden'
    if (ownsScrollLock) document.body.style.overflow = 'hidden'
    window.requestAnimationFrame(() => closeButtonRef.current?.focus())

    const handleModalKeyDown = (event: KeyboardEvent) => {
      // This player can open above another dialog. Keep its modal keys from
      // reaching the drill dialog underneath it.
      if (['Escape', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.stopPropagation()
      }

      if (event.key === 'Escape') {
        event.preventDefault()
        setActiveURL(null)
        return
      }

      if (event.key !== 'Tab' || !playerRef.current) return
      const focusable = Array.from(
        playerRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]):not([data-focus-guard]), a[href], iframe, [tabindex]:not([tabindex="-1"]):not([data-focus-guard])',
        ),
      )
      if (!focusable.length) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', handleModalKeyDown, true)
    return () => {
      if (ownsScrollLock) document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleModalKeyDown, true)
      window.requestAnimationFrame(() => {
        if (triggerRef.current?.isConnected) triggerRef.current.focus()
      })
    }
  }, [activeEmbedURL])

  return (
    <div onClick={stopPropagation}>
      <div className="grid gap-3 sm:grid-cols-2">
        {videos.map((video) => {
          const embedURL = youtubeNoCookieEmbedURL(video.url)
          const isActive = activeVideo?.url === video.url && Boolean(activeEmbedURL)
          const cardTone =
            tone === 'dark'
              ? 'border-white/15 bg-white/10 text-white hover:bg-white/15'
              : 'border-[#1677ff]/15 bg-white text-[#092c59] hover:border-[#1677ff]/35 hover:bg-[#eaf3ff]'
          const focusTone =
            tone === 'dark' ? 'focus-visible:outline-[#4cc9ff]' : 'focus-visible:outline-[#1677ff]'

          const content = (
            <>
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                  tone === 'dark' ? 'bg-white/10 text-[#4cc9ff]' : 'bg-[#eaf3ff] text-[#1677ff]'
                }`}
              >
                <PlayCircle className="h-6 w-6" />
              </span>
              <span className="min-w-0 flex-1 text-left">
                <span
                  className={`block text-[10px] font-black uppercase tracking-[.12em] ${
                    tone === 'dark' ? 'text-[#4cc9ff]' : 'text-[#1677ff]'
                  }`}
                >
                  {embedURL ? (isActive ? 'Playing here' : 'Watch here') : 'Open video'}
                </span>
                <strong className="mt-1 block text-sm leading-5">{video.title}</strong>
                <span
                  className={`mt-1 block text-xs ${tone === 'dark' ? 'text-white/55' : 'text-[#718399]'}`}
                >
                  {video.source} · {embedURL ? 'stays on this page' : 'opens in a new tab'}
                </span>
              </span>
            </>
          )

          return embedURL ? (
            <div key={video.url} className={`flex overflow-hidden rounded-2xl border ${cardTone}`}>
              <button
                type="button"
                onClick={(event) => {
                  triggerRef.current = event.currentTarget
                  setActiveURL(video.url)
                }}
                aria-expanded={isActive}
                aria-controls={playerID}
                aria-haspopup="dialog"
                className={`flex min-w-0 flex-1 items-center gap-3 p-4 transition focus-visible:outline-2 focus-visible:outline-offset-[-2px] ${focusTone}`}
              >
                {content}
              </button>
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex w-12 shrink-0 items-center justify-center border-l transition focus-visible:outline-2 focus-visible:outline-offset-[-2px] ${focusTone} ${
                  tone === 'dark'
                    ? 'border-white/15 text-white/45 hover:bg-white/10 hover:text-white'
                    : 'border-[#1677ff]/15 text-[#718399] hover:bg-[#eaf3ff] hover:text-[#1677ff]'
                }`}
                aria-label={`Open the ${video.title} tutorial on YouTube in a new tab`}
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          ) : (
            <a
              key={video.url}
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 rounded-2xl border p-4 transition focus-visible:outline-2 focus-visible:outline-offset-2 ${cardTone} ${focusTone}`}
              aria-label={`Open the ${video.title} technique tutorial in a new tab`}
            >
              {content}
              <ExternalLink
                className={`h-4 w-4 shrink-0 ${tone === 'dark' ? 'text-white/45' : 'text-[#718399]'}`}
              />
            </a>
          )
        })}
      </div>

      {activeVideo && activeEmbedURL && typeof document !== 'undefined'
        ? createPortal(
            <div
              className="fixed inset-0 z-[200] flex items-center justify-center bg-[#06182f]/85 p-3 backdrop-blur-sm sm:p-6"
              role="presentation"
              onClick={(event) => {
                if (event.target === event.currentTarget) setActiveURL(null)
              }}
            >
              <section
                ref={playerRef}
                id={playerID}
                data-training-video-dialog="true"
                role="dialog"
                aria-modal="true"
                aria-labelledby={playerTitleID}
                className="max-h-[calc(100dvh-1.5rem)] w-full max-w-5xl overflow-y-auto overscroll-contain rounded-[1.5rem] bg-[#061d3a] shadow-2xl sm:max-h-[calc(100dvh-3rem)] sm:rounded-[2rem]"
              >
                <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-white/10 bg-[#061d3a] px-4 py-3 text-white sm:px-5 sm:py-4">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#4cc9ff]">
                      Now watching
                    </p>
                    <h2 id={playerTitleID} className="truncate text-sm font-black sm:text-base">
                      <span className="sr-only">Video player: </span>
                      {activeVideo.title}
                    </h2>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <a
                      href={activeVideo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-10 items-center gap-2 rounded-full bg-white/10 px-3 text-xs font-black text-white transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4cc9ff] sm:px-4"
                      aria-label={`Open the ${activeVideo.title} tutorial on YouTube in a new tab`}
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span className="hidden sm:inline">Open on YouTube</span>
                    </a>
                    <button
                      ref={closeButtonRef}
                      type="button"
                      onClick={() => setActiveURL(null)}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4cc9ff]"
                      aria-label="Close video player"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </header>
                <div className="aspect-video bg-black">
                  <iframe
                    key={activeVideo.url}
                    src={activeEmbedURL}
                    title={`${activeVideo.title} technique tutorial`}
                    className="h-full w-full border-0"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                    allowFullScreen
                  />
                </div>
                <button
                  type="button"
                  tabIndex={0}
                  data-focus-guard="true"
                  className="sr-only"
                  aria-label="Return to video controls"
                  onFocus={() => closeButtonRef.current?.focus()}
                />
              </section>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}
