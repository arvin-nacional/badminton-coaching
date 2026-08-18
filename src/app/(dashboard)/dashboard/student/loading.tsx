function Skeleton({ className = '' }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`block animate-pulse rounded-full bg-[#dce7f3] motion-reduce:animate-none ${className}`}
    />
  )
}

function PanelSkeleton({
  children,
  className = '',
  dark = false,
}: {
  children?: React.ReactNode
  className?: string
  dark?: boolean
}) {
  return (
    <section
      aria-hidden="true"
      className={`rounded-[1.6rem] border p-6 shadow-[0_12px_40px_-30px_rgba(9,44,89,.35)] ${
        dark ? 'border-[#092c59] bg-[#092c59]' : 'border-[#092c59]/10 bg-white'
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="w-full max-w-sm">
          <Skeleton className={dark ? 'h-5 w-40 bg-white/25' : 'h-5 w-40'} />
          <Skeleton className={dark ? 'mt-3 h-3 w-48 bg-white/15' : 'mt-3 h-3 w-48'} />
        </div>
        <Skeleton
          className={
            dark ? 'h-10 w-10 shrink-0 rounded-xl bg-white/15' : 'h-10 w-10 shrink-0 rounded-xl'
          }
        />
      </div>
      {children}
    </section>
  )
}

export default function StudentDashboardLoading() {
  return (
    <main
      className="px-5 py-10 md:px-8"
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading your dashboard"
    >
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-9 max-w-2xl">
          <Skeleton className="h-3 w-40 bg-[#a9d1ff]" />
          <Skeleton className="mt-4 h-11 w-64 max-w-[80%]" />
          <Skeleton className="mt-4 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-3/4" />
        </div>

        <div className="grid gap-5 lg:grid-cols-12">
          <PanelSkeleton dark className="lg:col-span-8">
            <Skeleton className="mt-8 h-8 w-3/4 bg-[#4cc9ff]/35" />
            <Skeleton className="mt-4 h-4 w-full bg-white/15" />
            <Skeleton className="mt-2 h-4 w-5/6 bg-white/15" />
            <div className="mt-6 flex gap-3">
              <Skeleton className="h-9 w-52 bg-white/15" />
              <Skeleton className="h-9 w-32 bg-white/25" />
            </div>
          </PanelSkeleton>

          <PanelSkeleton className="lg:col-span-4">
            <Skeleton className="mt-8 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-4/5" />
            <Skeleton className="mt-6 h-12 w-40 bg-[#c8d8e9]" />
          </PanelSkeleton>

          <PanelSkeleton className="lg:col-span-12">
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[0, 1, 2].map((item) => (
                <div key={item} className="rounded-2xl bg-[#f3f7fc] p-4">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="mt-4 h-8 w-20" />
                  <Skeleton className="mt-3 h-3 w-full" />
                </div>
              ))}
            </div>
            <Skeleton className="mt-5 h-12 w-44 bg-[#c8d8e9]" />
          </PanelSkeleton>

          <PanelSkeleton className="lg:col-span-6">
            <div className="mt-8 space-y-5">
              {[0, 1, 2].map((item) => (
                <div key={item}>
                  <div className="flex justify-between gap-4">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <Skeleton className="mt-3 h-2.5 w-full" />
                </div>
              ))}
            </div>
          </PanelSkeleton>

          <PanelSkeleton className="lg:col-span-6">
            <div className="mt-8 space-y-3">
              {[0, 1, 2].map((item) => (
                <div key={item} className="rounded-2xl bg-[#f3f7fc] p-4">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="mt-3 h-3 w-1/2" />
                </div>
              ))}
            </div>
          </PanelSkeleton>

          <PanelSkeleton className="lg:col-span-12">
            <div className="mt-8 flex flex-col gap-4 rounded-2xl bg-[#f3f7fc] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="w-full max-w-lg">
                <Skeleton className="h-3 w-48 bg-[#a9d1ff]" />
                <Skeleton className="mt-3 h-5 w-72 max-w-full" />
                <Skeleton className="mt-2 h-3 w-56 max-w-full" />
              </div>
              <Skeleton className="h-12 w-44 shrink-0 bg-[#c8d8e9]" />
            </div>
          </PanelSkeleton>
        </div>
      </div>
    </main>
  )
}
