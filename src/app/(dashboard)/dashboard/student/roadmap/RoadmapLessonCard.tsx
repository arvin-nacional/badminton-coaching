'use client'

import { ChevronDown, Clock3, Target } from 'lucide-react'
import Image from 'next/image'
import { useState, type KeyboardEvent } from 'react'

import { TrainingVideoLinks } from '@/components/Dashboard/TrainingVideoLinks'
import type { Drill } from '@/payload-types'
import { drillIllustrationFor } from '@/utilities/drillIllustration'
import type { TrainingVideo } from '@/utilities/trainingVideos'

type DrillSummary = {
  id: string
  name: string
  durationMinutes: number
  difficulty: string
  illustrationURL?: string | null
}

type RoadmapLessonCardProps = {
  week: number
  title: string
  objective: string
  durationMinutes: number
  lessonType: string
  successCriteria: string
  isCurrent: boolean
  isCompleted: boolean
  sitsRight: boolean
  order: number
  sessionDrillCount: number
  homeDrillCount: number
  practiceTitle: string
  practiceInstructions?: string | null
  videos: TrainingVideo[]
  sessionDrills: DrillSummary[]
  homeDrills: DrillSummary[]
}

const DrillGrid = ({ drills, isCurrent }: { drills: DrillSummary[]; isCurrent: boolean }) => (
  <div className="mt-3 grid gap-2 sm:grid-cols-2">
    {drills.map((drill) => {
      const illustration = drillIllustrationFor(drill)

      return (
        <div
          key={drill.id}
          className={`flex items-center gap-3 rounded-xl p-2 ${
            isCurrent ? 'bg-white/10' : 'bg-white'
          }`}
        >
          <div
            className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg ${
              isCurrent ? 'bg-white/10' : 'bg-[#eef3f8]'
            }`}
          >
            {illustration ? (
              <Image
                src={illustration}
                alt={`${drill.name} drill illustration`}
                fill
                sizes="56px"
                className="object-cover"
                // Lazy-load: don't request the image until it's near the viewport.
                loading="lazy"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Target className={`h-5 w-5 ${isCurrent ? 'text-[#4cc9ff]' : 'text-[#1677ff]'}`} />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p
              className={`text-xs font-black leading-4 ${
                isCurrent ? 'text-white' : 'text-[#092c59]'
              }`}
            >
              {drill.name}
            </p>
            <p
              className={`mt-1 text-[10px] font-bold ${
                isCurrent ? 'text-white/55' : 'text-[#718399]'
              }`}
            >
              {drill.durationMinutes} min · {drill.difficulty}
            </p>
          </div>
        </div>
      )
    })}
  </div>
)

export function RoadmapLessonCard({
  week,
  title,
  objective,
  durationMinutes,
  lessonType,
  successCriteria,
  isCurrent,
  isCompleted,
  sitsRight,
  order,
  sessionDrillCount,
  homeDrillCount,
  practiceTitle,
  practiceInstructions,
  videos,
  sessionDrills,
  homeDrills,
}: RoadmapLessonCardProps) {
  const [expanded, setExpanded] = useState(false)

  function toggle() {
    setExpanded((value) => !value)
  }

  function handleKey(event: KeyboardEvent<HTMLElement>) {
    if (event.target !== event.currentTarget) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      toggle()
    }
  }

  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className={`absolute top-[2.625rem] hidden h-0.5 w-12 md:block ${
          sitsRight ? 'left-1/2' : 'right-1/2'
        } ${isCurrent ? 'bg-[#1677ff]' : isCompleted ? 'bg-[#2b9f6a]' : 'bg-[#c7d4e3]'}`}
      />
      <div
        className={`absolute left-2 top-6 z-20 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border-4 border-[#edf5ff] text-xs font-black shadow-sm md:left-1/2 ${
          isCurrent
            ? 'bg-[#1677ff] text-white ring-4 ring-[#1677ff]/15'
            : isCompleted
              ? 'bg-[#2b9f6a] text-white'
              : 'bg-white text-[#718399]'
        }`}
      >
        {isCompleted ? (
          <Target className="h-4 w-4" />
        ) : isCurrent ? (
          <Target className="h-4 w-4" />
        ) : (
          week
        )}
      </div>

      <article
        tabIndex={0}
        aria-label={`Week ${week}: ${title}. Press Enter to ${expanded ? 'collapse' : 'expand'} session and home-practice drills.`}
        onClick={toggle}
        onKeyDown={handleKey}
        className={`group ml-12 cursor-pointer rounded-2xl border p-5 shadow-[0_14px_35px_-30px_rgba(9,44,89,.65)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_-30px_rgba(22,119,255,.6)] focus:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-[#1677ff]/20 md:ml-0 md:w-[calc(50%-3rem)] ${
          sitsRight ? 'md:ml-auto' : 'md:mr-auto'
        } ${
          isCurrent
            ? 'border-[#1677ff] bg-[#092c59] text-white shadow-[0_20px_45px_-25px_rgba(22,119,255,.75)]'
            : isCompleted
              ? 'border-[#2b9f6a]/20 bg-white'
              : 'border-[#092c59]/10 bg-white/90'
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p
              className={`text-xs font-black uppercase tracking-[.12em] ${
                isCurrent ? 'text-[#4cc9ff]' : 'text-[#1677ff]'
              }`}
            >
              {isCurrent ? 'You are here · ' : ''}Week {week}
            </p>
            <h4
              className={`mt-1 text-lg font-black ${isCurrent ? 'text-white' : 'text-[#092c59]'}`}
            >
              {title}
            </h4>
          </div>
          <span
            className={`flex items-center gap-1.5 text-xs font-bold ${
              isCurrent ? 'text-white/60' : 'text-[#718399]'
            }`}
          >
            <Clock3 className={`h-4 w-4 ${isCurrent ? 'text-[#4cc9ff]' : 'text-[#1677ff]'}`} />
            {durationMinutes} min
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <span
            className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${
              isCurrent ? 'bg-white/10 text-white/75' : 'bg-[#f3f7fc] text-[#607286]'
            }`}
          >
            {lessonType.replace('-', ' ')}
          </span>
          {isCompleted ? (
            <span className="rounded-full bg-[#e1f5e9] px-3 py-1 text-[10px] font-black uppercase text-[#24734b]">
              Completed
            </span>
          ) : null}
        </div>
        <p className={`mt-3 text-sm leading-6 ${isCurrent ? 'text-white/70' : 'text-[#607286]'}`}>
          {objective}
        </p>
        {isCurrent ? (
          <div className="mt-4 rounded-xl bg-white/10 p-4 text-sm leading-6 text-white/80">
            <strong className="text-[#4cc9ff]">Success target:</strong> {successCriteria}
          </div>
        ) : null}

        <div
          className={`mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-xs font-bold ${
            isCurrent ? 'border-white/15 text-white/65' : 'border-[#092c59]/10 text-[#607286]'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Target className={`h-4 w-4 ${isCurrent ? 'text-[#4cc9ff]' : 'text-[#1677ff]'}`} />
            Session + home drills
          </span>
          <span className="flex items-center gap-1.5">
            {videos.length ? `${videos.length} video · ` : ''}
            {sessionDrillCount} coached · {homeDrillCount} home
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-300 ${
                expanded ? 'rotate-180' : ''
              }`}
            />
          </span>
        </div>

        {expanded ? (
          <div className="mt-3">
            {videos.length ? (
              <div
                className={`mb-3 rounded-xl border p-4 ${
                  isCurrent ? 'border-white/10 bg-white/10' : 'border-[#1677ff]/15 bg-[#f6f9fd]'
                }`}
              >
                <p
                  className={`text-[10px] font-black uppercase tracking-[.14em] ${
                    isCurrent ? 'text-[#4cc9ff]' : 'text-[#1677ff]'
                  }`}
                >
                  Watch before practice
                </p>
                <h5
                  className={`mb-3 mt-1 font-black ${isCurrent ? 'text-white' : 'text-[#092c59]'}`}
                >
                  Technique guides
                </h5>
                <TrainingVideoLinks videos={videos} tone={isCurrent ? 'dark' : 'light'} />
              </div>
            ) : null}
            <div
              className={`mb-3 rounded-xl border p-4 ${
                isCurrent ? 'border-white/10 bg-white/10' : 'border-[#1677ff]/15 bg-[#f6f9fd]'
              }`}
            >
              <p
                className={`text-[10px] font-black uppercase tracking-[.14em] ${
                  isCurrent ? 'text-[#4cc9ff]' : 'text-[#1677ff]'
                }`}
              >
                Coached session
              </p>
              <h5 className={`mt-1 font-black ${isCurrent ? 'text-white' : 'text-[#092c59]'}`}>
                Drills for this lesson
              </h5>
              {sessionDrills.length ? (
                <DrillGrid drills={sessionDrills} isCurrent={isCurrent} />
              ) : (
                <p className={`mt-2 text-sm ${isCurrent ? 'text-white/65' : 'text-[#607286]'}`}>
                  Session drills are being prepared.
                </p>
              )}
            </div>
            <div
              className={`rounded-xl border p-4 ${
                isCurrent ? 'border-white/10 bg-white/10' : 'border-[#1677ff]/15 bg-[#f6f9fd]'
              }`}
            >
              <p
                className={`text-[10px] font-black uppercase tracking-[.14em] ${
                  isCurrent ? 'text-[#4cc9ff]' : 'text-[#1677ff]'
                }`}
              >
                At-home plan
              </p>
              <h5 className={`mt-1 font-black ${isCurrent ? 'text-white' : 'text-[#092c59]'}`}>
                {practiceTitle}
              </h5>
              {practiceInstructions ? (
                <p
                  className={`mt-2 text-sm leading-6 ${
                    isCurrent ? 'text-white/70' : 'text-[#607286]'
                  }`}
                >
                  {practiceInstructions}
                </p>
              ) : null}
              {!isCurrent ? (
                <p className="mt-3 text-xs leading-5 text-[#607286]">
                  <strong className="text-[#092c59]">Success target:</strong> {successCriteria}
                </p>
              ) : null}
              {homeDrills.length ? <DrillGrid drills={homeDrills} isCurrent={isCurrent} /> : null}
            </div>
          </div>
        ) : null}
      </article>
    </div>
  )
}
