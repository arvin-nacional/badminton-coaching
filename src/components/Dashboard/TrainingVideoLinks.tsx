'use client'

import { ExternalLink, PlayCircle, X } from 'lucide-react'
import { useId, useState, type SyntheticEvent } from 'react'

import { type TrainingVideo, youtubeNoCookieEmbedURL } from '@/utilities/trainingVideos'

type TrainingVideoLinksProps = {
  videos: TrainingVideo[]
  tone?: 'light' | 'dark'
}

export function TrainingVideoLinks({ videos, tone = 'light' }: TrainingVideoLinksProps) {
  const [activeURL, setActiveURL] = useState<string | null>(null)
  const playerID = `training-video-${useId().replaceAll(':', '')}`
  const activeVideo = videos.find((video) => video.url === activeURL) || null
  const activeEmbedURL = youtubeNoCookieEmbedURL(activeVideo?.url)
  const stopPropagation = (event: SyntheticEvent) => event.stopPropagation()

  return (
    <div onClick={stopPropagation} onKeyDown={stopPropagation}>
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
                onClick={() => setActiveURL(isActive ? null : video.url)}
                aria-expanded={isActive}
                aria-controls={playerID}
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

      {activeVideo && activeEmbedURL ? (
        <section
          id={playerID}
          aria-label={`Now watching ${activeVideo.title}`}
          className={`mt-4 overflow-hidden rounded-2xl border ${
            tone === 'dark'
              ? 'border-white/15 bg-[#061d3a]'
              : 'border-[#092c59]/10 bg-white shadow-[0_18px_45px_-34px_rgba(9,44,89,.7)]'
          }`}
        >
          <div
            className={`flex items-center justify-between gap-4 px-4 py-3 ${
              tone === 'dark' ? 'text-white' : 'text-[#092c59]'
            }`}
          >
            <div className="min-w-0">
              <p
                className={`text-[10px] font-black uppercase tracking-[.12em] ${
                  tone === 'dark' ? 'text-[#4cc9ff]' : 'text-[#1677ff]'
                }`}
              >
                Now watching
              </p>
              <h4 className="truncate text-sm font-black">{activeVideo.title}</h4>
            </div>
            <button
              type="button"
              onClick={() => setActiveURL(null)}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition focus-visible:outline-2 focus-visible:outline-offset-2 ${
                tone === 'dark'
                  ? 'bg-white/10 text-white hover:bg-white/20 focus-visible:outline-[#4cc9ff]'
                  : 'bg-[#f3f7fc] text-[#607286] hover:bg-[#eaf3ff] hover:text-[#1677ff] focus-visible:outline-[#1677ff]'
              }`}
              aria-label="Close video player"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="aspect-video bg-black">
            <iframe
              key={activeVideo.url}
              src={activeEmbedURL}
              title={`${activeVideo.title} technique tutorial`}
              className="h-full w-full border-0"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          </div>
        </section>
      ) : null}
    </div>
  )
}
