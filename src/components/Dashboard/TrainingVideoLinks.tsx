'use client'

import { ExternalLink, PlayCircle } from 'lucide-react'
import type { KeyboardEvent, MouseEvent } from 'react'

import type { TrainingVideo } from '@/utilities/trainingVideos'

type TrainingVideoLinksProps = {
  videos: TrainingVideo[]
  tone?: 'light' | 'dark'
}

export function TrainingVideoLinks({ videos, tone = 'light' }: TrainingVideoLinksProps) {
  const stopClick = (event: MouseEvent<HTMLAnchorElement>) => event.stopPropagation()
  const stopKeyDown = (event: KeyboardEvent<HTMLAnchorElement>) => event.stopPropagation()

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {videos.map((video) => (
        <a
          key={video.url}
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={stopClick}
          onKeyDown={stopKeyDown}
          className={`group/video flex items-center gap-3 rounded-2xl border p-4 transition focus-visible:outline-2 focus-visible:outline-offset-2 ${
            tone === 'dark'
              ? 'border-white/15 bg-white/10 text-white hover:bg-white/15 focus-visible:outline-[#4cc9ff]'
              : 'border-[#1677ff]/15 bg-white text-[#092c59] hover:border-[#1677ff]/35 hover:bg-[#eaf3ff] focus-visible:outline-[#1677ff]'
          }`}
          aria-label={`Watch the ${video.title} technique tutorial in a new tab`}
        >
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
              tone === 'dark' ? 'bg-white/10 text-[#4cc9ff]' : 'bg-[#eaf3ff] text-[#1677ff]'
            }`}
          >
            <PlayCircle className="h-6 w-6" />
          </span>
          <span className="min-w-0 flex-1">
            <span
              className={`block text-[10px] font-black uppercase tracking-[.12em] ${
                tone === 'dark' ? 'text-[#4cc9ff]' : 'text-[#1677ff]'
              }`}
            >
              Watch technique
            </span>
            <strong className="mt-1 block text-sm leading-5">{video.title}</strong>
            <span
              className={`mt-1 block text-xs ${tone === 'dark' ? 'text-white/55' : 'text-[#718399]'}`}
            >
              {video.source} · opens in a new tab
            </span>
          </span>
          <ExternalLink
            className={`h-4 w-4 shrink-0 transition-transform group-hover/video:-translate-y-0.5 group-hover/video:translate-x-0.5 ${
              tone === 'dark' ? 'text-white/45' : 'text-[#718399]'
            }`}
          />
        </a>
      ))}
    </div>
  )
}
