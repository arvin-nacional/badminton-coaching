function Skeleton({ className = '' }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`block animate-pulse rounded-full bg-[#dce7f3] motion-reduce:animate-none ${className}`}
    />
  )
}

function RoadmapPanelSkeleton({ className = '' }: { className?: string }) {
  return (
    <section
      aria-hidden="true"
      className={`rounded-[1.6rem] border border-[#092c59]/10 bg-white p-6 shadow-[0_12px_40px_-30px_rgba(9,44,89,.35)] ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="w-full max-w-sm">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="mt-3 h-3 w-52 max-w-full" />
        </div>
        <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
      </div>
      <div className="mt-7 space-y-3">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </section>
  )
}

function LessonSkeleton({ sitsRight = false }: { sitsRight?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={`relative ml-10 md:ml-0 md:flex ${sitsRight ? 'md:justify-end' : 'md:justify-start'}`}
    >
      <span className="absolute -left-[2.65rem] top-8 h-5 w-5 animate-pulse rounded-full border-4 border-white bg-[#9fc9f7] shadow md:left-1/2 md:-translate-x-1/2 motion-reduce:animate-none" />
      <div className="w-full rounded-[1.5rem] border border-[#092c59]/10 bg-white p-5 shadow-[0_16px_45px_-34px_rgba(9,44,89,.55)] md:w-[calc(50%-2rem)]">
        <div className="flex items-start justify-between gap-4">
          <div className="w-full">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-3 h-5 w-3/4" />
          </div>
          <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
        </div>
        <Skeleton className="mt-5 h-3 w-full" />
        <Skeleton className="mt-2 h-3 w-5/6" />
        <div className="mt-5 flex gap-2">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-7 w-28" />
        </div>
      </div>
    </div>
  )
}

export default function RoadmapLoading() {
  return (
    <main
      className="px-5 py-10 md:px-8"
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading your roadmap"
    >
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-9 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="w-full max-w-2xl">
            <Skeleton className="h-3 w-36 bg-[#a9d1ff]" />
            <Skeleton className="mt-4 h-11 w-80 max-w-[85%]" />
            <Skeleton className="mt-4 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-4/5" />
          </div>
          <Skeleton className="h-12 w-36 bg-[#c4d4e6]" />
        </div>

        <div className="grid gap-5 lg:grid-cols-12">
          <RoadmapPanelSkeleton className="lg:col-span-5" />
          <RoadmapPanelSkeleton className="lg:col-span-7" />

          <section className="lg:col-span-12" aria-hidden="true">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <Skeleton className="h-3 w-28 bg-[#a9d1ff]" />
                <Skeleton className="mt-3 h-7 w-40" />
              </div>
              <div className="hidden gap-3 sm:flex">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[2rem] border border-[#092c59]/10 bg-[linear-gradient(180deg,#f8fbff_0%,#edf5ff_48%,#f8fbff_100%)] p-4 sm:p-8">
              <div className="absolute bottom-16 left-6 top-32 w-1 rounded-full bg-[#d6e2ef] md:left-1/2 md:-translate-x-1/2" />
              <div className="relative z-10 space-y-10">
                <div className="mx-auto max-w-xl rounded-[1.75rem] border border-[#092c59]/10 bg-white p-6 text-center shadow-sm">
                  <Skeleton className="mx-auto h-11 w-11 rounded-2xl" />
                  <Skeleton className="mx-auto mt-4 h-3 w-36 bg-[#a9d1ff]" />
                  <Skeleton className="mx-auto mt-3 h-7 w-52" />
                  <Skeleton className="mx-auto mt-3 h-3 w-4/5" />
                </div>
                <div className="space-y-6">
                  <LessonSkeleton />
                  <LessonSkeleton sitsRight />
                  <LessonSkeleton />
                  <LessonSkeleton sitsRight />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
